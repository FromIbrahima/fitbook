<?php

namespace App\Controller;

use App\Entity\Activite;
use App\Entity\Avis;
use App\Entity\Coach;
use App\Entity\Reservation;
use App\Entity\Salle;
use App\Entity\Utilisateur;
use App\Enum\Role;
use App\Enum\StatutModeration;
use App\Enum\StatutReservation;
use App\Repository\ActiviteRepository;
use App\Repository\AvisRepository;
use App\Repository\CoachRepository;
use App\Repository\ReservationRepository;
use App\Repository\SalleRepository;
use App\Repository\SeanceRepository;
use App\Repository\UtilisateurRepository;
use App\Service\ApiException;
use App\Service\Presenter;
use App\Service\RequestHelper;
use App\Service\ReservationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/** Administration (ROLE_ADMIN) : utilisateurs, salles, coachs, activités, réservations, modération des avis. */
#[Route('/api/admin')]
class AdminController extends AbstractController
{
    public function __construct(
        private readonly Presenter $p,
        private readonly RequestHelper $helper,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('/stats', methods: ['GET'])]
    public function stats(UtilisateurRepository $u, SalleRepository $s, CoachRepository $c, SeanceRepository $se, ReservationRepository $r, AvisRepository $a): JsonResponse
    {
        return $this->json([
            'utilisateurs' => $u->count([]),
            'salles' => $s->count([]),
            'coachs' => $c->count([]),
            'seancesAVenir' => $se->compterAVenir(),
            'reservations' => $r->count(['statut' => StatutReservation::CONFIRMEE]),
            'avisEnAttente' => $a->count(['statutModeration' => StatutModeration::EN_ATTENTE]),
        ]);
    }

    // ---------- utilisateurs ----------
    #[Route('/utilisateurs', methods: ['GET'])]
    public function utilisateurs(UtilisateurRepository $repo, Request $request): JsonResponse
    {
        $critere = $request->query->get('role') ? ['role' => Role::tryFrom((string) $request->query->get('role'))] : [];

        return $this->json($this->p->liste($repo->findBy(array_filter($critere), ['nom' => 'ASC']), 'utilisateur'));
    }

    #[Route('/utilisateurs/{id<\d+>}', methods: ['PUT'])]
    public function modifierUtilisateur(#[CurrentUser] Utilisateur $admin, Utilisateur $cible, Request $request): JsonResponse
    {
        $d = $this->helper->json($request);
        if (isset($d['role'])) {
            $role = Role::tryFrom((string) $d['role']) ?? throw new ApiException('Rôle inconnu.', 422, ['role' => 'Rôle inconnu.']);
            if ($cible === $admin && $role !== Role::ADMIN) {
                throw new ApiException('Vous ne pouvez pas retirer votre propre rôle administrateur.', 409);
            }
            $cible->setRole($role);
            if ($role === Role::COACH && $cible->getCoach() === null) {
                $cible->setCoach((new Coach())->setSpecialite('Coach sportif')->setVille('Bruxelles'));
            }
        }
        if (isset($d['estVerifie'])) {
            $cible->setEstVerifie((bool) $d['estVerifie']);
        }
        foreach (['nom' => 'setNom', 'prenom' => 'setPrenom', 'telephone' => 'setTelephone'] as $champ => $setter) {
            if (array_key_exists($champ, $d)) {
                $cible->$setter($d[$champ]);
            }
        }
        $this->helper->valider($cible);
        $this->em->flush();

        return $this->json($this->p->utilisateur($cible));
    }

    #[Route('/utilisateurs/{id<\d+>}', methods: ['DELETE'])]
    public function supprimerUtilisateur(#[CurrentUser] Utilisateur $admin, Utilisateur $cible): JsonResponse
    {
        if ($cible === $admin) {
            throw new ApiException('Vous ne pouvez pas supprimer votre propre compte.', 409);
        }
        if ($cible->getSalles()->count() > 0) {
            throw new ApiException('Ce gestionnaire possède des salles : supprimez-les ou réattribuez-les d\'abord.', 409);
        }
        if ($cible->getCoach()?->getSeances()->count() > 0) {
            throw new ApiException('Ce coach a des séances programmées : supprimez-les d\'abord.', 409);
        }
        $this->em->remove($cible);
        $this->em->flush();

        return $this->json(['message' => 'Utilisateur supprimé.']);
    }

    // ---------- salles & coachs ----------
    #[Route('/salles', methods: ['GET'])]
    public function salles(SalleRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn (Salle $s) => $this->p->salle($s) + ['gestionnaire' => $s->getGestionnaire()?->getNomComplet(), 'nbSeances' => $s->getSeances()->count()], $repo->findBy([], ['nom' => 'ASC'])));
    }

    #[Route('/salles/{id<\d+>}', methods: ['DELETE'])]
    public function supprimerSalle(Salle $salle): JsonResponse
    {
        if ($salle->getSeances()->count() > 0) {
            throw new ApiException('Impossible : cette salle a des séances. Annulez-les d\'abord.', 409);
        }
        $this->em->remove($salle);
        $this->em->flush();

        return $this->json(['message' => 'Salle supprimée.']);
    }

    #[Route('/coachs', methods: ['GET'])]
    public function coachs(CoachRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn (Coach $c) => $this->p->coach($c) + ['email' => $c->getUtilisateur()?->getEmail(), 'nbSeances' => $c->getSeances()->count()], $repo->rechercher([])));
    }

    // ---------- activités (CRUD complet) ----------
    #[Route('/activites', methods: ['GET'])]
    public function activites(ActiviteRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn (Activite $a) => ['id' => $a->getId(), 'nom' => $a->getNom(), 'categorie' => $a->getCategorie()], $repo->findBy([], ['nom' => 'ASC'])));
    }

    #[Route('/activites', methods: ['POST'])]
    public function creerActivite(Request $request): JsonResponse
    {
        $d = $this->helper->json($request);
        $a = (new Activite())->setNom((string) ($d['nom'] ?? ''))->setCategorie((string) ($d['categorie'] ?? ''));
        $this->helper->valider($a);
        $this->em->persist($a);
        $this->em->flush();

        return $this->json(['id' => $a->getId(), 'nom' => $a->getNom(), 'categorie' => $a->getCategorie()], 201);
    }

    #[Route('/activites/{id<\d+>}', methods: ['PUT'])]
    public function modifierActivite(Activite $a, Request $request): JsonResponse
    {
        $d = $this->helper->json($request);
        $a->setNom((string) ($d['nom'] ?? $a->getNom()))->setCategorie((string) ($d['categorie'] ?? $a->getCategorie()));
        $this->helper->valider($a);
        $this->em->flush();

        return $this->json(['id' => $a->getId(), 'nom' => $a->getNom(), 'categorie' => $a->getCategorie()]);
    }

    #[Route('/activites/{id<\d+>}', methods: ['DELETE'])]
    public function supprimerActivite(Activite $a, SeanceRepository $seances): JsonResponse
    {
        if ($seances->count(['activite' => $a]) > 0) {
            throw new ApiException('Impossible : des séances utilisent cette activité.', 409);
        }
        $this->em->remove($a);
        $this->em->flush();

        return $this->json(['message' => 'Activité supprimée.']);
    }

    // ---------- réservations ----------
    #[Route('/reservations', methods: ['GET'])]
    public function reservations(ReservationRepository $repo): JsonResponse
    {
        return $this->json($this->p->liste($repo->findBy([], ['dateReservation' => 'DESC']), 'reservation'));
    }

    #[Route('/reservations/{id<\d+>}/annuler', methods: ['POST'])]
    public function annulerReservation(Reservation $r, ReservationService $service): JsonResponse
    {
        return $this->json(['message' => 'Réservation annulée.', 'reservation' => $this->p->reservation($service->annuler($r, null))]);
    }

    // ---------- modération des avis et notes ----------
    #[Route('/avis', methods: ['GET'])]
    public function avis(AvisRepository $repo, Request $request): JsonResponse
    {
        $statut = StatutModeration::tryFrom((string) $request->query->get('statut', ''));

        return $this->json($this->p->liste($repo->findBy($statut ? ['statutModeration' => $statut] : [], ['dateAvis' => 'DESC']), 'avis'));
    }

    #[Route('/avis/{id<\d+>}/valider', methods: ['POST'])]
    public function validerAvis(Avis $avis): JsonResponse
    {
        $avis->valider();
        $this->em->flush();

        return $this->json($this->p->avis($avis));
    }

    #[Route('/avis/{id<\d+>}/rejeter', methods: ['POST'])]
    public function rejeterAvis(Avis $avis): JsonResponse
    {
        $avis->rejeter();
        $this->em->flush();

        return $this->json($this->p->avis($avis));
    }

    #[Route('/avis/{id<\d+>}', methods: ['DELETE'])]
    public function supprimerAvis(Avis $avis): JsonResponse
    {
        $this->em->remove($avis);
        $this->em->flush();

        return $this->json(['message' => 'Avis supprimé.']);
    }
}
