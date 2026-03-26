// import type { DeepReadonly } from "vue";
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
    ETokenType,
} from "../enums/data";

// BotC Scripts.

export type IBotcScriptResponse = {
    id: number,
    author: string,
    name: string,
    version: string,
    // script: IRoleScriptImport,
    script: IScriptImport,
    type: 'full' | 'teensyvilly' | 'unknown',
};

// Co-ordinates - the base of seats and reminders.

export type ICoordinates = {
    x: number,
    y: number,
    z?: number,
};

// Demon Bluffs.

export type IDemonBluffId = IRole["id"] | null;

export type IDemonBluffGroup = {
    id: string,
    name: string,
    roles: [IDemonBluffId, IDemonBluffId, IDemonBluffId]
};

export type IDemonBluffs = IDemonBluffGroup[];

// Input fields.

export type IFields = Record<string, Record<string, boolean | string>>;

// The breakdown of role types.

export type IGameBreakdown = Record<
    (
        ERoleTeam.TOWNSFOLK
        | ERoleTeam.OUTSIDER
        | ERoleTeam.MINION
        | ERoleTeam.DEMON
    ),
    number
>;
export type IGameCounts = Record<number, IGameBreakdown>;

// Internationalisation information.

export type II18nData = Record<string, string>;

// Info Tokens.

export type IInfoTokenRaw = {
    id: string,
    markdown: string,
    colour: IInfoTokenColours,
    isCustom?: boolean,
};

export type IInfoToken = IInfoTokenRaw & {
    text: string,
    markup: string,
    isCustom: boolean,
    roleIds: IRole["id"][],
};

export type IInfoTokenColours = (
    "blue"
    | "dark-orange"
    | "dark-purple"
    | "green"
    | "grey"
    | "orange"
    | "purple"
    | "red"
);

// Jinxes.

// export type IJinx = {
//     target: IRole,
//     trick: IRole,
//     reason: IRoleJinxRaw["reason"],
//     state: EJinxState,
// };

export type IJinx = {
    target: IRole["id"],
    trick: IRole["id"],
    reason: string,
    state: EJinxState,
};

export type IJinxImport = {
    id: IRoleImport["id"],
    reason: string,
};


// The Grimoire Pad.

export type IPad = Pick<DOMRect, "left" | "top" | "right" | "bottom">;

// Reminders.

export type IReminder = {
    id: `${IRole["id"]}:${number}`,
    name: string,
    roleId: IRole["id"],
    count?: number,
    flags?: EReminderFlag[],
    image?: string,
};

// Roles.

/*
export type IRoleRaw = {
    id: string,
    team: IRoleTeam,
    name: string,
    ability: string,
    flavor?: string,
    image?: string | [string] | [string, string] | [string, string, string],
    edition?: string,
    firstNight?: number,
    firstNightReminder?: string,
    otherNight?: number,
    otherNightReminder?: string,
    setup?: boolean,
    reminders?: IRoleReminderRaw[],
    jinxes?: IRoleJinxRaw[],
    special?: IRoleSpecial[],
};

export type IRole = Omit<IRoleRaw, "reminders"> & {
    // TODO: anything that the Pocket Grimoire needs to manage the role.
    reminders?: IRoleReminder[],
};

export type IRoleDeprecatedReminders = IRole & {
    reminders?: string[],
    remindersGlobal?: string[],
};

export type IRoleCoreTeam = (
    ERoleTeam.TOWNSFOLK
    | ERoleTeam.OUTSIDER
    | ERoleTeam.MINION
    | ERoleTeam.DEMON
);
export type IRolePlayTeam = IRoleCoreTeam | ERoleTeam.TRAVELLER;
export type IRoleTeam = IRolePlayTeam | ERoleTeam.FABLED | ERoleTeam.LORIC;

export type IRoleReminderRaw = {
    name: string,
    count?: number,
    flags?: (
        ERoleReminderFlag.GLOBAL
        | ERoleReminderFlag.PUBLIC
        | ERoleReminderFlag.KILL
        | ERoleReminderFlag.DEAD
        | ERoleReminderFlag.ROLE
    )[],
};

export type IRoleReminder = IRoleReminderRaw & {
    id: `${IRole["id"]}:${number}`,
    role: IRole, // A reference back to the role.
    image?: string, // Create a seperate image for universal reminders.
};

export type IRoleJinxRaw = {
    id: string,
    reason: string,
};

export type IRoleMeta = {
    id: ERoleIds.META,
    name: string,
    author?: string,
    firstNight?: string[],
    otherNight?: string[],
};

/ *
export type IRoleSpecial = {
    type: (
        "ability"
        | "player"
        | "reveal"
        | "selection"
        | "signal"
        | "vote"
    ),
    name: (
        "bag-disabled"
        | "bag-duplicate"
        | "card"
        | "distribute-roles"
        | "ghost-votes"
        | "good-duplicate"
        | "grimoire"
        | "hidden"
        | "multiplier"
        | "open-eyes"
        | "player"
        | "pointing"
        | "replace-character"
    ),
    value?: number | string, // string doesn't have to be numeric.
    time?: (
        "pregame"
        | "day"
        | "night"
        | "firstNight"
        | "firstDay"
        | "otherNight"
        | "otherDay"
    ),
    global?: IRolePlayTeam | "dead",
};
* /
// NOTE: Would it make sense to turn these into `enum`s?
export type IRoleSpecialTime = (
    "pregame"
    | "day"
    | "night"
    | "firstNight"
    | "firstDay"
    | "otherNight"
    | "otherDay"
);

export type IRoleSpecialGlobal = IRolePlayTeam | "dead";

export type IRoleSpecial = {
    type: "selection",
    name: "bag-disabled" | "bag-duplicate" | "good-duplicate",
} | {
    type: "ability",
    name: "pointing" | "ghost-votes" | "distribute-votes",
    time?: IRoleSpecialTime,
    global?: IRoleSpecialGlobal,
} | {
    type: "signal",
    name: "grimoire",
} | {
    type: "signal",
    name: "card" | "player",
    value: string,
} | {
    type: "vote",
    name: "hidden",
} | {
    type: "vote",
    name: "multiplier",
    value: number,
} | {
    type: "reveal",
    name: "replace-character",
} | {
    type: "player",
    name: "open-eyes",
};

export type IRoleScript = (IRoleMeta | IRole)[];
export type IRoleScriptImport = (IRoleMeta | IRole | IRole["id"] | Pick<IRole, "id">)[];

export type IRoleNightOrder = Record<"first" | "other", {
    role: IRole,
    order: number,
}[]>;
*/

export type IRole = {
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

export type IRoleCheck = {
    check: (object: any) => boolean,
    error: string,
};

export type IRoleCheckResults = {
    valid: (string | IScriptDeprecated | IRoleImport | IScriptMeta)[],
    invalid: {
        role: any,
        reasons: string[],
    }[],
};

export type IRoleCounts = Record<IRole["id"], number>;

export type IRoleImport = {
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

export type IRoleNightOrder = Record<"first" | "other", IRole[]>;

export type IRoleSpecialImport = {
    name: string,
    type: string,
    global?: string,
    time?: string,
    value?: number | string,
};

export type IRoleSpecial = (
    | IRoleSpecialAbility
    | IRoleSpecialPlayer
    | IRoleSpecialReveal
    | IRoleSpecialSelection
    | IRoleSpecialSignal
    | IRoleSpecialSignalValue
    | IRoleSpecialVote
    | IRoleSpecialVoteValue
);

export type IRoleSpecialAbility = {
    type: ERoleSpecialType.ABILITY,
    name: (
        ERoleSpecialName.POINTING
        | ERoleSpecialName.GHOST_VOTES
        | ERoleSpecialName.DISTRIBUTE_ROLES
    ),
    time?: ERoleSpecialTime,
    global?: ERoleSpecialGlobal,
};

export type IRoleSpecialPlayer = {
    type: ERoleSpecialType.PLAYER,
    name: ERoleSpecialName.OPEN_EYES,
};

export type IRoleSpecialReveal = {
    type: ERoleSpecialType.REVEAL,
    name: ERoleSpecialName.REPLACE_CHARACTER,
};

export type IRoleSpecialSelection = {
    type: ERoleSpecialType.SELECTION,
    name: (
        ERoleSpecialName.BAG_DISABLED
        | ERoleSpecialName.BAG_DUPLICATE
        | ERoleSpecialName.GOOD_DUPLICATE
    ),
};

export type IRoleSpecialSignal = {
    type: ERoleSpecialType.SIGNAL,
    name: ERoleSpecialName.GRIMOIRE,
};

export type IRoleSpecialSignalValue = {
    type: ERoleSpecialType.SIGNAL,
    name: ERoleSpecialName.CARD | ERoleSpecialName.PLAYER,
    value: string,
};

export type IRoleSpecialVote = {
    type: ERoleSpecialType.VOTE,
    name: ERoleSpecialName.HIDDEN,
};

export type IRoleSpecialVoteValue = {
    type: ERoleSpecialType.VOTE,
    name: ERoleSpecialName.MULTIPLIER,
    value: number,
};

// Scripts.

export type IScriptDeprecated = Pick<IRole, "id"> & {
    [Key in Exclude<string, "id">]?: never;
};

export type IScriptData = Record<string, IScriptDataEntry>;

export type IScriptDataEntry = (IScriptMeta | IRole["id"])[];

export type IScriptFull = (IScriptMeta | IRole)[];

export type IScriptImport = (
    IScriptMeta
    | IScriptDeprecated
    | IRole["id"]
    | IRole
    | IRoleImport
)[];

export type IScriptMeta = {
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

// Tokens.

export type IToken = Required<ICoordinates> & {
    id: string,
    type: ETokenType,
};

export type ITokenReminder = IToken & {
    type: ETokenType.REMINDER,
    reminderId: IReminder["id"],
};

// NOTE: The "role" token is for a role that's been added to the pad but isn't
// for a player. That might mean a Fabled or a Loric, but might be something the
// Story teller wanted to reference quickly.
export type ITokenRole = IToken & {
    type: ETokenType.ROLE,
    roleId: IRole["id"],
};

export type ITokenSeat = IToken & {
    type: ETokenType.SEAT,
    index: number,
    roleId: IRole["id"] | undefined,
    name: string | undefined,
    dead: boolean,
    ghostVote: boolean,
    rotate: boolean,
    alignment: ETokenAlignment,
};
