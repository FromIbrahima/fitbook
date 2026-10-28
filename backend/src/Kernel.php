<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    public function boot(): void
    {
        // toutes les dates de l'application sont à l'heure de Bruxelles (comme le serveur MySQL local)
        date_default_timezone_set($_SERVER['APP_TIMEZONE'] ?? $_ENV['APP_TIMEZONE'] ?? 'Europe/Brussels');
        parent::boot();
    }
}
