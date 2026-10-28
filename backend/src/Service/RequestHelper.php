<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Lecture du corps JSON + validation backend (Symfony Validator). */
class RequestHelper
{
    public function __construct(private readonly ValidatorInterface $validator)
    {
    }

    /** @return array<string, mixed> */
    public function json(Request $request): array
    {
        $data = json_decode($request->getContent() ?: '{}', true);
        if (!is_array($data)) {
            throw new ApiException('Corps de requête JSON invalide.', 400);
        }

        return $data;
    }

    /** Valide les contraintes #[Assert\...] de l'entité ; lève une erreur 422 détaillée par champ. */
    public function valider(object $entite, array $erreursSupplementaires = []): void
    {
        $erreurs = $erreursSupplementaires + $this->erreurs($entite);
        if ($erreurs) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, $erreurs);
        }
    }

    /** @return array<string, string> erreurs de validation par champ (vide si tout est valide) */
    public function erreurs(object $entite): array
    {
        $erreurs = [];
        foreach ($this->validator->validate($entite) as $v) {
            $erreurs[$v->getPropertyPath() ?: 'global'] ??= $v->getMessage();
        }

        return $erreurs;
    }

    public static function date(mixed $valeur, string $champ): \DateTimeImmutable
    {
        if (!is_string($valeur) || ($d = date_create_immutable($valeur)) === false) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, [$champ => 'Date invalide.']);
        }

        return $d;
    }

    public static function heure(mixed $valeur, string $champ): \DateTimeImmutable
    {
        if (!is_string($valeur) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', $valeur)) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, [$champ => 'Heure invalide (format HH:MM).']);
        }

        return new \DateTimeImmutable('1970-01-01 '.$valeur);
    }
}
