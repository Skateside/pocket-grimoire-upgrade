<?php

namespace App\Enums;

enum ReminderFlagEnums: string
{
    case DEAD = 'dead';
    case GLOBAL = 'global';
    case KILL = 'kill';
    case PUBLIC = 'public';
    case ROLE = 'role';
}
