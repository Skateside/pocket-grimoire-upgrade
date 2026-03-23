<?php

namespace App\Enums;

enum RoleTeamEnums: string
{
    case TOWNSFOLK = 'townsfolk';
    case OUTSIDER = 'outsider';
    case MINION = 'minion';
    case DEMON = 'demon';
    case TRAVELLER = 'traveller';
    case FABLED = 'fabled';
    case LORIC = 'loric';
}
