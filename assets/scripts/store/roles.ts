import type {
    IReminder,
    IRole,
    IRoleCheckResults,
    IRoleImport,
    IRoleNightOrder,
    IScriptData,
    IScriptDataEntry,
    IScriptFull,
    IScriptImport,
} from "../types/data";
import type { IStorage } from "../classes/Storage";
import {
    ERoleEdition,
    ERoleId,
    ERoleTeam,
    ETokenAlignment,
} from "../enums/data";
import { defineStore } from "pinia";
import { computed, inject, ref, watch, type DeepReadonly } from "vue";
import {
    checkScriptImportValidity,
    convertRole,
    convertScriptToData,
    getImage as helperGetImage,
    getScriptMeta as helperGetScriptMeta,
    getSpecial as helperGetSpecial,
    isDeprecatedScriptEntry,
    isMetaEntry,
    isUniversal,
    isValidRoleImport,
    isValidScriptImport,
    isValidScriptImportEntry,
    mergeRoles,
    sortByTeam,
} from "../helpers/roles";
import { findBestMatch } from "../utilities/strings";
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
    const invalidRoles = ref<IRoleCheckResults["invalid"]>([]);
    const specialRoles = computed(() => roles.value.filter(({ edition }) => (
        edition === ERoleEdition.SPECIAL
    )));
    const scriptImport = ref<IScriptImport>([]);
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

        const scriptEntry = script.value.find(({ id }) => id === roleId);

        if (scriptEntry) {
            return deepThaw(scriptEntry) as IRole;
        }

        const rolesEntry = roles.value.find(({ id }) => id === roleId);

        if (rolesEntry) {
            return deepThaw(rolesEntry) as IRole;
        }

    };

    const getImage = computed(() => helperGetImage);

    const getReminderImage = computed(() => (
        reminder: IReminder,
        alignment: ETokenAlignment = ETokenAlignment.DEFAULT,
    ) => {

        if (reminder.image) {
            return reminder.image;
        }

        const role = innerGetRoleById(reminder.roleId);

        if (role) {
            return helperGetImage(role, alignment);
        }

        return undefined;

    });

    const getIsMeta = computed(() => isMetaEntry);
    const getIsUniversal = computed(() => isUniversal);
    const getIsValidScriptImport = computed(() => isValidScriptImport);
    const getRoleById = computed(() => innerGetRoleById);
    const getScriptById = computed(() => (id: string) => scripts.value[id]);
    const getScriptMeta = computed(() => helperGetScriptMeta);
    const getSpecial = computed(() => helperGetSpecial);

    const getIsSpecialById = computed(() => (roleId: IRole["id"]) => {
        const role = innerGetRoleById(roleId);
        return role?.edition === ERoleEdition.SPECIAL;
    });

    const interpret = computed(() => (
        role: IRole | IRole["id"] | null | void,
    ) => {

        const { NO_ROLE, META, UNIVERSAL, UNRECOGNISED } = ERoleId;

        if (
            !role
            || role === NO_ROLE
            || (role as IRole).id === NO_ROLE
        ) {
            return innerGetRoleById(NO_ROLE)!;
        }

        if (role === META || isMetaEntry(role as IRole)) {
            return innerGetRoleById(META)!;
        }

        if (role === UNIVERSAL || isUniversal(role as IRole)) {
            return innerGetRoleById(UNIVERSAL)!;
        }

        const roleId = (
            isObject(role)
            ? role.id
            : role
        );
        const entry = innerGetRoleById(roleId);

        if (entry) {
            return entry;
        }

        const unrecognised = innerGetRoleById(UNRECOGNISED)!;

        return {
            ...unrecognised,
            name: `${unrecognised.name}: ${roleId}`,
        } as IRole;

    });

    const clearInvalid = () => {
        invalidRoles.value.length = 0;
    };

    const addInvalid = (invalid: IRoleCheckResults["invalid"][number]) => {
        invalidRoles.value.push(invalid);
    };

    const setScript = (
        rawScript: (
            IScriptImport
            | IScriptDataEntry
            | DeepReadonly<IScriptDataEntry>
        )
    ) => {

        clearInvalid();

        if (!Array.isArray(rawScript)) {

            addInvalid({
                role: rawScript,
                reasons: ["script not an array"], // TODO: i18n
            });

            return;

        }
        
        const entries: IScriptFull = [
            ...deepThaw(specialRoles.value),
        ];
        const checked = checkScriptImportValidity(rawScript);
        checked.invalid.forEach((invalid) => addInvalid(invalid));

        scriptImport.value = checked.valid;

        checked.valid.forEach((entry) => {

            if (isMetaEntry(entry)) {
                entries.push(entry);
                return; // job done
            }

            const isEntryString = isString(entry);

            if (isEntryString || isDeprecatedScriptEntry(entry)) {

                const id = (
                    isEntryString
                    ? entry
                    : entry.id
                );
                const role = innerGetRoleById(id);

                if (role) {
                    entries.push(deepThaw(role));
                } else {

                    const ids = roles.value.map(({ id }) => id);
                    const bestMatch = findBestMatch(id, ids);
                    addInvalid({
                        role: entry,
                        reasons: [
                            `Unrecognised ID "${id}" - did you mean "${bestMatch}"?`
                        ], // TODO: i18n
                    });

                }

                return; // job done

            }

            const converted = convertRole(entry as IRoleImport);

            if (!converted) {

                const invalid = {
                    role: entry,
                    reasons: ["Unable to convert given entry into a role"], // TODO: i18n
                };

                addInvalid(invalid);
                return console.warn(invalid.reasons[0], invalid.role);

            }

            const original = innerGetRoleById(entry.id);
            const merged = mergeRoles(original, converted);

            if (!merged) {

                const invalid = {
                    role: entry,
                    reasons: ["Failure during role merge"],
                };
                addInvalid(invalid);
                return console.warn(invalid.reasons[0], invalid.role);

            }

            entries.push(merged);

        });

        script.value = sortByTeam(entries);

    };

    setScript(storage.get<IScriptImport>(STORAGE_KEY, Array.isArray, []));
    watch(scriptImport, (value) => storage.set(STORAGE_KEY, value));

    return {
        // Data.
        script,
        // Getters.
        roles,
        scripts,
        nightOrder,
        scriptByType,
        getImage,
        getIsMeta,
        getIsSpecialById,
        getIsUniversal,
        getIsValidScriptImport,
        getReminderImage,
        getRoleById,
        getScriptById,
        getScriptMeta,
        getSpecial,
        interpret,
        // Actions.
        clearInvalid,
        setScript,
    }

});

export default rolesStore;
