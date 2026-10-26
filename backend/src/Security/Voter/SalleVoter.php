<?php

namespace App\Security\Voter;

use App\Entity\Salle;
use App\Entity\Utilisateur;
use App\Enum\Role;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/** Seul le gestionnaire de la salle (ou un admin) peut la gérer. */
class SalleVoter extends Voter
{
    public const GERER = 'SALLE_GERER';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::GERER && $subject instanceof Salle;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $u = $token->getUser();

        return $u instanceof Utilisateur && ($u->getRole() === Role::ADMIN || $subject->getGestionnaire() === $u);
    }
}
