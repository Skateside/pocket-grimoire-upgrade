import {
    EJinxState,
    ERoleAlignment,
    ERoleIds,
    ERoleReminderFlag,
    ERoleTeam,
    ETokenType,
} from "../enums/data";

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

export type IGameBreakdown = Record<IRoleCoreTeam, number>;
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

export type IJinx = {
    target: IRole,
    trick: IRole,
    reason: IRoleJinxRaw["reason"],
    state: EJinxState,
};

// The Grimoire Pad.

export type IPad = Pick<DOMRect, "left" | "top" | "right" | "bottom">;

// Roles.

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

/*
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
*/
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

// Tokens.

export type IToken = Required<ICoordinates> & {
    id: string,
    type: ETokenType,
};

export type ITokenSeat = IToken & {
    type: ETokenType.SEAT,
    index?: number,
    role?: IRole["id"],
    name?: string,
    dead?: boolean,
    ghostVote?: boolean,
    rotate?: boolean,
    alignment?: ERoleAlignment,
};

// NOTE: This is for something like a Fabled - on the grimoire pad but not a player.
export type ITokenRole = IToken & {
    type: ETokenType.ROLE,
    role: IRole["id"],
};

export type ITokenReminder = IToken & {
    type: ETokenType.REMINDER,
    reminder: IRoleReminder["id"],
};

// BotC Scripts.

export type IBotcScriptResponse = {
    id: number,
    author: string,
    name: string,
    version: string,
    script: IRoleScriptImport,
    type: 'full' | 'teensyvilly' | 'unknown',
};
