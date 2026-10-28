<?php

namespace App\Enum;

enum StatutModeration: string
{
    case EN_ATTENTE = 'EN_ATTENTE';
    case VALIDE = 'VALIDE';
    case REJETE = 'REJETE';
}
