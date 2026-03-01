import type {
    IRole,
    IRoleImport,
    IRoleNightOrder,
    IScriptData,
    IScriptDataEntry,
    IScriptFull,
    IScriptImport,
} from "../types/data";
import type { IStorage } from "../classes/Storage";
import { ERoleEdition, ERoleTeam } from "../enums/data";
import { defineStore } from "pinia";
import { computed, inject, ref, watch, type DeepReadonly } from "vue";
import {
    convertRole,
    convertScriptToData,
    getImage as helperGetImage,
    getScriptMeta as helperGetScriptMeta,
    getSpecial as helperGetSpecial,
    isDeprecatedScriptEntry,
    isMetaEntry,
    isValidRoleImport,
    isValidScriptImport,
    isValidScriptImportEntry,
    mergeRoles,
    sortByTeam,
} from "../helpers/roles";
import { deepFreeze, deepThaw, isObject, isString } from "../utilities/objects";
import { StorageNotFoundError } from "~/errors";

const rolesStore = defineStore("roles", () => {

    const storage = inject<IStorage>("storage");

    if (!storage) {
        throw new StorageNotFoundError("roles store");
    }

    const STORAGE_KEY = "script";
    const roles = computed(() => {

        const roles: IRole[] = [];

        if (Array.isArray(window.PG?.roles)) {

            window.PG.roles
                .filter((role) => isValidRoleImport(role))
                .map((role) => convertRole(role))
                .filter((role) => role !== null)
                .forEach((role) => roles.push(role));

        }

        return deepFreeze(roles);

    });
    const scripts = computed(() => {

        const scripts: IScriptData = Object.create(null);

        if (isObject(window.PG?.scripts)) {

            const validKeys = Object.values(ERoleEdition);

            Object.entries(window.PG.scripts).forEach(([key, script]) => {

                if (
                    !validKeys.includes(key as ERoleEdition)
                    || !Array.isArray(script)
                    || !script.every((item) => isValidScriptImportEntry(item))
                ) {
                    return; // unrecognised script.
                }

                const converted = convertScriptToData(script);

                if (converted.length) {
                    scripts[key] = converted;
                }

            });

        }

        return deepFreeze(scripts);

    });
    const specialRoles = computed(() => roles.value.filter(({ edition }) => (
        edition === ERoleEdition.SPECIAL
    )));
    const script = ref<IScriptFull>([]);
    const scriptByType = computed(() => {

        return Object.groupBy(
            script.value.filter((role) => (
                !isMetaEntry(role) && role.edition !== ERoleEdition.SPECIAL
            )),
            (role) => (role as IRole).team || "",
        ) as Record<ERoleTeam, IRole[]>;

    });
    const nightOrder = computed(() => {

        const nightOrder: IRoleNightOrder = {
            first: [],
            other: [],
        };

        script.value.forEach((role) => {

            if (isMetaEntry(role)) {
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

    const innerGetRoleById = (roleId: IRole["id"]) => {
        return roles.value.find(({ id }) => id === roleId);
    };

    // const getRoleById = computed(() => innerGetRoleById);

    const getImage = computed(() => helperGetImage);
    const getIsMeta = computed(() => isMetaEntry);
    const getIsValidScriptImport = computed(() => isValidScriptImport);
    const getScriptById = computed(() => (id: string) => scripts.value[id]);
    const getScriptMeta = computed(() => helperGetScriptMeta);
    const getSpecial = computed(() => helperGetSpecial);

    const getIsSpecialById = computed(() => (roleId: IRole["id"]) => {
        const role = innerGetRoleById(roleId);
        return role?.edition === ERoleEdition.SPECIAL;
    });

    const setScript = (
        scriptImport: (
            IScriptImport
            | IScriptDataEntry
            | DeepReadonly<IScriptDataEntry>
        )
    ) => {

        if (!Array.isArray(scriptImport)) {
            return;
        }
        
        const entries: IScriptFull = [
            ...deepThaw(specialRoles.value),
        ];
        const filtered = scriptImport.filter((item) => {
            return isValidScriptImportEntry(item);
        });

        filtered.forEach((entry) => {

            if (isMetaEntry(entry)) {
                entries.push(entry);
                return; // job done
            }

            const isEntryString = isString(entry);

            if (isEntryString || isDeprecatedScriptEntry(entry)) {

                const role = innerGetRoleById(
                    isEntryString
                    ? entry
                    : entry.id
                );

                if (role) {
                    entries.push(deepThaw(role));
                }

                return; // job done

            }

            const converted = convertRole(entry as IRoleImport);

            if (!converted) {

                return console.warn(
                    "Unable to convert given entry into a role",
                    entry,
                );

            }

            const original = innerGetRoleById(entry.id);
            const merged = mergeRoles(original, converted);

            if (!merged) {

                return console.warn(
                    "failure during role merge",
                    { entry, original, converted },
                );

            }

            entries.push(merged);

        });

        script.value = sortByTeam(entries);

    };

    setScript(storage.get<IScriptFull>(STORAGE_KEY, Array.isArray, []));
    watch(script, (value) => storage.set(STORAGE_KEY, value));

    return {
        // Data.
        script,
        // Getters.
        roles,
        scripts,
        nightOrder,
        scriptByType,
        // getRoleById,
        getImage,
        getIsMeta,
        getIsSpecialById,
        getIsValidScriptImport,
        getScriptById,
        getScriptMeta,
        getSpecial,
        // Actions.
        setScript,
    }

});

export default rolesStore;
