<?php

namespace App\Security;

use App\Entity\Utilisateur;

/**
 * Jeton d'API signé (HMAC-SHA256 avec APP_SECRET) : aucune donnée sensible stockée,
 * expiration intégrée, invalidé si le mot de passe change (empreinte du hash incluse).
 * Format : base64url("id|expiration|empreinte") . "." . signature
 */
class TokenManager
{
    public const DUREE_SECONDES = 8 * 3600;

    public function __construct(private readonly string $appSecret)
    {
    }

    public function creer(Utilisateur $u, ?int $maintenant = null): string
    {
        $exp = ($maintenant ?? time()) + self::DUREE_SECONDES;
        $payload = $u->getId().'|'.$exp.'|'.$this->empreinte($u);

        return self::b64($payload).'.'.hash_hmac('sha256', $payload, $this->appSecret);
    }

    /** @return array{id: int, exp: int, empreinte: string}|null */
    public function lire(string $token, ?int $maintenant = null): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return null;
        }
        $payload = base64_decode(strtr($parts[0], '-_', '+/'), true);
        if ($payload === false || !hash_equals(hash_hmac('sha256', $payload, $this->appSecret), $parts[1])) {
            return null;
        }
        $champs = explode('|', $payload);
        if (count($champs) !== 3 || (int) $champs[1] < ($maintenant ?? time())) {
            return null;
        }

        return ['id' => (int) $champs[0], 'exp' => (int) $champs[1], 'empreinte' => $champs[2]];
    }

    public function empreinte(Utilisateur $u): string
    {
        return substr(hash('sha256', $u->getPassword()), 0, 12);
    }

    private static function b64(string $s): string
    {
        return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    }
}
