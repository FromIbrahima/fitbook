<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Security\TokenManager;
use App\Service\ApiException;
use App\Service\Presenter;
use App\Service\RequestHelper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/** Profil de l'utilisateur connecté (tous les rôles). */
#[Route('/api/me')]
class MeController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function moi(#[CurrentUser] Utilisateur $u, Presenter $p): JsonResponse
    {
        return $this->json($p->utilisateur($u));
    }

    #[Route('', methods: ['PUT'])]
    public function modifier(#[CurrentUser] Utilisateur $u, Request $request, RequestHelper $helper, EntityManagerInterface $em, Presenter $p): JsonResponse
    {
        $d = $helper->json($request);
        $u->setNom((string) ($d['nom'] ?? $u->getNom()))
            ->setPrenom((string) ($d['prenom'] ?? $u->getPrenom()))
            ->setTelephone(array_key_exists('telephone', $d) ? $d['telephone'] : $u->getTelephone());
        $helper->valider($u);
        $em->flush();

        return $this->json($p->utilisateur($u));
    }

    #[Route('/mot-de-passe', methods: ['PUT'])]
    public function motDePasse(#[CurrentUser] Utilisateur $u, Request $request, RequestHelper $helper, UserPasswordHasherInterface $hasher, EntityManagerInterface $em, TokenManager $tokens): JsonResponse
    {
        $d = $helper->json($request);
        if (!$hasher->isPasswordValid($u, (string) ($d['actuel'] ?? ''))) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, ['actuel' => 'Mot de passe actuel incorrect.']);
        }
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', (string) ($d['nouveau'] ?? ''))) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, ['nouveau' => 'Au moins 8 caractères dont une majuscule, une minuscule et un chiffre.']);
        }
        $u->setPassword($hasher->hashPassword($u, (string) $d['nouveau']));
        $em->flush();

        // les anciens jetons deviennent invalides (empreinte du mot de passe) : on en renvoie un nouveau
        return $this->json(['message' => 'Mot de passe modifié.', 'token' => $tokens->creer($u)]);
    }
}
