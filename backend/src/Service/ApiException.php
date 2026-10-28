<?php

namespace App\Service;

/** Erreur métier renvoyée au frontend en JSON avec un code HTTP. */
class ApiException extends \RuntimeException
{
    /** @param array<string, string> $erreurs */
    public function __construct(string $message, public readonly int $statut = 400, public readonly array $erreurs = [])
    {
        parent::__construct($message);
    }
}
