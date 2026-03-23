<?php

namespace App\Enums;

enum RoleSpecialNameEnums: string
{
    case BAG_DISABLED = 'bag-disabled';
    case BAG_DUPLICATE = 'bag-duplicate';
    case CARD = 'card';
    case DISTRIBUTE_ROLES = 'distribute-roles';
    case GHOST_VOTES = 'ghost-votes';
    case GOOD_DUPLICATE = 'good-duplicate';
    case GRIMOIRE = 'grimoire';
    case HIDDEN = 'hidden';
    case MULTIPLIER = 'multiplier';
    case OPEN_EYES = 'open-eyes';
    case PLAYER = 'player';
    case POINTING = 'pointing';
    case REPLACE_CHARACTER = 'replace-character';
}
