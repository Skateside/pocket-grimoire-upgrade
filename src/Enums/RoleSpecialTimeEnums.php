<?php

namespace App\Enums;

enum RoleSpecialTimeEnums: string
{
    case DAY = 'day';
    case FIRST_NIGHT = 'firstNight';
    case FIRST_DAY = 'firstDay';
    case OTHER_NIGHT = 'otherNight';
    case OTHER_DAY = 'otherDay';
    case PREGAME = 'pregame';
    case NIGHT = 'night';
}
