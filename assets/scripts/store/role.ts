import type {
    IRole,
    IRoleJinx,
    IRoleMeta,
    IRoleReminder,
    IRoleScript,
    IRoleScriptImport,
    IRoleDeprecatedReminders,
    IRoleTeam,
    IRoleAlignment,
} from "../types/data";
// import type {
//     RequireOnly,
// } from "../types/lib";
import type {
    IStorage,
} from "../classes/Storage";
import {
    defineStore,
} from "pinia"
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

const useRoleStore = defineStore("role", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "script";

    // TODO: Add functionality for augments.
    // TODO: Work out how to augment the reminders.

    const innerIsMeta = (role: IRole | IRoleMeta): role is IRoleMeta => role.id === "_meta";
    const innerIsUniversal = (role: IRole) => role.id === "universalinfo";

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

        // This should never happen because the script should always be a role
        // or the meta information, since `setScript` sorts that out.
        // if (typeof role === "string") {
        //     return role;
        // }

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
        structuredClone(window.PG.roles).map(innerSetRemindersRole)
    );
    const scripts = ref<Record<string, IRoleScriptImport>>(
        structuredClone(window.PG.scripts)
    );
    const script = ref<IRoleScript>([
        ...storage.get<IRoleScript>(STORAGE_KEY, []).map(innerSetRemindersRole),
    ]);

    watch(script, (value) => {
        // When saving a script, remove each reminder's role to prevent a
        // circular reference.
        storage.set(STORAGE_KEY, value.map(innerUnsetRemindersRole));
    });

    // const game = 

//     const nightOrder = computed(() => {

//         const order = {
//             first: [],
//             other: [],
//         } as Record<"first" | "other", IRole["id"][]>;

//         if (!script.value) {
//             return order;
//         }

//         const roles = script.value.filter((role) => !innerIsMeta(role))

//         order.first = roles
//             .filter(({ firstNight }) => {
//                 return typeof firstNight === "number" && firstNight > 0;
//             })
//             .sort((roleA, roleB) => Number(roleA.firstNight) - Number(roleB.firstNight))
//             .map(({ id }) => id);
//         order.other = roles
//             .filter(({ otherNight }) => {
//                 return typeof otherNight === "number" && otherNight > 0;
//             })
//             .sort((roleA, roleB) => Number(roleA.otherNight) - Number(roleB.otherNight))
//             .map(({ id }) => id);
// console.log({ order });

//     });

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
        roleJinxes?: IRoleJinx[],
        homebrewJinxes?: IRoleJinx[],
    ) => {

        if (!roleJinxes?.length && !homebrewJinxes?.length) {
            return;
        }

        return (homebrewJinxes || []).reduce((jinxes, { id, reason }) => {

            let index = jinxes.findIndex(({ id: jinxId }) => id === jinxId);

            // If there is no `reason`, the intention is to remove the jinx.
            if (!reason && index > -1) {
                jinxes.splice(index, 1);

            // If there is a `reason`, the intention is to add/update the jinx.
            } else if (reason) {

                const jinx: IRoleJinx = {
                    id,
                    reason,
                    state: "theoretical",
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

    const innerGetImage = (role: IRole, index: IRoleAlignment = 0) => {

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
        index: IRoleAlignment = 0,
    ) => {
        return reminder.image || innerGetImage(reminder.role, index);
    });

    const getIsMeta = computed(() => (role: IRole | IRoleMeta) => innerIsMeta(role));
    const getIsUniversal = computed(() => (role: IRole) => innerIsUniversal(role));
    const getScriptMeta = computed(() => innerGetMeta);

    const getIsValidScript = computed(() => (value: any): value is IRoleScript => {
        // TODO: Actually validate the script.
        console.log({ value });
        return true;
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

    // const getNightOrder = computed(() => (id: IRole["id"], night: "first" | "other") => {

    //     const index = nightOrder.value?.[night].indexOf(id);

    //     if (typeof index === "number" && index > -1) {
    //         return index;
    //     }

    //     return undefined;

    // });

    const hasScript = computed(() => script.value.length > 0);

    const innerUpdateReminders = (role: IRole | IRoleDeprecatedReminders): IRole => {

        const reminders: IRoleReminder[] = [];

        if (!role.reminders && !(role as IRoleDeprecatedReminders).remindersGlobal) {
            return role;
        }

        role.reminders?.forEach((reminder, index) => {

            if (typeof reminder === "object") {
                reminders.push(reminder);
                return;
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
                    flags: ["global"],
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
                ["townsfolk", []],
                ["outsider", []],
                ["minion", []],
                ["demon", []],
                ["traveller", []],
                ["fabled", []],
            ] as [IRoleTeam, IRole[]][])
            .map(([_team, roles]) => roles)
            .flat();

        const meta = roles.find(innerIsMeta);

        if (meta) {
            sorted.unshift(meta);
        }

        return sorted;

    };

    const setScript = (scriptData: IRoleScriptImport) => {

        script.value = innerSortRoles(scriptData.map((data) => {

            const role = (
                typeof data === "string"
                ? innerGetRole(data)
                : data
            );

            if (!role) {
                throw new UnrecognisedRoleError(String(data));
            }

            return innerSetRemindersRole(innerUpdateReminders(role as IRole));

        }));

    }

    const setScriptById = (id: string) => {
        setScript(scripts.value[id] || []);
    };

    return {
        // State.
        roles,
        script,
        scripts,
        hasScript,
        // Getters.
        getById,
        getImage,
        getReminderImage,
        getIsMeta,
        getIsUniversal,
        getScriptMeta,
        getIsValidScript,
        getScriptById,
        getReminderById,
        // getNightOrder,
        // Actions.
        setScript,
        setScriptById,
    };

});

export default useRoleStore;
