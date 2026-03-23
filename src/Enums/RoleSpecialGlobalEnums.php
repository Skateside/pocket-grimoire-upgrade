<?php

namespace App\Enums;

enum RoleSpecialGlobalEnums: string
{
    case DEAD = 'dead';
    case DEMON = 'demon';
    case MINION = 'minion';
    case OUTSIDER = 'outsider';
    case TOWNSFOLK = 'townsfolk';
    case TRAVELLER = 'traveller';
}
