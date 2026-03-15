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

export enum EReminderFlag {
    DEAD = "dead",
    GLOBAL = "global",
    KILL = "kill",
    PUBLIC = "public",
    ROLE = "role",
};

export enum ERoleEdition {
    TROUBLE_BREWING = "tb",
    BAD_MOON_RISING = "bmr",
    SECTS_AND_VIOLETS = "snv",
    SPECIAL = "special",
};

export enum ERoleId {
    DAWN = "dawn",
    DEMON_INFO = "demoninfo",
    DUSK = "dusk",
    META = "_meta",
    MINION_INFO = "minioninfo",
    NO_ROLE = "_norole",
    UNIVERSAL = "_universal",
    UNRECOGNISED = "_unrecognised",
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

export enum ERoleSpecialGlobal {
    DEAD = "dead",
    DEMON = ERoleTeam.DEMON,
    MINION = ERoleTeam.MINION,
    OUTSIDER = ERoleTeam.OUTSIDER,
    TOWNSFOLK = ERoleTeam.TOWNSFOLK,
    TRAVELLER = ERoleTeam.TRAVELLER,
};

export enum ERoleSpecialName {
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

export enum ERoleSpecialTime {
    DAY = "day",
    FIRST_NIGHT = "firstNight",
    FIRST_DAY = "firstDay",
    OTHER_NIGHT = "otherNight",
    OTHER_DAY = "otherDay",
    PREGAME = "pregame",
    NIGHT = "night",
};

export enum ERoleSpecialType {
    ABILITY = "ability",
    PLAYER = "player",
    REVEAL = "reveal",
    SELECTION = "selection",
    SIGNAL = "signal",
    VOTE = "vote",
};

export enum ETokenAlignment {
    DEFAULT = 0,
    INVERSE = 1,
    TRAVELLER_GOOD = 1,
    TRAVELLER_EVIL = 2,
};

export enum ETokenDirection {
    CLOCKWISE,
    ANTICLOCKWISE,
};

export enum ETokenType {
    SEAT,
    ROLE,
    REMINDER,
};
