<?php

namespace App\Security;

use App\Repository\UtilisateurRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

/**
 * Lit le jeton sur chaque requête /api :
 *  - en-tête "Authorization: Bearer <jeton>" (standard)
 *  - ou en-tête "X-Auth-Token: <jeton>" (copie envoyée par Angular : Apache / WAMP supprime
 *    parfois l'en-tête Authorization avant qu'il arrive à PHP).
 */
class ApiTokenAuthenticator extends AbstractAuthenticator implements AuthenticationEntryPointInterface
{
    public function __construct(
        private readonly TokenManager $tokens,
        private readonly UtilisateurRepository $utilisateurs,
    ) {
    }

    public function supports(Request $request): ?bool
    {
        return self::jeton($request) !== null;
    }

    private static function jeton(Request $request): ?string
    {
        $auth = (string) $request->headers->get('Authorization');
        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        $copie = trim((string) $request->headers->get('X-Auth-Token'));

        return $copie !== '' ? $copie : null;
    }

    public function authenticate(Request $request): Passport
    {
        $jeton = (string) self::jeton($request);
        $data = $this->tokens->lire($jeton);
        if ($data === null) {
            throw new CustomUserMessageAuthenticationException('Session expirée ou jeton invalide.');
        }

        return new SelfValidatingPassport(new UserBadge((string) $data['id'], function (string $id) use ($data) {
            $u = $this->utilisateurs->find((int) $id);
            if ($u === null || !$u->isEstVerifie() || $this->tokens->empreinte($u) !== $data['empreinte']) {
                throw new CustomUserMessageAuthenticationException('Session expirée ou jeton invalide.');
            }

            return $u;
        }));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null; // la requête continue normalement
    }

    /**
     * Jeton périmé ou invalide (ex. base recréée, ancien jeton resté dans le navigateur) :
     * on continue comme un visiteur. Les routes publiques (recherche, connexion…) fonctionnent ;
     * les routes protégées répondent 401 grâce à start() ci-dessous.
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $request->attributes->set('_jeton_invalide', true);

        return null;
    }

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        $message = $request->attributes->get('_jeton_invalide') ? 'Session expirée ou jeton invalide.' : 'Authentification requise.';

        return new JsonResponse(['message' => $message], Response::HTTP_UNAUTHORIZED);
    }
}
