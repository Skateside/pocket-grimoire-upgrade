<?php

namespace App\Enums;

enum RoleIdEnums: string
{
    case DAWN = 'dawn';
    case DEMON_INFO = 'demoninfo';
    case DUSK = 'dusk';
    case META = '_meta';
    case MINION_INFO = 'minioninfo';
    case NO_ROLE = '_norole';
    case UNIVERSAL = '_universal';
    case UNRECOGNISED = '_unrecognised';
}
