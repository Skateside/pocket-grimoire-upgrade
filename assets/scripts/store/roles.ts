import type { AnyObject } from "../types/lib";
import { defineStore } from "pinia";
import {
    // ERoleEditions,
    EJinxState,
    // ERoleIds,
    // ERoleReminderFlag,
    ERoleTeam,
} from "../enums/data";
import { computed, inject, ref, watch } from "vue";
import { clone, deepFreeze,  deepThaw,  isBoolean, isNumber, isObject, isPropertyString, isString } from "../utilities/objects";
import { isValidLocalURL, isValidURL } from "../utilities/strings";
import { unique } from "../utilities/arrays";
import type { IStorage } from "../classes/Storage";
import { StorageNotFoundError } from "~/errors";

type IScriptImport = (IScriptMeta | IScriptDeprecated | IRole["id"] | IRole | IRoleImport)[];

type IScripts = Record<string, (IScriptMeta | IRole["id"])[]>;

type IRoleImport = {
    id: string,
    name: string,
    team: string,
    ability: string,
    edition?: string,
    firstNight?: number,
    firstNightReminder?: string,
    // flavor?: string,
    image?: string | [string] | [string, string] | [string, string, string],
    jinxes?: IJinxImport[],
    otherNight?: number,
    otherNightReminder?: string,
    reminders?: string[],
    remindersGlobal?: string[],
    setup?: boolean,
    special?: IRoleSpecialImport[],
};

type IJinxImport = {
    id: IRoleImport["id"],
    reason: string,
};

type IRoleSpecialImport = {
    name: string,
    type: string,
    global?: string,
    time?: string,
    value?: number | string,
};

export enum ERoleId {
    META = "_meta",
    NO_ROLE = "_norole",
    UNIVERSAL = "_universal",
    UNRECOGNISED = "_unrecognised",
};

export enum ERoleEdition {
    TROUBLE_BREWING = "tb",
    BAD_MOON_RISING = "bmr",
    SECTS_AND_VIOLETS = "snv",
    SPECIAL = "special",
};

type IRole = {
    id: string,
    name: string,
    team: ERoleTeam,
    ability: string,
    edition?: ERoleEdition | string,
    firstNight?: number,
    firstNightReminder?: string,
    // flavor: string,
    image?: [string] | [string, string] | [string, string, string],
    jinxes?: IJinx[],
    otherNight?: number,
    otherNightReminder?: string,
    reminders?: IReminder[],
    setup?: boolean,
    special?: IRoleSpecial[],
};

type IReminder = {
    id: `${IRole["id"]}:${number}`,
    // role: IRole,
    name: string,
    roleName: IRole["name"],
    count?: number,
    flags?: EReminderFlag[],
    image?: string,
};

enum EReminderFlag {
    DEAD = "dead",
    GLOBAL = "global",
    KILL = "kill",
    PUBLIC = "public",
    ROLE = "role",
};

type IJinx = {
    target: IRole["id"],
    trick: IRole["id"],
    reason: string,
    state: EJinxState,
};

enum ERoleSpecialGlobal {
    DEAD = "dead",
    DEMON = ERoleTeam.DEMON,
    MINION = ERoleTeam.MINION,
    OUTSIDER = ERoleTeam.OUTSIDER,
    TOWNSFOLK = ERoleTeam.TOWNSFOLK,
    TRAVELLER = ERoleTeam.TRAVELLER,
};

enum ERoleSpecialName {
    BAG_DISABLED = "bag-disabled",
    BAG_DUPLICATE = "bag-duplicate",
    CARD = "card",
    DISTRIBUTE_ROLES = "distribute-roles",
    GHOST_VOTES = "ghost-votes",
    GOOD_DUPLICATE = "good-duplicate",
    GRIMOIRE = "grimoire",
    HIDDEN = "hidden",
    MULTIPLIER = "multiplier",
    OPEN_EYES = "open-eyes",
    PLAYER = "player",
    POINTING = "pointing",
    REPLACE_CHARACTER = "replace-character",    
};

enum ERoleSpecialTime {
    DAY = "day",
    FIRST_NIGHT = "firstNight",
    FIRST_DAY = "firstDay",
    OTHER_NIGHT = "otherNight",
    OTHER_DAY = "otherDay",
    PREGAME = "pregame",
    NIGHT = "night",
};

enum ERoleSpecialType {
    ABILITY = "ability",
    PLAYER = "player",
    REVEAL = "reveal",
    SELECTION ="selection",
    SIGNAL = "signal",
    VOTE = "vote",
};

type IRoleSpecialSelection = {
    type: ERoleSpecialType.SELECTION,
    name: (
        ERoleSpecialName.BAG_DISABLED
        | ERoleSpecialName.BAG_DUPLICATE
        | ERoleSpecialName.GOOD_DUPLICATE
    ),
};

type IRoleSpecialAbility = {
    type: ERoleSpecialType.ABILITY,
    name: (
        ERoleSpecialName.POINTING
        | ERoleSpecialName.GHOST_VOTES
        | ERoleSpecialName.DISTRIBUTE_ROLES
    ),
    time?: ERoleSpecialTime,
    global?: ERoleSpecialGlobal,
};

type IRoleSpecialSignal = {
    type: ERoleSpecialType.SIGNAL,
    name: ERoleSpecialName.GRIMOIRE,
};

type IRoleSpecialSignalValue = {
    type: ERoleSpecialType.SIGNAL,
    name: ERoleSpecialName.CARD | ERoleSpecialName.PLAYER,
    value: string,
};

type IRoleSpecialVote = {
    type: ERoleSpecialType.VOTE,
    name: ERoleSpecialName.HIDDEN,
};

type IRoleSpecialVoteValue = {
    type: ERoleSpecialType.VOTE,
    name: ERoleSpecialName.MULTIPLIER,
    value: number,
};

type IRoleSpecialReveal = {
    type: ERoleSpecialType.REVEAL,
    name: ERoleSpecialName.REPLACE_CHARACTER,
};

type IRoleSpecialPlayer = {
    type: ERoleSpecialType.PLAYER,
    name: ERoleSpecialName.OPEN_EYES,
};

type IRoleSpecial = (
    | IRoleSpecialAbility
    | IRoleSpecialPlayer
    | IRoleSpecialReveal
    | IRoleSpecialSelection
    | IRoleSpecialSignal
    | IRoleSpecialSignalValue
    | IRoleSpecialVote
    | IRoleSpecialVoteValue
);

type IScriptDeprecated = Pick<IRole, "id"> & {
    [Key in Exclude<string, "id">]?: never;
};

type IScriptMeta = {
    id: ERoleId.META,
    name: string,
    // almanac?: string,
    author?: string,
    // background?: string,
    // bootlegger?: string[],
    firstNight?: IRole["id"][],
    otherNight?: IRole["id"][],
    // hideTitle?: boolean,
    // logo?: string,
};

type IScriptFull = (IScriptMeta | IRole)[];

const isPropertyOptionalString = <
    TObject extends AnyObject = AnyObject,
    TKey extends PropertyKey = keyof TObject
>(object: TObject, key: TKey): object is AnyObject & Partial<Record<TKey, string>> => {
    return !Object.hasOwn(object, key) || isString(object[key]);
};

const isPropertyOptionalArrayOf = (
    object: AnyObject,
    key: string,
    checker: (value: unknown) => boolean,
) => {
    return (
        !Object.hasOwn(object, key)
        || (
            Array.isArray(object[key])
            && object[key].every((item) => checker(item))
        )
    );
};

function isDeprecatedScriptEntry(object: unknown): object is IScriptDeprecated {

    return (
        isObject(object)
        && isString(object.id)
        && Object.keys(object).length === 1
    );

}

function isValidMetaEntry(object: unknown): object is IScriptMeta {

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
        // && (!Object.hasOwn(object, "hideTitle") || isBoolean(object.hideTitle))
        // && isPropertyOptionalString(object, "logo")
    );

}

function isValidJinxImport(object: unknown): object is IJinxImport {

    return (
        isObject(object)
        && isPropertyString(object, "id")
        && isPropertyString(object, "reason")
    );

}

function isValidSpecialImport(object: unknown): object is IRoleSpecialImport {

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

function isValidRoleImport(object: unknown): object is IRoleImport {

    return (
        isObject(object)
        && isPropertyString(object, "id")
        && isPropertyString(object, "name")
        && isPropertyString(object, "team")
        && isPropertyString(object, "ability")
        && isPropertyOptionalString(object, "edition")
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
        && isPropertyOptionalArrayOf(object, "reminders", isString)
        && isPropertyOptionalArrayOf(object, "remindersGlobal", isString)
        && (!Object.hasOwn(object, "setup") || isBoolean(object.setup))
        && isPropertyOptionalArrayOf(object, "special", isValidSpecialImport)
    );

}

function isValidDeprecatedRole(object: unknown): object is Pick<IRoleImport, "id"> {
    return isObject(object) && isPropertyString(object, "id");
}

function isValidScriptImportEntry(object: unknown): object is IScriptImport[number] {

    return (
        isString(object)
        || isValidMetaEntry(object)
        || isValidRoleImport(object)
        || isValidDeprecatedRole(object)
    );

}

function convertReminder(
    { id, name }: { id: IRole["id"], name: IRole["name"] },
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
            || !reminder.id.startsWith(id + ":")
        )
        ? `${id}:${index}`
        : reminder.id
    );
    converted.roleName = name;
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

function convertReminders(
    { id, name }: { id: IRole["id"], name: IRole["name"] },
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

            const converted = convertReminder({ id, name }, reminder, index);

            if (converted) {

                allReminders.push(converted);
                index += 1;

            }

        });

    }

    if (Array.isArray(remindersGlobal)) {

        remindersGlobal.forEach((reminder) => {

            const converted = convertReminder(
                { id, name },
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

    return allReminders;

}

function convertJinx(roleId: IRole["id"], jinx: IJinxImport) {

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

function convertJinxes(roleId: IRole["id"], jinxes: IJinxImport[] | void) {

    if (!Array.isArray(jinxes)) {
        return; // no jinxes, nothing to convert.
    }

    return jinxes
        .map((jinx) => convertJinx(roleId, jinx))
        .filter((jinx) => jinx !== null);

}

function convertSpecialEntry(special: IRoleSpecialImport) {

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

        if (
            special.time
            && Object.values(ERoleSpecialTime).includes(special.time as ERoleSpecialTime)
        ) {
            (entry as IRoleSpecialAbility).time = special.time as ERoleSpecialTime;
        }

        if (
            special.global
            && Object.values(ERoleSpecialGlobal).includes(special.global as ERoleSpecialGlobal)
        ) {
            (entry as IRoleSpecialAbility).global = special.global as ERoleSpecialGlobal;
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

function convertSpecial(specials: IRoleSpecialImport[] | void) {

    if (!Array.isArray(specials)) {
        return; // no specials, nothing to convert.
    }

    return specials
        .map((special) => convertSpecialEntry(special))
        .filter((special) => special !== null);

}

function convertRole(role: IRoleImport) {

    const converted: IRole = Object.create(null);

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
            {
                id: converted.id,
                name: converted.name,
            },
            role.reminders,
            role.remindersGlobal,
        );

        if (reminders.length) {
            converted.reminders = reminders;
        }

    }

    return converted;

}

function convertScriptToData(script: IScriptImport) {

    return script.reduce((converted, item) => {

        if (isString(item)) {
            converted.push(item);
        } else if (isValidMetaEntry(item)) {
            converted.push(clone(item));
        } else if (isString(item.id)) {
            converted.push(item.id);
        }

        return converted;

    }, [] as IScripts[string]);

}

// function 

const rolesStore = defineStore("roles", () => {

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

        const scripts: IScripts = Object.create(null);

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

    const storage = inject<IStorage>("storage");

    if (!storage) {
        throw new StorageNotFoundError("roles store");
    }

    const STORAGE_KEY = "script";
    const script = ref<IScriptFull>([]);
    watch(script, (value) => storage.set(STORAGE_KEY, value));

    const innerGetRoleById = (roleId: IRole["id"]) => {
        return roles.value.find(({ id }) => id === roleId);
    };

    // const getRoleById = computed(() => innerGetRoleById);

    const setScript = (scriptImport: IScriptImport) => {

        if (!Array.isArray(scriptImport)) {
            return;
        }

        const entries: IScriptFull = [];
        
        scriptImport.filter(isValidScriptImportEntry).forEach((entry) => {

            if (isValidMetaEntry(entry)) {
                entries.push(entry);
                return;
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

                return;

            }

            // if (isDeprecatedScriptEntry(entry)) {

            // }

            entry

        });

        script.value = entries;

    };

    setScript(storage.get<IScriptFull>(STORAGE_KEY, Array.isArray, []));

    /*
    const script = ref<IRoleScript>([
        ...storage
            .get<IRoleScript>(STORAGE_KEY, [])
            .map(setRemindersRole),
    ]);
    watch(script, (value) => {
        // When saving a script, remove each reminder's role to prevent a
        // circular reference.
        storage.set(STORAGE_KEY, value.map(unsetRemindersRole));
    });
    */

    return {
        // Data.
        script,
        // Getters.
        roles,
        scripts,
        // getRoleById,
        // Actions.
        setScript,
    }

});

export default rolesStore;
