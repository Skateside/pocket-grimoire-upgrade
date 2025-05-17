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
    reminders?: string[],
    remindersGlobal?: string[],
    jinxes?: IRoleJinx[],
    special?: IRoleSpecial[],
};

export type IRoleCoreTeam = "townsfolk" | "outsider" | "minion" | "demon";
export type IRolePlayTeam = IRoleCoreTeam | "traveller";
export type IRoleTeam = IRolePlayTeam | "fabled";

export type IRoleJinx = {
    id: string,
    reason: string,
    // state: "theoretical" | "potential" | "active",
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

export type IRoleScript = (IRoleMeta | IRole | IRole["id"])[];

// Seats.

export type ISeat = Required<ICoordinates> & {
    id: string,
    role?: IRole["id"],
    name?: string,
};

