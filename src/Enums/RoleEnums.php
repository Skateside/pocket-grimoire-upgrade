<?php

namespace App\Enums;

// Sometimes the values can be the same but the keys are different. A `class`
// will allow for that whereas an `enum` won't. Although we could have multiple
// role enums, at the moment I prefer having the strings all in the same file
// for ease of reference.

class RoleEnums {
    const ID_DAWN = 'dawn';
    const ID_DEMON_INFO = 'demoninfo';
    const ID_DUSK = 'dusk';
    const ID_META = '_meta';
    const ID_MINION_INFO = 'minioninfo';
    const ID_NO_ROLE = '_norole';
    const ID_UNIVERSAL = '_universal';
    const ID_UNRECOGNISED = '_unrecognised';

    const SPECIAL_GLOBAL_DEAD = 'dead';
    const SPECIAL_GLOBAL_DEMON = 'demon';
    const SPECIAL_GLOBAL_MINION = 'minion';
    const SPECIAL_GLOBAL_OUTSIDER = 'outsider';
    const SPECIAL_GLOBAL_TOWNSFOLK = 'townsfolk';
    const SPECIAL_GLOBAL_TRAVELLER = 'traveller';

    const SPECIAL_NAME_BAG_DISABLED = 'bag-disabled';
    const SPECIAL_NAME_BAG_DUPLICATE = 'bag-duplicate';
    const SPECIAL_NAME_CARD = 'card';
    const SPECIAL_NAME_DISTRIBUTE_ROLES = 'distribute-roles';
    const SPECIAL_NAME_GHOST_VOTES = 'ghost-votes';
    const SPECIAL_NAME_GOOD_DUPLICATE = 'good-duplicate';
    const SPECIAL_NAME_GRIMOIRE = 'grimoire';
    const SPECIAL_NAME_HIDDEN = 'hidden';
    const SPECIAL_NAME_MULTIPLIER = 'multiplier';
    const SPECIAL_NAME_OPEN_EYES = 'open-eyes';
    const SPECIAL_NAME_PLAYER = 'player';
    const SPECIAL_NAME_POINTING = 'pointing';
    const SPECIAL_NAME_REPLACE_CHARACTER = 'replace-character';

    const SPECIAL_TIME_DAY = 'day';
    const SPECIAL_TIME_FIRST_NIGHT = 'firstNight';
    const SPECIAL_TIME_FIRST_DAY = 'firstDay';
    const SPECIAL_TIME_OTHER_NIGHT = 'otherNight';
    const SPECIAL_TIME_OTHER_DAY = 'otherDay';
    const SPECIAL_TIME_PREGAME = 'pregame';
    const SPECIAL_TIME_NIGHT = 'night';

    const SPECIAL_TYPE_ABILITY = 'ability';
    const SPECIAL_TYPE_PLAYER = 'player';
    const SPECIAL_TYPE_REVEAL = 'reveal';
    const SPECIAL_TYPE_SELECTION = 'selection';
    const SPECIAL_TYPE_SIGNAL = 'signal';
    const SPECIAL_TYPE_VOTE = 'vote';

    const TEAM_TOWNSFOLK = 'townsfolk';
    const TEAM_OUTSIDER = 'outsider';
    const TEAM_MINION = 'minion';
    const TEAM_DEMON = 'demon';
    const TEAM_TRAVELLER = 'traveller';
    const TEAM_FABLED = 'fabled';
    const TEAM_LORIC = 'loric';
}
