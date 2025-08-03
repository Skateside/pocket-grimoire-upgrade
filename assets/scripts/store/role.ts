import type {
    IRole,
    IRoleJinx,
    IRoleMeta,
    IRoleReminder,
    IRoleScript,
    IRoleDeprecatedReminders,
} from "../types/data";
import type {
    RequireOnly,
} from "../types/lib";
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
} from "../../errors";

const useRoleStore = defineStore("role", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "script";

    // TODO: Add functionality for augments.
    // TODO: Work out how to augment the reminders.

    const innerSetRemindersRole = <TRole extends IRoleScript[0]>(role: TRole) => {

        if (typeof role === "object") {

            (role as IRole).reminders?.forEach((reminder) => {
                reminder.role = role as IRole;
            });

        }

        return role;

    };

    const innerUnsetRemindersRole = <TRole extends IRoleScript[0]>(role: TRole) => {

        // This should never happen because the script should always be a role
        // or the meta information, since `setScript` sorts that out.
        if (typeof role === "string") {
            return role;
        }

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
    const scripts = ref<Record<string, IRoleScript>>(
        structuredClone(window.PG.scripts)
    );
    const script = ref<IRoleScript>([
        ...storage.get<IRoleScript>(STORAGE_KEY, []),
    ]);

    watch(script, (value) => {
        // When saving a script, remove each reminder's role to prevent a
        // circular reference.
        storage.set(STORAGE_KEY, value.map(innerUnsetRemindersRole));
    });

    const innerIsMeta = (id: IRole["id"]) => id === "_meta";
    const innerIsUniversal = (id: IRole["id"]) => id === "universalinfo";

    const innerAsRoleObject = (roleOrId: IRole | IRoleMeta | IRole["id"]) => {
        return (
            typeof roleOrId === "string"
            ? ({ id: roleOrId } as RequireOnly<IRole, "id">)
            : roleOrId
        );
    };

    const innerGetRole = (id: IRole["id"]) => {
        return roles.value.find(({ id: roleId }) => roleId === id);
    };

    const innerGetScriptRole = (id: IRole["id"]) => {

        return script.value.find((role) => {

            if (role === id) {
                return true;
            }

            const { id: roleId } = innerAsRoleObject(role);

            if (roleId === id && !innerIsMeta(roleId)) {
                return true;
            }

            return false;

        });

    };

    const innerGetMeta = (script: IRoleScript) => {

        return script.find((item) => {
            return innerIsMeta(innerAsRoleObject(item).id);
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
            throw new UnrecognisedRoleError(id);
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

    const innerGetImage = (role: IRole, index: 0 | 1 | 2 = 0) => {

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

    // const getReminders = computed(() => (role: IRole) => {
    //     return role.reminders || [];
    // });

    const getReminderImage = computed(() => (reminder: IRoleReminder, index: 0 | 1 | 2 = 0) => {
        return reminder.image || innerGetImage(reminder.role, index);
    });

    const getIsMeta = computed(() => (role: IRole) => innerIsMeta(role.id));
    const getIsUniversal = computed(() => (role: IRole) => innerIsUniversal(role.id));
    const getScriptMeta = computed(() => innerGetMeta);

    const getIsValidScript = computed(() => (value: any): value is IRoleScript => {
        // TODO: Actually validate the script.
        console.log({ value });
        return true;
    });

    const getScriptById = computed(() => (id: string) => scripts.value[id]);

    const hasScript = computed(() => script.value.length > 0);

    const innerUpdateReminders = (role: IRole | IRoleDeprecatedReminders): IRole => {

        const reminders: IRoleReminder[] = [];

        if (!role.reminders && !(role as IRoleDeprecatedReminders).remindersGlobal) {
            return role;
        }

        role.reminders?.forEach((reminder) => {

            if (typeof reminder === "object") {
                reminders.push(reminder);
                return;
            }

            const found = reminders.find(({ name }) => name === reminder);

            if (found) {
                found.count = (found.count || 1) + 1;
            } else {
                
                const newReminder: IRoleReminder = {
                    role, // needed for TypeScript, gets set again in the next step.
                    name: reminder as string,
                };
                reminders.push(newReminder);

            }

        });

        (role as IRoleDeprecatedReminders).remindersGlobal?.forEach((reminder) => {

            const found = reminders.find(({ name }) => name === reminder);

            if (found) {
                found.count = (found.count || 1) + 1;
            } else {
                
                const newReminder: IRoleReminder = {
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

    const setScript = (scriptData: IRoleScript) => {

        script.value = scriptData.map((data) => {

            const role = (
                typeof data === "string"
                ? innerGetRole(data)
                : data
            );

            if (!role) {
                throw new UnrecognisedRoleError(String(data));
            }

            return innerSetRemindersRole(innerUpdateReminders(role as IRole));

        });

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
        // getReminders,
        getReminderImage,
        getIsMeta,
        getIsUniversal,
        getScriptMeta,
        getIsValidScript,
        getScriptById,
        hasScript,
        // Actions.
        setScript,
        setScriptById,
    };

});

export default useRoleStore;
