export enum EGameValues {
    MIN_PLAYERS = 5,
    DEFAULT_NEW_GAME = 10,
    MAX_NON_TRAVELLER_PLAYERS = 15,
    MAX_PLAYERS = 20,
};

export enum EJinxState {
    THEORETICAL,
    POTENTIAL,
    ACTIVE,
};
// state: "theoretical" = this jinx exists but only the target is in the script.
// state: "potential" = the target and trick are both in the script.
// state: "active" = the target and trick are both in play.

export enum ERoleIds {
    META = "_meta",
    NO_ROLE = "_norole",
    UNIVERSAL = "_universal",
    UNRECOGNISED = "_unrecognised",
};

export enum ERoleEditions {
    SPECIAL = "special",
};

export enum ERoleTeam {
    TOWNSFOLK = "townsfolk",
    OUTSIDER = "outsider",
    MINION = "minion",
    DEMON = "demon",
    TRAVELLER = "traveller",
    FABLED = "fabled",
    LORIC = "loric",
};

export enum ERoleReminderFlag {
    GLOBAL = "global",
    PUBLIC = "public",
    KILL = "kill",
    DEAD = "dead",
    ROLE = "role",
};

export enum ERoleAlignment {
    DEFAULT = 0,
    INVERSE = 1,
    TRAVELLER_GOOD = 1,
    TRAVELLER_EVIL = 2,
};

export enum ETokenType {
    SEAT,
    ROLE,
    REMINDER,
};

export enum ETokenDirection {
    CLOCKWISE,
    ANTICLOCKWISE,
};


