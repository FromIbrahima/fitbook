<?php

namespace App\Enum;

enum Role: string
{
    case SPORTIF = 'SPORTIF';
    case COACH = 'COACH';
    case GESTIONNAIRE = 'GESTIONNAIRE';
    case ADMIN = 'ADMIN';
}
