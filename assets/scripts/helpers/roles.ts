import type { DeepReadonly } from "vue";
import type {
    IJinx,
    IJinxImport,
    IReminder,
    IRole,
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
    // IScripts,
} from "../types/data";
import {
    EJinxState,
    EReminderFlag,
    ERoleEdition,
    ERoleId,
    ERoleSpecialGlobal,
    ERoleSpecialName,
    ERoleSpecialTime,
    ERoleSpecialType,
    ERoleTeam,
    ETokenAlignment,
} from "../enums/data";
import { unique, uniqueMap } from "../utilities/arrays";
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
} from "../utilities/objects";
import { isValidLocalURL, isValidURL } from "../utilities/strings";

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
 * Converts a jinx import into a full jinx.
 *
 * @param roleId ID of the role that the jinx will be added to.
 * @param jinx Imported jinx data.
 * @returns Either the converted jinx or `null` if it can't be converted.
 */
export function convertJinx(roleId: IRole["id"], jinx: IJinxImport) {

    const converted: IJinx = Object.create(null);

    if (!isObject(jinx) || !isString(jinx.id) || !isString(jinx.reason)) {
        return null; // can't convert this jinx.
    }

    converted.target = roleId;
    converted.trick = jinx.id;
    converted.reason = jinx.reason;
    converted.state = EJinxState.THEORETICAL;

    return converted;

}

/**
 * Converts an array of imported jinxes into full jinxes. The imported jinxes
 * might be undefined because the role might not have them.
 *
 * @param roleId ID of the role that the jinxes will be added to.
 * @param jinxes Array of jinx imports.
 * @returns The converted jinxes. If no jinxes were given, nothing is returned.
 */
export function convertJinxes(
    roleId: IRole["id"],
    jinxes: IJinxImport[] | void,
) {

    if (!Array.isArray(jinxes)) {
        return; // no jinxes, nothing to convert.
    }

    return uniqueJinxes(
        jinxes
            .map((jinx) => convertJinx(roleId, jinx))
            .filter((jinx) => jinx !== null)
    );

}

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

        const jinxes = convertJinxes(converted.id, role.jinxes);

        if (jinxes?.length) {
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
 * Checks to see if the given object is the universal role.
 *
 * @param object Object to check.
 * @returns `true` if the object is the universal role entry, `false` otherwise.
 */
export function isUniversal(object: unknown): object is IRole & { id: ERoleId.UNIVERSAL } {

    return (
        isObject(object)
        && object.id === ERoleId.UNIVERSAL
        && object.edition == ERoleEdition.SPECIAL
    );

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

const isInternalSpecialRole = (object: Record<string, any>) => (
    isString(object.ability)
    && (!Object.hasOwn(object, "firstNight") || object.firstNight === 0)
    && isValidLocalURL(object.image)
    && isString(object.name)
    && (!Object.hasOwn(object, "otherNight") || object.otherNight === 0)
);

const isFirstNightInfo = (object: Record<string, any>) => (
    (isNumber(object.firstNight) && object.firstNight > 0)
    && isString(object.firstNightReminder)
    && isValidLocalURL(object.image)
    && isString(object.name)
    && (!isNumber(object.otherNight) || object.otherNight === 0)
);

const isEveryNightInfo = (object: Record<string, any>) => (
    (isNumber(object.firstNight) && object.firstNight > 0)
    && isString(object.firstNightReminder)
    && isValidLocalURL(object.image)
    && isString(object.name)
    && (isNumber(object.otherNight) && object.otherNight > 0)
    && isString(object.otherNightReminder)
)

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
        ) // NOTE: Fails on my imports!!
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
export function uniqueJinxes(jinxes: IJinx[]) {
    return uniqueMap(jinxes, ({ target, trick }) => `${target}|${trick}`);
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
