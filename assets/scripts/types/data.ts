// Co-ordinates - the base of seats and reminders.

export type ICoordinates = {
    x: number,
    y: number,
    z?: number,
};

// The breakdown of role types.

export type IGame = Record<number, Record<IRoleCoreTeam, number>>;

// Internationalisation information.

export type II18nData = Record<string, string>;

// Info Tokens.

export type IInfoToken = {
    id: string,
    text: string,
    colour: IInfoTokenColours,
    isCustom?: boolean,
    roleIds?: string[],
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

// Roles.

export type IRole = {
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
    reminders?: IRoleReminder[],
    jinxes?: IRoleJinx[],
    special?: IRoleSpecial[],
} & {
    // TODO: anything that the Pocket Grimoire needs to manage the role.
};

export type IRoleDeprecatedReminders = IRole & {
    reminders?: string[],
    remindersGlobal?: string[],
};

export type IRoleCoreTeam = "townsfolk" | "outsider" | "minion" | "demon";
export type IRolePlayTeam = IRoleCoreTeam | "traveller";
export type IRoleTeam = IRolePlayTeam | "fabled";

export type IRoleReminderFlag = "global" | "public" | "kill" | "dead" | "role";

export type IRoleReminder = {
    name: string,
    count?: number,
    flags?: IRoleReminderFlag[],
} & {
    role: IRole, // A reference back to the role.
    image?: string, // Create a seperate image for universal reminders.
};

export type IRoleJinx = {
    id: string,
    reason: string,
} & {
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

export type IRoleSpecial = {
    type: (
        "ability"
        | "reveal"
        | "selection"
        | "signal"
        | "vote"
    ),
    name: (
        "bag-disabled"
        | "bag-duplicate"
        | "card"
        | "distribute-votes"
        | "ghost-votes"
        | "grimoire"
        | "hidden"
        | "player"
        | "pointing"
        | "multiplier"
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
    global?: IRolePlayTeam,
};

export type IRoleScript = (IRoleMeta | IRole)[];

export type IRoleScriptImport = (IRoleMeta | IRole | IRole["id"])[];

// Tokens.

export type IToken = Required<ICoordinates> & {
    id: string,
    type: "seat" | "role" | "reminder",
};

export type ITokenSeat = IToken & {
    type: "seat",
    role?: IRole["id"],
    name?: string,
};

// NOTE: This is for something like a Fabled - on the grimoire pad but not a player.
export type ITokenRole = IToken & {
    type: "role",
    role: IRole["id"],
};

export type ITokenReminder = IToken & {
    type: "reminder",
};

// BotC Scripts.

export type IBotcScriptResponse = {
    count: number,
    next: string | null,
    previous: string | null,
    results: {
        author: string,
        content: IRoleScript,
        name: string,
        pk: number,
        score: number,
        version: string,
    }[],
};
