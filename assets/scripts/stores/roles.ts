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
    addNightOrders,
    checkScriptImportValidity,
    convertRole,
    convertScriptToData,
    getImage as helperGetImage,
    getReminderCount as helperGetReminderCount,
    getScriptMeta as helperGetScriptMeta,
    getSpecial as helperGetSpecial,
    isBagDisabled,
    isBasicRole,
    isDeprecatedScriptEntry,
    isMetaEntry,
    isSpecial,
    isUniversal,
    isValidReminderImport,
    isValidRoleImport,
    isValidScriptImport,
    mergeRoles,
    parseReminderId,
    sortByTeam,
} from "../helpers/roles";
import { findBestMatch } from "../utilities/strings";
import {
    clone,
    deepFreeze,
    deepThaw,
    isObject,
    isString,
} from "../utilities/objects";
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
                    || !isValidScriptImport(script)
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
            script.value.filter(isBasicRole),
            (role) => role.team || "",
        ) as Record<ERoleTeam, IRole[]>;

    });
    const nightOrder = computed(() => {

        const metaEntry = script.value.find(isMetaEntry);
        const nightOrder: IRoleNightOrder = {
            first: [],
            other: [],
        };

        if (!metaEntry) {
            return nightOrder;
        }
        
        nightOrder.first = (metaEntry.firstNight ?? [])
            .map(innerGetRoleById)
            .filter(Boolean) as IRole[];
        nightOrder.other = (metaEntry.otherNight ?? [])
            .map(innerGetRoleById)
            .filter(Boolean) as IRole[];

        return nightOrder;

    });
    const importReport = reactive<{
        errors: string[],
        invalid: IRoleCheckResults["invalid"],
        valid: IScriptFull,
        validCount: number,
    }>({
        errors: [],
        invalid: [],
        valid: [],
        validCount: 0,
    });
    const chosenIds = ref<IRole["id"][]>([]);

    const innerGetActiveNightOrder = (active: IRole["id"][]) => {

        return {
            first: nightOrder.value.first
                .filter(({ id }) => active.includes(id))
                .map(({ id }) => id),
            other: nightOrder.value.other
                .filter(({ id }) => active.includes(id))
                .map(({ id }) => id),
        };

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

    const getIsBagDisabled = computed(() => isBagDisabled);
    const getIsBasicRole = computed(() => isBasicRole);
    const getIsMeta = computed(() => isMetaEntry);
    const getIsUniversal = computed(() => isUniversal);
    const getReminderCount = computed(() => helperGetReminderCount);
    const getRoleById = computed(() => innerGetRoleById);
    const getScriptById = computed(() => (scriptId: string) => {
        return scripts.value[scriptId];
    });
    const getScriptMeta = computed(() => helperGetScriptMeta);
    const getSpecial = computed(() => helperGetSpecial);

    const getIsSpecialById = computed(() => (roleId: IRole["id"]) => {
        const role = innerGetRoleById(roleId);
        return role?.edition === ERoleEdition.SPECIAL;
    });

    const innerGetIsOrphanById = (roleId: IRole["id"]) => {

        if (script.value.find(({ id }) => id === roleId)) {
            return false;
        }

        const role = innerGetRoleById(roleId);

        if (!role) {
            return true;
        }

        return ![
            ERoleTeam.TRAVELLER,
            ERoleTeam.FABLED,
            ERoleTeam.LORIC,
        ].includes(role.team);

    };
    const getIsOrphanById = computed(() => innerGetIsOrphanById);
    const getIsOrphanReminderById = computed(() => (
        reminderId: IReminder["id"]
    ) => {

        const { index, roleId } = parseReminderId(reminderId);

        if (index < 0 || !roleId || innerGetIsOrphanById(roleId)) {
            return true;
        }

        return index >= (innerGetRoleById(roleId)?.reminders?.length ?? 0);

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

    const innerGetUnrecognisedReminder = () => {
        const role = innerGetRoleById(ERoleId.UNRECOGNISED)!;
        return role.reminders![0];
    };

    const interpretReminder = computed(() => (
        reminder: IReminder | IReminder["id"] | null | void,
    ) => {

        if (!reminder) {
            return innerGetUnrecognisedReminder();
        }

        if (isValidReminderImport(reminder)) {
            return reminder;
        }

        const { index, roleId } = parseReminderId(reminder);

        if (!roleId) {
            return innerGetUnrecognisedReminder();
        }

        const role = innerGetRoleById(roleId);

        if (!role || !role.reminders || !Object.hasOwn(role.reminders, index)) {
            return innerGetUnrecognisedReminder();
        }

        return role.reminders[index];

    });

    const clearImportReport = () => {
        importReport.errors.length = 0;
        importReport.invalid.length = 0;
        importReport.valid.length = 0;
        importReport.validCount = 0;
    };

    const checkImport = (
        rawScript: (
            IScriptImport
            | IScriptDataEntry
            | DeepReadonly<IScriptDataEntry>
        )
    ) => {

        clearImportReport();

        if (!Array.isArray(rawScript)) {

            importReport.errors.push("The given script is not an array."); // TODO: i18n
            return false;

        }

        // importReport.valid.push(...deepThaw(specialRoles.value));
        const checked = checkScriptImportValidity(rawScript);
        checked.invalid.forEach((invalid) => importReport.invalid.push(invalid));
        let foundMeta = false;

        checked.valid.forEach((entry) => {

            const isMeta = isMetaEntry(entry);
            
            if (isMeta && foundMeta) {
                importReport.errors.push("Multiple meta entries, only the first will be used."); // TODO: i18n
                return;
            } else if (isMeta) {

                importReport.valid.push(entry);
                foundMeta = true;
                return;

            }

            const isEntryString = isString(entry);

            if (isEntryString || isDeprecatedScriptEntry(entry)) {

                const roleId = (
                    isEntryString
                    ? entry
                    : entry.id
                );
                const role = innerGetRoleById(roleId);

                if (role) {
                    importReport.valid.push(deepThaw(role));
                } else {

                    const ids = roles.value.map(({ id }) => id);
                    const bestMatch = findBestMatch(roleId, ids);
                    importReport.invalid.push({
                        role: { id: roleId },
                        reasons: [
                            `Unrecognised ID "${roleId}" - did you mean "${bestMatch.match}"?`
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

                importReport.invalid.push(invalid);
                return console.warn(invalid.reasons[0], invalid.role);

            }

            const original = innerGetRoleById(entry.id);
            const merged = mergeRoles(original, converted);

            if (!merged) {

                const invalid = {
                    role: entry,
                    reasons: ["Failure during role merge"], // TODO: i18n
                };

                importReport.invalid.push(invalid);
                return console.warn(invalid.reasons[0], invalid.role);

            }

            importReport.valid.push(merged);

        });

        importReport.validCount = (
            importReport.valid.length - specialRoles.value.length
        );

        return importReport.invalid.length === 0;

    };

    const setScriptFromImport = () => {

        const entries: IScriptFull = [
            ...deepThaw(specialRoles.value),
            ...clone(toRaw(importReport.valid))
        ];

        addNightOrders(entries);
        script.value = sortByTeam(entries);

    };

    checkImport(storage.get<IScriptImport>(STORAGE_KEY, Array.isArray, []));
    setScriptFromImport();

    return {
        // Data.
        chosenIds,
        importReport,
        script,
        // Getters.
        roles,
        scripts,
        nightOrder,
        scriptByType,
        getImage,
        getIsBagDisabled,
        getIsBasicRole,
        getIsOrphanById,
        getIsOrphanReminderById,
        getIsMeta,
        getIsSpecialById,
        getIsUniversal,
        getNightOrderById,
        getReminderCount,
        getReminderImage,
        getRoleById,
        getScriptById,
        getScriptMeta,
        getSpecial,
        interpret,
        interpretReminder,
        // Actions.
        checkImport,
        clearImportReport,
        setScriptFromImport,
    }

});

export default rolesStore;
