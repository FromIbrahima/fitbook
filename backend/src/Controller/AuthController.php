<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Entity\Utilisateur;
use App\Enum\Role;
use App\Repository\UtilisateurRepository;
use App\Security\TokenManager;
use App\Service\ApiException;
use App\Service\Notifier;
use App\Service\Presenter;
use App\Service\RequestHelper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly RequestHelper $helper,
        private readonly Presenter $presenter,
    ) {
    }

    /** Inscription : sportif, coach ou gestionnaire (jamais admin). Un email de confirmation est envoyé. */
    #[Route('/inscription', methods: ['POST'])]
    public function inscription(Request $request, UserPasswordHasherInterface $hasher, Notifier $notifier): JsonResponse
    {
        $d = $this->helper->json($request);
        $role = Role::tryFrom((string) ($d['role'] ?? 'SPORTIF'));
        if ($role === null || $role === Role::ADMIN) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, ['role' => 'Rôle non autorisé.']);
        }
        $mdp = (string) ($d['motDePasse'] ?? '');
        $erreurMdp = preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $mdp)
            ? [] : ['motDePasse' => 'Au moins 8 caractères dont une majuscule, une minuscule et un chiffre.'];

        $u = (new Utilisateur())
            ->setEmail((string) ($d['email'] ?? ''))->setNom((string) ($d['nom'] ?? ''))->setPrenom((string) ($d['prenom'] ?? ''))
            ->setTelephone($d['telephone'] ?? null)->setRole($role)
            ->setTokenConfirmation(bin2hex(random_bytes(32)));
        $this->helper->valider($u, $erreurMdp); // toutes les erreurs du formulaire sont renvoyées en une fois
        $u->setPassword($hasher->hashPassword($u, $mdp));

        if ($role === Role::COACH) {
            $coach = (new Coach())->setSpecialite((string) ($d['specialite'] ?? 'Coach sportif'))->setVille((string) ($d['ville'] ?? 'Bruxelles'));
            $u->setCoach($coach);
            $this->helper->valider($coach);
        }
        $this->em->persist($u);
        $this->em->flush();
        $notifier->confirmationInscription($u);

        return $this->json([
            'message' => 'Compte créé. Un email de confirmation a été envoyé à '.$u->getEmail().'.',
            'utilisateur' => $this->presenter->utilisateur($u),
        ], 201);
    }

    #[Route('/confirmer', methods: ['POST'])]
    public function confirmer(Request $request, UtilisateurRepository $repo): JsonResponse
    {
        $token = (string) ($this->helper->json($request)['token'] ?? '');
        $u = $token !== '' ? $repo->findOneBy(['tokenConfirmation' => $token]) : null;
        if ($u === null || !$u->confirmerEmail($token)) {
            throw new ApiException('Lien de confirmation invalide ou déjà utilisé.', 400);
        }
        $this->em->flush();

        return $this->json(['message' => 'Email confirmé, vous pouvez vous connecter.']);
    }

    #[Route('/connexion', methods: ['POST'])]
    public function connexion(Request $request, UtilisateurRepository $repo, UserPasswordHasherInterface $hasher, TokenManager $tokens): JsonResponse
    {
        $d = $this->helper->json($request);
        $u = $repo->findOneBy(['email' => mb_strtolower(trim((string) ($d['email'] ?? '')))]);
        // message identique si l'email n'existe pas : on ne révèle pas quels comptes existent
        if ($u === null || !$hasher->isPasswordValid($u, (string) ($d['motDePasse'] ?? ''))) {
            throw new ApiException('Email ou mot de passe incorrect.', 401);
        }
        if (!$u->isEstVerifie()) {
            throw new ApiException('Veuillez d\'abord confirmer votre adresse email (lien reçu par email).', 403);
        }
        if ($hasher->needsRehash($u)) {
            $u->setPassword($hasher->hashPassword($u, (string) $d['motDePasse']));
            $this->em->flush();
        }

        return $this->json(['token' => $tokens->creer($u), 'expireDans' => TokenManager::DUREE_SECONDES, 'utilisateur' => $this->presenter->utilisateur($u)]);
    }
}
