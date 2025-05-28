import type {
    IRole,
    IRoleJinx,
    IRoleMeta,
    IRoleReminder,
    IRoleScript,
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

    // TODO: Add functionality for augments.
    // TODO: Work out how to augment the reminders.

    const STORAGE_KEY = "script";
    const roles = ref<IRole[]>(structuredClone(window.PG.roles));
    const scripts = ref<Record<string, IRoleScript>>(
        structuredClone(window.PG.scripts)
    );
    const script = ref<IRoleScript>([
        ...storage.get<IRoleScript>(STORAGE_KEY, []),
    ]);

    watch(script, (value) => {
        storage.set(STORAGE_KEY, value);
    });

    const isMeta = (id: IRole["id"]) => id === "_meta";
    const isUniversal = (id: IRole["id"]) => id === "universalinfo";

    const asRoleObject = (roleOrId: IRole | IRoleMeta | IRole["id"]) => {
        return (
            typeof roleOrId === "string"
            ? ({ id: roleOrId } as RequireOnly<IRole, "id">)
            : roleOrId
        );
    };

    const getRole = (id: IRole["id"]) => {
        return roles.value.find(({ id: roleId }) => roleId === id);
    };

    const getScriptRole = (id: IRole["id"]) => {

        return script.value.find((role) => {

            if (role === id) {
                return true;
            }

            const { id: roleId } = asRoleObject(role);

            if (roleId === id && !isMeta(roleId)) {
                return true;
            }

            return false;

        });

    };

    const getMeta = (script: IRoleScript) => {
        return script.find((item) => isMeta(asRoleObject(item).id)) as IRoleMeta | void;
    };

    const combineJinxes = (
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

        const role = getRole(id);
        const homebrew = getScriptRole(id);

        if (!role && !homebrew) {
            throw new UnrecognisedRoleError(id);
        }

        const update = asRoleObject(homebrew || id);
        const data = {
            ...(role || {}),
            ...update,
        } as IRole;
        const jinxes = combineJinxes(role?.jinxes, (update as IRole).jinxes);

        if (jinxes) {
            data.jinxes = jinxes;
        }

        // TODO: combineReminders()

        return data;

    });

    const getImage = computed(() => (role: IRole, index: 0 | 1 | 2 = 0) => {

        if (!role || !role.image) {
            return "";
        }

        if (Array.isArray(role.image)) {
            return role.image[index];
        }
    
        return role.image;

    });

    // const getReminders = computed(() => (role: IRole) => {
    //     return role.reminders || [];
    // });

    const getReminderImage = computed(() => (reminder: IRoleReminder, role: IRole, index: 0 | 1 | 2 = 0) => {

        if (!role) {
            return "";
        }

        if ((reminder as any).image) {
            return (reminder as any).image as string;
        }

        if (Array.isArray(role.image)) {
            return role.image[index];
        }

        return role.image || "";

    });

    const getIsUniversal = computed(() => (role: IRole) => isUniversal(role.id));
    const getScriptMeta = computed(() => getMeta);

    const getIsValidScript = computed(() => (value: any): value is IRoleScript => {
        // TODO: Actually validate the script.
        return true;
    });

    const getScriptById = computed(() => (id: string) => scripts.value[id]);

    const setScript = (scriptData: IRoleScript) => {
        script.value = scriptData;
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
        getIsUniversal,
        getScriptMeta,
        getIsValidScript,
        getScriptById,
        // Actions.
        setScript,
        setScriptById,
    };

});

export default useRoleStore;
