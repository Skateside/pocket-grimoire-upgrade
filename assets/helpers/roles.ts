import type { DeepReadonly } from "vue";
import type { AnyObject } from "~/types/lib";
import type {
    IJinxImport,
    IReminder,
    IRole,
    IRoleCheck,
    IRoleCheckResults,
    IRoleImport,
    IRoleSpecial,
    IRoleSpecialAbility,
    IRoleSpecialImport,
    IRoleSpecialSignalValue,
    IRoleSpecialVoteValue,
    IScriptDeprecated,
    IScriptData,
    IScriptDataEntry,
    IScriptFull,
    IScriptImport,
    IScriptMeta,
} from "~/types/data";
import {
    EReminderFlag,
    ERoleEdition,
    ERoleId,
    ERoleSpecialGlobal,
    ERoleSpecialName,
    ERoleSpecialTime,
    ERoleSpecialType,
    ERoleTeam,
    ETokenAlignment,
} from "~/enums/data";
import { removeItem, unique, uniqueMap } from "~/utilities/arrays";
import {
    clone,
    deepThaw,
    isBoolean,
    isNumber,
    isPropertyOptionalArrayOf,
    isPropertyOptionalString,
    isPropertyString,
    isString,
    isObject,
    filterObject,
} from "~/utilities/objects";
import { isValidLocalURL, isValidURL } from "~/utilities/strings";

/**
 * Checks to see if the given object is a positive number more than `0`.
 *
 * @param object Object to check.
 * @returns `true` if the object is a positive number, `false` otherwise.
 * @private
 */
function isPositiveNumber(object: unknown): object is number {
    return isNumber(object) && object > 0;
}

/**
 * Checks to see if the given object is a non-empty string.
 *
 * @param object Object to check.
 * @returns `true` if the object is a non-empty string, `false` otherwise.
 * @private
 */
function isPopulatedString(object: unknown): object is string {
    return isString(object) && object.trim() !== "";
}

/**
 * Checks to see if the given object is either a local or remote URL.
 *
 * @param object Object to check.
 * @returns `true` if the object is a URL, `false` otherwise.
 * @private
 */
function isAnyUrl(object: unknown): object is string {

    return (
        isPopulatedString(object)
        && (
            isValidURL(object)
            || isValidLocalURL(object)
        )
    );

}

/**
 * Checks to see if the given `property` on the given `object` matches the given
 * `check`. If the property is considered optional, the property will match if
 * it isn't there.
 *
 * @param object Object whose property should be checked.
 * @param property Property to check.
 * @param check The check, passed the object's property.
 * @param optional Optional flag for whether or not the property is optional.
 * @returns `true` if `check` returns `true` or the property is optional and has
 * not been set on `object`.
 * @private
 */
function propertyMatches(
    object: AnyObject,
    property: string,
    check: (object: any) => boolean,
    optional = false,
) {

    if (optional && !Object.hasOwn(object, property)) {
        return true;
    }

    return check(object[property]);

}

/**
 * Makes a check.
 *
 * @param property Property for the object.
 * @param check Check to pass to {@link propertyMatches}.
 * @param optional Optional flag.
 * @returns Check - with the `check` and `error` properties.
 * @private
 */
function makeCheck(
    property: string,
    check: (object: any) => boolean,
    optional = false,
): IRoleCheck {

    return {
        check(object) {
            return propertyMatches(object, property, check, optional);
        },
        error: (
            optional
            ? `"${property}" is an invalid type` // TODO: i18n
            : `"${property}" is missing or an invalid type` // TODO: i18n
        ),
    };

}

/**
 * Make a check for the night order/reminder.
 *
 * @param property Night to check.
 * @returns Check (see {@link makeCheck}.
 * @private
 */
function makeNightCheck(property: "firstNight" | "otherNight"): IRoleCheck {

    return {
        check(object) {

            if (!Object.hasOwn(object, property)) {
                return true;
            }

            if (!isPositiveNumber(object[property])) {
                return false;
            }

            if (!isPopulatedString(object[`${property}Reminder`])) {
                return false;
            }

            return true;

        },
        error: `"${property}" isn't valid`, // TODO: i18n
    };

}

/**
 * Make a check to see if the given property is an array where every item
 * matches the given check.
 *
 * @param property Property to get.
 * @param check Check passed to {@link propertyMatches}.
 * @param optional Optional flag.
 * @returns Check - see {@link makeCheck}.
 * @private
 */
function makeArrayOfCheck(
    property: string,
    check: (object: any) => boolean,
    optional = false,
) {
    return makeCheck(property, (object) => {
        return Array.isArray(object) && object.every(check);
    }, optional);
}

/**
 * All the checks for a valid role.
 */
const roleChecks: IRoleCheck[] = [
    makeCheck("id", isPopulatedString),
    makeCheck("name", isPopulatedString),
    makeCheck("edition", isPopulatedString, true),
    makeCheck("team", isPopulatedString),
    makeCheck("ability", isPopulatedString),
    makeNightCheck("firstNight"),
    makeNightCheck("otherNight"),
    makeCheck("image", (object) => (
        isAnyUrl(object)
        || (
            Array.isArray(object)
            && object.length > 0
            && object.length <= 3
            && object.every(isAnyUrl)
        )
    ), true),
    makeArrayOfCheck("jinxes", isValidJinxImport, true),
    makeArrayOfCheck("reminders", (object) => (
        isPopulatedString(object) || isValidReminderImport(object)
    ), true),
    makeArrayOfCheck("remindersGlobal", isPopulatedString, true),
    makeCheck("setup", isBoolean, true),
    makeArrayOfCheck("special", isValidSpecialImport, true),
];

/**
 * Filters the given raw night order so that it only includes roles that were
 * successfully added to the script.
 *
 * @param rawNightOrder Unfiltered night order.
 * @param nightSheets An object of the role IDs to the first- and other- nights'
 * positions.
 * @param nightType The type of night (i.e. `"firstNight"` or `"otherNight`).
 * @returns The filtered night order.
 * @private
 */
function filterNightOrder<TNightType extends keyof INightSheets[IRole["id"]]>(
    rawNightOrder: NonNullable<IScriptMeta[TNightType]>,
    nightSheets: INightSheets,
    nightType: TNightType,
): NonNullable<IScriptMeta[TNightType]> {

    const filtered = rawNightOrder.filter((id) => {
        return isNumber(nightSheets[id]?.[nightType]);
    });

    // Add in the special roles of "dawn", "dusk", "minion info", and "demon
    // info" if they're not there already.

    const {
        DAWN,
        DEMON_INFO,
        DUSK,
        MINION_INFO,
        META,
        NO_ROLE,
        UNIVERSAL,
        UNRECOGNISED,
    } = ERoleId;

    if (!filtered.includes(DAWN)) {
        filtered.unshift(DAWN);
    }

    if (nightType === "firstNight" && !filtered.includes(MINION_INFO)) {
        filtered.splice(filtered.indexOf(DAWN) + 1, 0, MINION_INFO);
    }

    if (nightType === "firstNight" && !filtered.includes(DEMON_INFO)) {
        filtered.splice(filtered.indexOf(MINION_INFO) + 1, 0, DEMON_INFO);
    }

    if (!filtered.includes(DUSK)) {
        filtered.push(DUSK);
    }

    // Remove any unwanted special roles. These are just there for internal
    // Pocket Grimoire functionality and shouldn't be seen by the end user.

    [META, NO_ROLE, UNIVERSAL, UNRECOGNISED].forEach((roleId) => {
        removeItem(filtered, roleId);
    });

    return filtered;

}

/**
 * Creates the night order for a specific night, filtering out any pre-existing
 * but invalid entries.
 *
 * @param rawNightOrder Unfiltered night order, which might be undefined.
 * @param nightSheets An object of the role IDs to the first- and other- nights'
 * positions.
 * @param nightType The type of night (i.e. `"firstNight"` or `"otherNight`).
 * @returns The filtered and sorted night order.
 * @private
 */
function createNightOrder<TNightType extends keyof INightSheets[IRole["id"]]>(
    rawNightOrder: IScriptMeta[TNightType],
    nightSheets: INightSheets,
    nightType: TNightType,
): NonNullable<IScriptMeta[TNightType]> {

    if (Array.isArray(rawNightOrder) && rawNightOrder.length) {
        return filterNightOrder(rawNightOrder, nightSheets, nightType);
    }

    const ignoreSpecials = [
        ERoleId.META,
        ERoleId.NO_ROLE,
        ERoleId.UNIVERSAL,
        ERoleId.UNRECOGNISED,
    ];

    const nightOrder = filterObject(
        nightSheets,
        ([id, nights]) => {
            return (
                isNumber(nights[nightType])
                && !ignoreSpecials.includes(id as ERoleId)
            );
        },
    ) as { [k: IRole["id"]]: { [nightType]: number } };
    const order = Object.entries(nightOrder)
        .map(([id, nights]) => [id, nights[nightType]]) as [string, number][];
    const sorted = order
        .toSorted((a, b) => a[1] - b[1])
        .map(([id]) => id);

    return sorted;

};

/**
 * Adds the night orders to the meat entry of the given script, creating the
 * meta entry if it doesn't already exist.
 *
 * @param script Script whose night orders should be set.
 */
export function addNightOrders(script: IScriptFull) {

    const metaEntry = getOrCreateScriptMeta(script);
    const nightSheets: INightSheets = Object.fromEntries(
        script
            .filter((entry) => isBasicRole(entry) || isSpecial(entry))
            .map((entry) => {
                const { id, firstNight, otherNight } = entry;
                return [
                    id,
                    { firstNight, otherNight },
                ];
            })
    );

    metaEntry.firstNight = createNightOrder(
        metaEntry.firstNight,
        nightSheets,
        "firstNight",
    );
    metaEntry.otherNight = createNightOrder(
        metaEntry.otherNight,
        nightSheets,
        "otherNight",
    );

}


/**
 * Checks the given script, dividing the script into valid and invalid entries.
 * Invalid entries have an array of reasons why they're considered invalid.
 *
 * @param script Script to check.
 * @returns Valid and invalid results.
 */
export function checkScriptImportValidity(script: unknown[]) {

    if (!Array.isArray(script)) {
        throw new TypeError("checkScriptImportValidity requires an array");
    }

    const results: IRoleCheckResults = {
        valid: [],
        invalid: [],
    };
    let hasMeta = false;

    script.forEach((role) => {

        if (isPopulatedString(role) || isDeprecatedScriptEntry(role)) {

            results.valid.push(role);
            return;

        }

        if (isMetaEntry(role)) {

            if (hasMeta) {

                results.invalid.push({
                    role,
                    reasons: ["Duplicate meta entry"], // TODO: i18n
                });
                
            } else {
                results.valid.push(role);
                return;
            }

        }

        const reasons = roleChecks.reduce((reasons, { check, error }) => {

            if (!check(role)) {
                reasons.push(error);
            }

            return reasons;

        }, [] as IRoleCheckResults["invalid"][number]["reasons"]);

        if (reasons.length) {

            results.invalid.push({
                role,
                reasons,
            });

        } else {
            results.valid.push(role as IRoleImport);
        }

    });

    return results;

}

/**
 * When they're displayed, the teams are always in an order. This is that order.
 */
export const ORDER = Object.freeze([
    ERoleTeam.TOWNSFOLK,
    ERoleTeam.OUTSIDER,
    ERoleTeam.MINION,
    ERoleTeam.DEMON,
    ERoleTeam.TRAVELLER,
    ERoleTeam.FABLED,
    ERoleTeam.LORIC,
]);

/**
 * Converts a reminder import into a full reminder.
 *
 * @param roleId ID of the role that this reminder belongs to.
 * @param reminder Reminder import as an object.
 * @param index Index of the reminder, used for generating an ID.
 * @returns Converted reminder or `null` if the reminder can't be converted.
 */
export function convertReminder(
    roleId: IRole["id"],
    reminder: Partial<IReminder>,
    index: number,
) {

    const converted: IReminder = Object.create(null);

    if (!isString(reminder.name)) {
        return null; // no reminder text - can't convert it.
    }

    converted.id = (
        (
            !Object.hasOwn(reminder, "id")
            || !isString(reminder.id)
            || !reminder.id.startsWith(roleId + ":")
        )
        ? `${roleId}:${index}`
        : reminder.id
    );
    converted.roleId = roleId;
    converted.name = reminder.name;

    if (isNumber(reminder.count)) {
        converted.count = reminder.count;
    }

    if (
        isString(reminder.image)
        && (isValidURL(reminder.image) || isValidLocalURL(reminder.image))
    ) {
        converted.image = reminder.image;
    }

    const validFlags = Object.values(EReminderFlag);

    const flags = (
        Array.isArray(reminder.flags)
        ? unique(reminder.flags.filter((flag) => validFlags.includes(flag)))
        : []
    );

    if (flags.length) {
        converted.flags = flags;
    }

    return converted;

}

/**
 * Converts all imported reminders and global reminders into full reminders. The
 * reminders and global reminders might be undefined because the role might not
 * have them.
 *
 * @param role Role information - specifically the `id` and `name`.
 * @param reminders Imported reminders.
 * @param remindersGlobal Imported global reminders.
 * @returns Either the converted reminders or `undefined` if no reminders or
 * global reminders were given.
 */
export function convertReminders(
    roleId: IRole["id"],
    reminders: Partial<IReminder>[] | string[] | void,
    remindersGlobal: string[] | void,
) {

    const allReminders: IReminder[] = [];
    let index = 0;

    if (Array.isArray(reminders)) {

        reminders.forEach((reminder) => {

            if (isString(reminder)) {
                reminder = { name: reminder } as Partial<IReminder>;
            }

            const converted = convertReminder(roleId, reminder, index);

            if (converted) {

                allReminders.push(converted);
                index += 1;

            }

        });

    }

    if (Array.isArray(remindersGlobal)) {

        remindersGlobal.forEach((reminder) => {

            const converted = convertReminder(
                roleId,
                { name: reminder } as Partial<IReminder>,
                index,
            );

            if (converted) {

                if (!converted.flags) {
                    converted.flags = [];
                }

                if (!converted.flags.includes(EReminderFlag.GLOBAL)) {
                    converted.flags.push(EReminderFlag.GLOBAL);
                }

                allReminders.push(converted);
                index += 1;

            }

        });

    }

    return (
        index === 0
        ? undefined
        : uniqueReminders(allReminders)
    );

}

const convertSpecialRole = (object: IRoleImport) => {

    const converted: IRole = Object.create(null);

    converted.id = object.id;
    converted.edition = object.edition;

    if (isString(object.ability)) {
        converted.ability = object.ability;
    }

    if (isNumber(object.firstNight) && object.firstNight >= 0) {
        converted.firstNight = object.firstNight;
    }

    if (isString(object.firstNightReminder)) {
        converted.firstNightReminder = object.firstNightReminder;
    }

    if (isNumber(object.otherNight) && object.otherNight >= 0) {
        converted.otherNight = object.otherNight;
    }

    if (isString(object.otherNightReminder)) {
        converted.otherNightReminder = object.otherNightReminder;
    }

    if (isString(object.image) && isValidLocalURL(object.image)) {
        converted.image = [object.image];
    }

    if (isString(object.name)) {
        converted.name = object.name;
    }

    return converted;

};

/**
 * Converts the imported role into a full role. Optionally, another role can be
 * used as a base.
 *
 * @param role Role to convert.
 * @param converted Optional base role.
 * @returns Full role or `null` if the role can't be converted.
 */
export function convertRole(
    role: IRoleImport,
    converted: IRole = Object.create(null),
) {

    if (
        role.edition === ERoleEdition.SPECIAL
        && Object.values(ERoleId).includes(role.id as ERoleId)
    ) {
        return convertSpecialRole(role);
    }

    if (
        !isString(role.id)
        || !isString(role.name)
        || !isString(role.team)
        || !isString(role.ability)
        || !Object.values(ERoleTeam).includes(role.team as ERoleTeam)
    ) {
        return null; // missing critical data or unrecognised team.
    }

    converted.id = role.id;
    converted.name = role.name;
    converted.team = role.team as ERoleTeam;
    converted.ability = role.ability;

    if (isString(role.edition)) {
        converted.edition = role.edition;
    }

    // if (isString(role.flavor)) {
    //     converted.flavor = role.flavor;
    // }

    if (isBoolean(role.setup)) {
        converted.setup = role.setup;
    }

    if (
        isNumber(role.firstNight)
        && role.firstNight > 0
        && isString(role.firstNightReminder)
    ) {
        converted.firstNight = role.firstNight;
        converted.firstNightReminder = role.firstNightReminder;
    }

    if (
        isNumber(role.otherNight)
        && role.otherNight > 0
        && isString(role.otherNightReminder)
    ) {
        converted.otherNight = role.otherNight;
        converted.otherNightReminder = role.otherNightReminder;
    }

    if (
        isString(role.image)
        || (Array.isArray(role.image) && role.image.every(isString))
    ) {

        const images = (
                isString(role.image)
                ? [role.image]
                : role.image
            )
            .filter((image) => isValidURL(image) || isValidLocalURL(image))
            .slice(0, 3);

        if (images.length) {
            converted.image = images as IRole["image"];
        }

    }

    if (Array.isArray(role.jinxes)) {

        const jinxes = uniqueJinxes(role.jinxes);

        if (jinxes.length) {
            converted.jinxes = jinxes;
        }

    }

    if (Array.isArray(role.special)) {

        const special = convertSpecial(role.special);

        if (special?.length) {
            converted.special = special;
        }

    }

    if (Array.isArray(role.reminders) || Array.isArray(role.remindersGlobal)) {

        const reminders = convertReminders(
            role.id,
            role.reminders,
            role.remindersGlobal,
        );

        if (reminders?.length) {
            converted.reminders = reminders;
        }

    }

    return converted;

}

/**
 * Filters a script import so that it only contains data that the store can use.
 *
 * @param script Script import to filter.
 * @returns Filtered script import.
 */
export function convertScriptToData(script: IScriptImport) {

    let hasMeta = false;

    return script.reduce((converted, item) => {

        if (isString(item)) {

            converted.push(item);

        } else if (isMetaEntry(item) && !hasMeta) {

            converted.push(clone(item));
            hasMeta = true;

        } else if (isString(item.id)) {

            converted.push(item.id);

        }

        return converted;

    }, [] as IScriptDataEntry);

}

/**
 * Converts the imported specials into full specials. The specials might be
 * `undefined` because the role might not have any.
 *
 * @param specials Specials to convert.
 * @returns Either the converted specials or `undefined` if no specials were
 * given.
 */
export function convertSpecial(specials: IRoleSpecialImport[] | void) {

    if (!Array.isArray(specials)) {
        return; // no specials, nothing to convert.
    }

    return uniqueSpecials(
        specials
            .map((special) => convertSpecialEntry(special))
            .filter((special) => special !== null)
    );

}

/**
 * Converts an imported special entry into a full entry.
 *
 * @param special Special entry to convert.
 * @returns Converted special entry or `null` if the entry couldn't be
 * converted.
 */
export function convertSpecialEntry(special: IRoleSpecialImport) {

    const entry: IRoleSpecial = Object.create(null);

    switch (special.type) {

    case ERoleSpecialType.ABILITY: {

        const names = [
            ERoleSpecialName.POINTING,
            ERoleSpecialName.GHOST_VOTES,
            ERoleSpecialName.DISTRIBUTE_ROLES,
        ];

        if (names.includes(special.name as ERoleSpecialName)) {
            entry.type = special.type;
            entry.name = special.name as ERoleSpecialName;
        } else {
            break;
        }

        const { global, time } = special;

        if (
            global
            && Object
                .values(ERoleSpecialGlobal)
                .includes(global as ERoleSpecialGlobal)
        ) {
            (entry as IRoleSpecialAbility).global = global as ERoleSpecialGlobal;
        }

        if (
            time
            && Object
                .values(ERoleSpecialTime)
                .includes(time as ERoleSpecialTime)
        ) {
            (entry as IRoleSpecialAbility).time = time as ERoleSpecialTime;
        }

        break;

    }

    case ERoleSpecialType.PLAYER: {

        if (special.name === ERoleSpecialName.OPEN_EYES) {
            entry.type = special.type;
            entry.name = special.name;
        }

        break;

    }

    case ERoleSpecialType.REVEAL: {

        if (special.name === ERoleSpecialName.REPLACE_CHARACTER) {
            entry.type = special.type;
            entry.name = special.name;
        }

        break;

    }

    case ERoleSpecialType.SELECTION: {

        const names = [
            ERoleSpecialName.BAG_DISABLED,
            ERoleSpecialName.BAG_DUPLICATE,
            ERoleSpecialName.GOOD_DUPLICATE,
        ];

        if (names.includes(special.name as ERoleSpecialName)) {
            entry.type = special.type;
            entry.name = special.name as ERoleSpecialName;
        }

        break;

    }

    case ERoleSpecialType.SIGNAL: {

        if (special.name === ERoleSpecialName.GRIMOIRE) {
            entry.type = special.type;
            entry.name = special.name;
            break;
        }

        const names = [
            ERoleSpecialName.CARD,
            ERoleSpecialName.PLAYER,
        ];

        if (names.includes(special.name as ERoleSpecialName)) {
            entry.type = special.type;
            entry.name = special.name as ERoleSpecialName;
        }

        if (isString(special.value)) {
            (entry as IRoleSpecialSignalValue).value = special.value;
        }

        break;

    }

    case ERoleSpecialType.VOTE: {

        if (special.name === ERoleSpecialName.HIDDEN) {
            entry.type = special.type;
            entry.name = special.name;
        } else if (
            special.name === ERoleSpecialName.MULTIPLIER
            && isNumber(special.value)
        ) {
            entry.type = special.type;
            entry.name = special.name;
            (entry as IRoleSpecialVoteValue).value = special.value;
        }

        break;

    }

    }

    if (!Object.hasOwn(entry, "type") || !Object.hasOwn(entry, "name")) {
        return null; // Something went wrong while converting - discard.
    }

    return entry;

}

type INightSheets = {
    [Key: IRole["id"]]: {
        firstNight: number | undefined,
        otherNight: number | undefined,
    },
};

/**
 * Gets the image for the given role, optionally changing it to the specified
 * alignment. If the image doesn't exist at that alignment, the first image will
 * be returned. If the image isn't a valid URL (either remote or local) then an
 * empty string is returned.
 *
 * @param role Role whose image should be returned.
 * @param alignment The alignment for the image.
 * @returns The image, if it can be found.
 */
export function getImage(
    role: IRole,
    alignment: ETokenAlignment = ETokenAlignment.DEFAULT,
) {

    if (!role || !role.image) {
        return "";
    }

    const { image } = role;
    const source = (
        Array.isArray(image)
        ? (image[alignment] || image[0])
        : image
    );

    return (
        (isValidURL(source) || isValidLocalURL(source))
        ? source
        : ""
    );

};

/**
 * Gets the meta entry from the given scripts. If the script has no meta entry,
 * one is created and prepended to the start of the script before being
 * returned.
 *
 * @param script Script whose meta entry should be returned.
 * @returns Found or created meta entry.
 */
export function getOrCreateScriptMeta(
    script: IScriptFull,
) {

    let metaEntry = getScriptMeta(script);

    if (!metaEntry) {

        metaEntry = {
            id: ERoleId.META,
            name: "",
        } satisfies IScriptMeta
        script.unshift(metaEntry);

    }

    return metaEntry;

};

/**
 * Returns the number of reminders that the given role has.
 *
 * @param role Role whose reminders should be counted.
 * @returns Number of reminders for the given role.
 */
export function getReminderCount(role: IRole) {

    return (role.reminders || []).reduce((subtotal, reminder) => {
        return subtotal + (reminder.count ?? 1);
    }, 0);

}

/**
 * Gets the meta entry from the given script (if it exists).
 *
 * @param script Script to check through.
 * @returns The meta entry, or `undefined` if the meta entry can't be found.
 */
export function getScriptMeta(
    script: DeepReadonly<IScriptData[string]> | IScriptFull,
) {
    return script.find((item) => isMetaEntry(item));
}

/**
 * Gets any specials that have the given type. Returns an empty array if no
 * matching specials can be found.
 *
 * @param role Role whose specials should be returned.
 * @param type Type of specials to find.
 */
export function getSpecial(
    role: IRole,
    type: ERoleSpecialType,
): IRoleSpecial[];
/**
 * Gets a special that matches the given type and name. Returns `undefined` if
 * no matching special can be found.
 *
 * @param role Role whose special should be returned.
 * @param type Type of special to find.
 * @param name Name of the special to find.
 */
export function getSpecial(
    role: IRole,
    type: ERoleSpecialType,
    name: ERoleSpecialName,
): IRoleSpecial | undefined;
export function getSpecial(
    role: IRole,
    type: ERoleSpecialType,
    name?: ERoleSpecialName,
) {

    const specials = role.special?.filter(({ type: specialType }) => {
        return specialType === type;
    }) || [];

    return (
        name
        ? specials.find(({ name: specialName }) => specialName === name)
        : specials
    );

}

/**
 * Checks whether or not the role can be added to the bag.
 *
 * @param role Role to check.
 * @returns `true` if the role can be added to the bag, `false` otherwise.
 */
export function isBagDisabled(role: IRole) {

    if (isSpecial(role)) {
        return false;
    }

    const special = getSpecial(
        role,
        ERoleSpecialType.SELECTION,
        ERoleSpecialName.BAG_DISABLED,
    );

    return Boolean(special);

}

/**
 * Checks to see if the given object is a basic role, i.e. not a special role,
 * not the meta entry etc.
 *
 * @param object Object to check.
 * @returns `true` if the object is a basic role, `false` otherwise.
 */
export function isBasicRole(object: unknown): object is IRole {
    return isObject(object) && !isMetaEntry(object) && !isSpecial(object);
};

/**
 * Checks to see if the given ojbect is a deprecated script entry.
 *
 * @param object Object to check.
 * @returns `true` if the object is a deprecated script entry, `false`
 * otherwise.
 */
export function isDeprecatedScriptEntry(
    object: unknown,
): object is IScriptDeprecated {

    return (
        isObject(object)
        && isString(object.id)
        && Object.keys(object).length === 1
    );

}

/**
 * Validates that the given object is a valid meta script entry.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid meta script entry, `false`
 * otherwise.
 */
export function isMetaEntry(object: unknown): object is IScriptMeta {

    return (
        isObject(object)
        && object.id === ERoleId.META
        && isPropertyString(object, "name")
        // && isPropertyOptionalString(object, "almanac")
        && isPropertyOptionalString(object, "author")
        // && isPropertyOptionalString(object, "background")
        // && isPropertyOptionalArrayOf(object, "bootlegger", isString)
        && isPropertyOptionalArrayOf(object, "firstNight", isString)
        && isPropertyOptionalArrayOf(object, "otherNight", isString)
        // && (
        //     (!Object.hasOwn(object, "hideTitle")
        //     || isBoolean(object.hideTitle))
        // )
        // && isPropertyOptionalString(object, "logo")
    );

}

/**
 * Checks to see if the given object is a special role.
 *
 * @param object Object to check.
 * @returns `true` if the object is a special role entry, `false` otherwise.
 */
export function isSpecial(object: unknown): object is IRole & { edition: ERoleEdition.SPECIAL } {
    return isObject(object) && object.edition === ERoleEdition.SPECIAL;
}

/**
 * Checks to see if the given object is the universal role.
 *
 * @param object Object to check.
 * @returns `true` if the object is the universal role entry, `false` otherwise.
 */
export function isUniversal(object: unknown): object is IRole & { id: ERoleId.UNIVERSAL } {
    return isSpecial(object) && object.id === ERoleId.UNIVERSAL;
}

/**
 * Validates that the given object is a valid jinx import.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid jinx import, `false` otherwise.
 */
export function isValidJinxImport(object: unknown): object is IJinxImport {

    return (
        isObject(object)
        && isPropertyString(object, "id")
        && isPropertyString(object, "reason")
    );

}

/**
 * Validates that the given object is a valid reminder import.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid reminder import, `false` otherwise.
 */
export function isValidReminderImport(
    object: unknown,
): object is Partial<IReminder> {

    return (
        isObject(object)
        && isPropertyString(object, "name")
        && isPropertyOptionalString(object, "id")
        && isPropertyOptionalString(object, "roleId")
        && isPropertyOptionalString(object, "roleName")
        && (
            !Object.hasOwn(object, "count") || isNumber(object.count)
        )
        && isPropertyOptionalArrayOf(object, "flags", isString)
        && isPropertyOptionalString(object, "image")
    );

}

/**
 * Checks to see if the given object is a valid internally-necessary special
 * role.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid internally-necessary special role,
 * `false` otherwise.
 * @private
 */
const isInternalSpecialRole = (object: Record<string, any>) => (
    isString(object.ability)
    && (!Object.hasOwn(object, "firstNight") || object.firstNight === 0)
    && isValidLocalURL(object.image)
    && isString(object.name)
    && (!Object.hasOwn(object, "otherNight") || object.otherNight === 0)
);

/**
 * Checks to see if the given object is a valid internal first-night information
 * role.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid internal first-night information
 * role, `false` otherwise.
 * @private
 */
const isFirstNightInfo = (object: Record<string, any>) => (
    isPositiveNumber(object.firstNight)
    && isString(object.firstNightReminder)
    && isValidLocalURL(object.image)
    && isString(object.name)
    && (!isNumber(object.otherNight) || object.otherNight === 0)
);

/**
 * Checks to see if the given object is a valid internal every-night information
 * role.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid internal every-night information
 * role, `false` otherwise.
 * @private
 */
const isEveryNightInfo = (object: Record<string, any>) => (
    isPositiveNumber(object.firstNight)
    && isString(object.firstNightReminder)
    && isValidLocalURL(object.image)
    && isString(object.name)
    && isPositiveNumber(object.otherNight)
    && isString(object.otherNightReminder)
);

/**
 * Checks for special roles.
 */
const specialRoles: Record<ERoleId, (object: Record<string, any>) => boolean> = {
    [ERoleId.DAWN]: isEveryNightInfo,
    [ERoleId.DEMON_INFO]: isFirstNightInfo,
    [ERoleId.DUSK]: isEveryNightInfo,
    [ERoleId.META]: isInternalSpecialRole,
    [ERoleId.MINION_INFO]: isFirstNightInfo,
    [ERoleId.NO_ROLE]: isInternalSpecialRole,
    [ERoleId.UNIVERSAL]: isInternalSpecialRole,
    [ERoleId.UNRECOGNISED]: isInternalSpecialRole,
};

/**
 * Validates that the given object is a valid role import.
 *
 * @param object Object to check.
 * @returns `true` if the given object is a valid role import, `false`
 * otherwise.
 */
export function isValidRoleImport(object: unknown): object is IRoleImport {

    const isValid = (
        isObject(object)
        && isPropertyString(object, "id")
    );

    if (!isValid) {
        return false;
    }

    if (
        object.edition === ERoleEdition.SPECIAL
        && Object.hasOwn(specialRoles, object.id)
    ) {
        return specialRoles[object.id as ERoleId](object);
    }

    return (
        isPropertyString(object, "name")
        && isPropertyOptionalString(object, "edition")
        && isPropertyString(object, "team")
        && isPropertyString(object, "ability")
        && (!Object.hasOwn(object, "firstNight") || isNumber(object.firstNight))
        && isPropertyOptionalString(object, "firstNightReminder")
        // && isPropertyOptionalString(object, "flavor")
        && (
            !Object.hasOwn(object, "image")
            || isString(object.image)
            || (
                Array.isArray(object.image)
                && object.image.every(isString)
            )
        )
        && isPropertyOptionalArrayOf(object, "jinxes", isValidJinxImport)
        && (!Object.hasOwn(object, "otherNight") || isNumber(object.otherNight))
        && isPropertyOptionalString(object, "otherNightReminder")        
        && isPropertyOptionalArrayOf(
            object,
            "reminders",
            (item) => isString(item) || isValidReminderImport(item),
        )
        && isPropertyOptionalArrayOf(object, "remindersGlobal", isString)
        && (!Object.hasOwn(object, "setup") || isBoolean(object.setup))
        && isPropertyOptionalArrayOf(object, "special", isValidSpecialImport)
    );

}

/**
 * Checks to see if the given object is a valid script import.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid script import, `false` otherwise.
 */
export function isValidScriptImport(
    object: unknown,
): object is IScriptImport {

    return (
        Array.isArray(object)
        && object.every((item) => isValidScriptImportEntry(item))
    );

}

/**
 * Validates that the given object is a valid script import entry.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid script import entry, `false`
 * otherwise.
 */
export function isValidScriptImportEntry(
    object: unknown,
): object is IScriptImport[number] {

    return (
        isString(object)
        || isMetaEntry(object)
        || isValidRoleImport(object)
        || isDeprecatedScriptEntry(object)
    );

}

/**
 * Validates that the given object is a valid special import.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid special import, `false` otherwise.
 */
export function isValidSpecialImport(
    object: unknown,
): object is IRoleSpecialImport {

    return (
        isObject(object)
        && isPropertyString(object, "name")
        && isPropertyString(object, "type")
        && isPropertyOptionalString(object, "global")
        && isPropertyOptionalString(object, "time")
        && (
            !Object.hasOwn(object, "value")
            || isNumber(object.value)
            || isString(object.value)
        )
    );

   
}

/**
 * Merges two roles (although the original is optional as it might not exist).
 *
 * @param original Original role that the created role should be merged with.
 * @param created Created role.
 * @returns Merged role, or `null` if the roles can't be merged.
 */
export function mergeRoles(
    original: DeepReadonly<IRole> | void,
    created: IRole,
) {

    if (!original) {
        return created;
    }

    // `convertRole()` will modify the base so passing `thawed` to it would
    // replace the reminders, jinxes, and specials, stopping us merging them.
    const thawed = deepThaw(original);
    const merged = convertRole(created as IRoleImport, deepThaw(original));

    if (!merged) {
        return null;
    }

    if (thawed.reminders && created.reminders) {

        merged.reminders = uniqueReminders([
            ...created.reminders,
            ...thawed.reminders,
        ]);

    }

    if (thawed.jinxes && created.jinxes) {

        merged.jinxes = uniqueJinxes([
            ...created.jinxes,
            ...thawed.jinxes,
        ]);

    }

    if (thawed.special && created.special) {

        merged.special = uniqueSpecials([
            ...created.special,
            ...thawed.special,
        ]);

    }

    return merged;

}

/**
 * Parses a reminder ID into the role ID and the reminder index. If anything
 * goes wrong, the role ID will be an empty string and the index will be -1.
 *
 * @param reminderId Reminder ID to parse.
 * @returns Role ID and index.
 */
export function parseReminderId(reminderId: IReminder["id"]) {

    const [roleId, indexString] = reminderId.split(":");
    const index = Number(indexString);

    if (
        !isPopulatedString(roleId)
        || !isNumber(index)
        || index < 0
        || !Number.isInteger(index)
    ) {

        return {
            index: -1,
            roleId: "",
        };

    }

    return {
        index,
        roleId,
    };

}

/**
 * Sorts the given script so that all the teams are together, in the order
 * matching {@link ORDER}.
 *
 * @param script Script to sort.
 * @returns Sorted script.
 */
export function sortByTeam(script: IScriptFull) {

    const sorted = script.toSorted((a, b) => {

        if (isMetaEntry(a)) {
            return -1;
        }

        if (isMetaEntry(b)) {
            return 1;
        }

        return ORDER.indexOf(a.team) - ORDER.indexOf(b.team);

    });

    const metaIndex = sorted.findIndex(isMetaEntry);

    if (metaIndex > -1) {

        const metaEntry = sorted[metaIndex];
        sorted.splice(metaIndex, 1);
        sorted.unshift(metaEntry);

    }

    return sorted;

}

/**
 * Removes any duplicated jinxes from the given array of jinxes.
 *
 * @param jinxes Jinxes to filter.
 * @returns De-duplicated array of jinxes.
 */
export function uniqueJinxes(jinxes: IJinxImport[]) {

    const unique = jinxes.reduce((jinxes, { id, reason }) => {
        jinxes[id] = reason;
        return jinxes;
    }, {} as Record<IJinxImport["id"], IJinxImport["reason"]>);

    return Object.entries(unique).map(([id, reason]) => ({ id, reason }));

}

/**
 * Removes any duplicated reminders from the given array of reminders.
 *
 * @param reminders Reminders to filter.
 * @returns De-duplicated array of reminders.
 */
export function uniqueReminders(reminders: IReminder[]) {
    return uniqueMap(reminders, ({ name }) => name);
}

/**
 * Removes any duplicated specials from the given array of specials.
 *
 * @param specials Specials to filter.
 * @returns De-duplicated array of specials.
 */
export function uniqueSpecials(specials: IRoleSpecial[]) {
    return uniqueMap(specials, ({ type, name }) => `${type}|${name}`);
}
