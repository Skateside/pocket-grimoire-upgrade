<?php

namespace App\Enums;

enum RoleSpecialTypeEnums: string
{
    case ABILITY = 'ability';
    case PLAYER = 'player';
    case REVEAL = 'reveal';
    case SELECTION = 'selection';
    case SIGNAL = 'signal';
    case VOTE = 'vote';
}
