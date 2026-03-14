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
import { type DeepReadonly, computed, inject, reactive, ref, toRaw } from "vue";
import {
    checkScriptImportValidity,
    convertRole,
    convertScriptToData,
    getImage as helperGetImage,
    getScriptMeta as helperGetScriptMeta,
    getSpecial as helperGetSpecial,
    isDeprecatedScriptEntry,
    isMetaEntry,
    isSpecial,
    isUniversal,
    isValidRoleImport,
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
    const specialRoles = computed(() => roles.value.filter(isSpecial));
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

    const importReport = reactive<{
        given: number,
        imported: number,
        invalid: IRoleCheckResults["invalid"],
    }>({
        given: 0,
        imported: 0,
        invalid: [],
    });

    const innerGetRoleById = (roleId: IRole["id"]) => {

        const scriptEntry = script.value.find(({ id }) => id === roleId);

        if (scriptEntry) {
            return deepThaw(toRaw(scriptEntry)) as IRole;
        }

        const rolesEntry = roles.value.find(({ id }) => id === roleId);

        if (rolesEntry) {
            return deepThaw(toRaw(rolesEntry)) as IRole;
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

    const clearImportReport = () => {
        importReport.given = 0;
        importReport.imported = 0;
        importReport.invalid.length = 0;
    };

    const setScript = (
        rawScript: (
            IScriptImport
            | IScriptDataEntry
            | DeepReadonly<IScriptDataEntry>
        )
    ) => {

        clearImportReport();

        if (!Array.isArray(rawScript)) {

            importReport.invalid.push({
                role: rawScript,
                reasons: ["script not an array"], // TODO: i18n
            });

            return;

        }

        const entries: IScriptFull = [
            ...deepThaw(specialRoles.value),
        ];
        const checked = checkScriptImportValidity(rawScript);
        checked.invalid.forEach((invalid) => importReport.invalid.push(invalid));

        const validImports: IScriptImport = [...checked.valid];

        checked.valid.forEach((entry, index) => {

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

                    delete validImports[index];

                    const ids = roles.value.map(({ id }) => id);
                    const bestMatch = findBestMatch(id, ids);
                    importReport.invalid.push({
                        role: { id },
                        reasons: [
                            `Unrecognised ID "${id}" - did you mean "${bestMatch.match}"?`
                        ], // TODO: i18n
                    });

                }

                return; // job done

            }

            const converted = convertRole(entry as IRoleImport);

            if (!converted) {

                delete validImports[index];

                const invalid = {
                    role: entry,
                    reasons: ["Unable to convert given entry into a role"], // TODO: i18n
                };

                importReport.invalid.push(invalid);
                return console.warn(invalid.reasons[0], invalid.role);

            }

            const original = innerGetRoleById(entry.id);
            const merged = mergeRoles(original, converted);

            if (!merged) {

                delete validImports[index];

                const invalid = {
                    role: entry,
                    reasons: ["Failure during role merge"], // TODO: i18n
                };

                importReport.invalid.push(invalid);
                return console.warn(invalid.reasons[0], invalid.role);

            }

            entries.push(merged);

        });

        storage.set(STORAGE_KEY, validImports.filter(Boolean));
        script.value = sortByTeam(entries);
        importReport.given = rawScript.length;
        importReport.imported = entries.length - specialRoles.value.length;

        return importReport.invalid.length === 0;

    };

    setScript(storage.get<IScriptImport>(STORAGE_KEY, Array.isArray, []));

    return {
        // Data.
        importReport,
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
        getReminderImage,
        getRoleById,
        getScriptById,
        getScriptMeta,
        getSpecial,
        interpret,
        // Actions.
        clearImportReport,
        setScript,
    }

});

export default rolesStore;
