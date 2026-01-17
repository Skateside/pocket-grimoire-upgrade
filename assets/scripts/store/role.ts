import type {
    IRole,
    IRoleMeta,
    IRoleReminder,
    IRoleScript,
    IRoleScriptImport,
    IRoleDeprecatedReminders,
    IRoleTeam,
    IRoleNightOrder,
    IRoleJinxRaw,
} from "../types/data";
import type {
    IStorage,
} from "../classes/Storage";
import {
    ERoleAlignment,
    ERoleEditions,
    ERoleIds,
    ERoleReminderFlag,
    ERoleTeam,
} from "../types/data";
import {
    defineStore,
} from "pinia";
import {
    computed,
    inject,
    ref,
    watch,
} from "vue";
import {
    UnrecognisedRoleError,
    UnrecognisedReminderError,
} from "../../errors";
import {
    deepThaw,
} from "../utilities/objects";

const useRoleStore = defineStore("role", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "script";

    // TODO: Add functionality for augments.
    // TODO: Work out how to augment the reminders.

    const innerIsMeta = (role: IRole | IRoleMeta): role is IRoleMeta => {
        return role.id === ERoleIds.Meta;
    };
    const innerIsUniversal = (role: IRole) => {
        return role.id === ERoleIds.Universal;
    };

    const innerSetRemindersRole = <TRole extends IRoleScript[0]>(role: TRole) => {

        if (!innerIsMeta(role)) {

            role.reminders?.forEach((reminder, index) => {
                reminder.role = role;
                reminder.id = `${role.id}:${index}`;
            });

        }

        return role;

    };

    const innerUnsetRemindersRole = <TRole extends IRoleScript[0]>(role: TRole) => {

        const clone = { ...role } as IRole;

        if (!clone.reminders) {
            return clone;
        }

        clone.reminders = clone.reminders.map((reminder) => {
            const updated = { ...reminder };
            delete (updated as any).role;
            return updated;
        });

        return clone;

    };

    const roles = ref<IRole[]>(
        // Create each reminder's role reference here so that we can always
        // access it.
        deepThaw(window.PG.roles).map(innerSetRemindersRole)
    );
    const specialRoles = computed(() => roles.value.filter(({ edition }) => (
        edition === ERoleEditions.Special
    )));
    const scripts = ref<Record<string, IRoleScriptImport>>(
        deepThaw(window.PG.scripts)
    );
    const script = ref<IRoleScript>([
        ...storage
            .get<IRoleScript>(STORAGE_KEY, [])
            .map(innerSetRemindersRole),
    ]);
    const hasScript = computed(() => script.value.length > 0);

    const nightOrder = computed(() => {

        const nightOrder: IRoleNightOrder = {
            first: [],
            other: [],
        };

        script.value.forEach((role) => {

            if (innerIsMeta(role)) {
                return; // ignore meta role.
            }

            const { firstNight, otherNight } = role;

            if (firstNight) {

                nightOrder.first.push({
                    role,
                    order: firstNight,
                });

            }

            if (otherNight) {

                nightOrder.other.push({
                    role,
                    order: otherNight,
                });

            }

        });

        nightOrder.first.sort((roleA, roleB) => roleA.order - roleB.order);
        nightOrder.other.sort((roleA, roleB) => roleA.order - roleB.order);

        return nightOrder;

    });

    watch(script, (value) => {
        // When saving a script, remove each reminder's role to prevent a
        // circular reference.
        storage.set(STORAGE_KEY, value.map(innerUnsetRemindersRole));
    });

    const clear = () => {
        script.value.length = 0;
    };

    const innerAsRoleObject = (roleOrId: IRoleScriptImport[0]) => {
        return (
            typeof roleOrId === "string"
            ? ({ id: roleOrId } as IRole)
            : roleOrId as IRole
        );
    };

    const innerGetRole = (id: IRole["id"]) => {
        return roles.value.find(({ id: roleId }) => roleId === id);
    };

    const innerGetScriptRole = (id: IRole["id"]) => {

        return script.value.find((role) => {

            const { id: roleId } = role;

            if (roleId === id && !innerIsMeta(role)) {
                return true;
            }

            return false;

        });

    };

    const innerGetMeta = (script: IRoleScriptImport) => {

        return script.find((item) => {
            return innerIsMeta(innerAsRoleObject(item));
        }) as IRoleMeta | void;

    };

    const innerCombineJinxes = (
        roleJinxes?: IRoleJinxRaw[],
        homebrewJinxes?: IRoleJinxRaw[],
    ) => {

        if (!roleJinxes?.length && !homebrewJinxes?.length) {
            return; // no jinxes, nothing to combine.
        }

        return (homebrewJinxes || []).reduce((jinxes, { id, reason }) => {

            let index = jinxes.findIndex(({ id: jinxId }) => id === jinxId);

            // If there is no `reason`, the intention is to remove the jinx.
            if (!reason && index > -1) {
                jinxes.splice(index, 1);

            // If there is a `reason`, the intention is to add/update the jinx.
            } else if (reason) {

                const jinx: IRoleJinxRaw = {
                    id,
                    reason,
                };

                if (index < 0) {
                    index = jinxes.length;
                }

                jinxes[index] = jinx;

            }

            return jinxes;

        }, [...(roleJinxes || [])]);

    };

    const getById = computed(() => (id: IRole["id"]) => {

        const role = innerGetRole(id);
        const homebrew = innerGetScriptRole(id);

        if (!role && !homebrew) {
            throw new UnrecognisedRoleError(id || "(empty role)");
        }

        const update = innerAsRoleObject(homebrew || id);
        const data = {
            ...(role || {}),
            ...update,
        } as IRole;
        const jinxes = innerCombineJinxes(role?.jinxes, (update as IRole).jinxes);

        if (jinxes) {
            data.jinxes = jinxes;
        }

        // TODO: combineReminders()

        return data;

    });

    const innerGetImage = (
        role: IRole,
        index: ERoleAlignment = ERoleAlignment.Default,
    ) => {

        if (!role || !role.image) {
            return "";
        }

        const { image } = role;

        return (
            Array.isArray(image)
            ? (image[index] || image[0] || "")
            : image
        );

    };

    const getImage = computed(() => innerGetImage);

    const getReminderImage = computed(() => (
        reminder: IRoleReminder,
        index: ERoleAlignment = ERoleAlignment.Default,
    ) => {
        return reminder.image || innerGetImage(reminder.role, index);
    });

    const innerGetIsSpecialById = (id: IRole["id"]) => {
        const role = innerGetRole(id);
        return role?.edition === ERoleEditions.Special;
    };

    const getIsMeta = computed(() => (role: IRole | IRoleMeta) => innerIsMeta(role));
    const getIsUniversal = computed(() => (role: IRole) => innerIsUniversal(role));
    const getScriptMeta = computed(() => innerGetMeta);
    const getIsSpecialById = computed(() => innerGetIsSpecialById);
    const getIsSpecial = computed(() => ({ id }: IRole) => innerGetIsSpecialById(id));

    const getIsValidImport = computed(() => (value: any): value is IRoleScriptImport => {

        return Array.isArray(value) && value.every((entry) => (
            typeof entry === "string"
            || (
                typeof entry === "object"
                && entry !== null
                && Object.hasOwn(entry, "id")
                && typeof entry.id === "string"
            )
        ));

    });

    const getScriptById = computed(() => (id: string) => scripts.value[id]);

    const getReminderById = computed(() => (id: IRoleReminder["id"]) => {

        const [roleId, index] = id.split(":");
        const role = getById.value(roleId);
        const reminder = role.reminders?.[Number(index)];

        if (!reminder) {
            throw new UnrecognisedReminderError(id);
        }

        return reminder;

    });

    const getReminders = computed(() => () => {

        // TODO: filters (probably a parameter)
        const reminders: IRoleReminder[] = [];

        reminders.push(
            ...(roles.value.find(innerIsUniversal)?.reminders || [])
        );

        script.value.forEach((role) => {
            reminders.push(...((role as IRole).reminders || []));
        });

        roles.value
            .filter(({ team }) => team === ERoleTeam.Fabled)
            .forEach((role) => {
                reminders.push(...((role as IRole).reminders || []));
            });

        roles.value
            .filter(({ team }) => team === ERoleTeam.Loric)
            .forEach((role) => {
                reminders.push(...((role as IRole).reminders || []));
            });

        // TODO: add any reminders for roles that have been added to the page
        // but not in the script (such as orphan roles or added travellers).

        return reminders;

    });

    const innerGetActiveNightOrder = (active: IRole["id"][]) => {

        return {
            first: nightOrder.value.first
                .filter(({ role }) => active.includes(role.id))
                .map(({ role }) => role.id),
            other: nightOrder.value.other
                .filter(({ role }) => active.includes(role.id))
                .map(({ role }) => role.id),
        } as Record<keyof IRoleNightOrder, IRole["id"][]>;

    };

    const getNightOrderById = computed(() => (
        roleId?: IRole["id"],
        active: IRole["id"][] = [],
    ) => {

        const myNightOrder: Partial<Record<"first" | "other", number>> = {};

        if (!roleId) {
            return myNightOrder;
        }

        const activeNightOrder = innerGetActiveNightOrder(active);
        const firstIndex = activeNightOrder.first.indexOf(roleId);
        const otherIndex = activeNightOrder.other.indexOf(roleId);

        if (firstIndex > -1) {
            myNightOrder.first = firstIndex + 1;
        }

        if (otherIndex > -1) {
            myNightOrder.other = otherIndex + 1;
        }

        return myNightOrder;

    });

    const getIsOrphan = computed(() => (roleId: IRole["id"]) => (
        !script.value.some(({ id }) => id === roleId)
    ));

    const getIsOrphanReminder = computed(() => (reminderId: IRoleReminder["id"]) => (
        getIsOrphan.value(getReminderById.value(reminderId).role.id)
    ));

    const innerUpdateReminders = (role: IRole | IRoleDeprecatedReminders): IRole => {

        const reminders: IRoleReminder[] = [];

        if (!role.reminders && !(role as IRoleDeprecatedReminders).remindersGlobal) {
            return role;
        }

        role.reminders?.forEach((reminder, index) => {

            if (typeof reminder === "object") {
                reminders.push(reminder);
                return; // reminder is already an object.
            }

            const found = reminders.find(({ name }) => name === reminder);

            if (found) {
                found.count = (found.count || 1) + 1;
            } else {
                
                const newReminder: IRoleReminder = {
                    id: `${role.id}:${index}`,
                    role, // needed for TypeScript, gets set again in the next step.
                    name: reminder as string,
                };
                reminders.push(newReminder);

            }

        });

        const reminderCount = role.reminders?.length || 0;

        (role as IRoleDeprecatedReminders).remindersGlobal?.forEach((reminder, index) => {

            const found = reminders.find(({ name }) => name === reminder);

            if (found) {
                found.count = (found.count || 1) + 1;
            } else {
                
                const newReminder: IRoleReminder = {
                    id: `${role.id}:${reminderCount + index}`,
                    role, // needed for TypeScript, gets set again in the next step.
                    name: reminder as string,
                    flags: [ERoleReminderFlag.Global],
                };
                reminders.push(newReminder);

            }

        });

        role.reminders = reminders;

        return role;

    };

    const innerSortRoles = (roles: IRoleScript) => {

        const sorted: (IRole | IRoleMeta)[] = roles.reduce((groups, role) => {

                if (!innerIsMeta(role)) {
                    groups.find(([team]) => team === role.team)?.[1].push(role);
                }

                return groups;

            }, [
                [ERoleTeam.Townsfolk, []],
                [ERoleTeam.Outsider, []],
                [ERoleTeam.Minion, []],
                [ERoleTeam.Demon, []],
                [ERoleTeam.Traveller, []],
                [ERoleTeam.Fabled, []],
                [ERoleTeam.Loric, []],
            ] as [IRoleTeam, IRole[]][])
            .map(([_team, roles]) => roles)
            .flat();

        const meta = roles.find(innerIsMeta);

        if (meta) {
            sorted.unshift(meta);
        }

        return sorted;

    };

    const innerIsOldScript = (script: unknown): script is Pick<IRole, "id"> => (
        script !== null
        && typeof script === "object"
        && Object.hasOwn(script, "id")
        && Object.keys(script).length === 1
    );

    const setScript = (scriptData: IRoleScriptImport) => {

        const fullScript = [
            ...scriptData,
            ...specialRoles.value,
        ];
        let error = "";

        script.value = innerSortRoles(fullScript.map((data) => {

            const role = (
                typeof data === "string"
                ? innerGetRole(data)
                : (
                    innerIsOldScript(data)
                    ? innerGetRole(data.id)
                    : data
                )
            );

            if (role) {

                return [
                    innerUpdateReminders,
                    innerSetRemindersRole,
                ].reduce((updated, func) => func(updated), role);

            }

            error = JSON.stringify(data);

            // TODO: test to make sure this doesn't cause serious errors.
            // Intention is to allow a script containing a role that hasn't been
            // added to the data yet without the entire system crashing.
            return { id: ERoleIds.NoRole } as IRole;

        }));

        if (error) {
            throw new UnrecognisedReminderError(error);
        }

    }

    const setScriptById = (id: string) => {
        setScript(scripts.value[id] || []);
    };

    return {
        // State.
        roles,
        script,
        scripts,
        // Getters.
        getById,
        getImage,
        getReminderImage,
        getIsMeta,
        getIsSpecial,
        getIsSpecialById,
        getIsUniversal,
        getScriptMeta,
        getIsValidImport,
        getScriptById,
        getReminderById,
        getReminders,
        getNightOrderById,
        getIsOrphan,
        getIsOrphanReminder,
        hasScript,
        nightOrder,
        // Actions.
        clear,
        setScript,
        setScriptById,
    };

});

export default useRoleStore;
