<?php

namespace App\Security\Voter;

use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Enum\Role;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/** Qui peut modifier / supprimer une séance ? Son coach, le gestionnaire de la salle, ou un admin. */
class SeanceVoter extends Voter
{
    public const GERER = 'SEANCE_GERER';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::GERER && $subject instanceof Seance;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $u = $token->getUser();
        if (!$u instanceof Utilisateur) {
            return false;
        }

        return match ($u->getRole()) {
            Role::ADMIN => true,
            Role::COACH => $subject->getCoach()?->getUtilisateur() === $u,
            Role::GESTIONNAIRE => $subject->getSalle()?->getGestionnaire() === $u,
            default => false,
        };
    }
}
