// Co-ordinates - the base of seats and reminders.

export type ICoordinates = {
    x: number,
    y: number,
    z?: number,
};

// Demon Bluffs.

export type IDemonBluffId = IRole["id"]|null;

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

export type IRole = Omit<IRoleRaw, "reminders" | "jinxes"> & {
    // TODO: anything that the Pocket Grimoire needs to manage the role.
    reminders?: IRoleReminder[],
    jinxes?: IRoleJinx[],
};

export type IRoleDeprecatedReminders = IRole & {
    reminders?: string[],
    remindersGlobal?: string[],
};

export type IRoleCoreTeam = "townsfolk" | "outsider" | "minion" | "demon";
export type IRolePlayTeam = IRoleCoreTeam | "traveller";
export type IRoleTeam = IRolePlayTeam | "fabled" | "loric";

export type IRoleReminderFlag = "global" | "public" | "kill" | "dead" | "role";

export type IRoleReminderRaw = {
    name: string,
    count?: number,
    flags?: IRoleReminderFlag[],
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

export type IRoleJinx = IRoleJinxRaw & {
    state: "theoretical" | "potential" | "active",
};
// state: "theoretical" = this jinx exists but only the role is in the script,
//                        the id mentioned here isn't.
// state: "potential" = the role and the id are both in the script, but they not
//                      both in play.
// state: "active" = both the role and id are in play.

export type IRoleMeta = {
    id: "_meta",
    name: string,
    author?: string,
    firstNight?: string[],
    otherNight?: string[],
};

export type IRoleAlignment = 0 | 1 | 2;

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
    name: "bag-disabled" | "bag-duplicate",
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
};

export type IRoleScript = (IRoleMeta | IRole)[];
export type IRoleScriptImport = (IRoleMeta | IRole | IRole["id"] | Pick<IRole, "id">)[];

export type IRoleNightOrder = Record<"first" | "other", {
    role: IRole,
    order: number,
}[]>;

// export type IRoleDemonBluffGroup = {
//     name: string,
//     roles: IRole["id"][],
// };

// export type IRoleDemonBluffs = IRoleDemonBluffGroup[];

// Tokens.

export type IToken = Required<ICoordinates> & {
    id: string,
    type: "seat" | "role" | "reminder",
};

export type ITokenSeat = IToken & {
    type: "seat",
    index?: number,
    role?: IRole["id"],
    name?: string,
    dead?: boolean,
    ghostVote?: boolean,
    rotate?: boolean,
    alignment?: IRoleAlignment,
};

// NOTE: This is for something like a Fabled - on the grimoire pad but not a player.
export type ITokenRole = IToken & {
    type: "role",
    role: IRole["id"],
};

export type ITokenReminder = IToken & {
    type: "reminder",
    reminder: IRoleReminder["id"],
};

// BotC Scripts.

export type IBotcScriptResponse = Record<string, IRoleScriptImport>;
