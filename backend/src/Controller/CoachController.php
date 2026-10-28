<?php

namespace App\Controller;

use App\Entity\Disponibilite;
use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Enum\StatutReservation;
use App\Enum\StatutSeance;
use App\Repository\AvisRepository;
use App\Repository\ReservationRepository;
use App\Security\Voter\SeanceVoter;
use App\Service\ApiException;
use App\Service\Notifier;
use App\Service\Presenter;
use App\Service\RequestHelper;
use App\Service\SeanceFormHandler;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/** Espace coach (ROLE_COACH) : profil pro, séances CRUD, disponibilités, calendrier, réservations, avis. */
#[Route('/api/coach')]
class CoachController extends AbstractController
{
    public function __construct(
        private readonly Presenter $p,
        private readonly RequestHelper $helper,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('/profil', methods: ['GET'])]
    public function profil(#[CurrentUser] Utilisateur $u): JsonResponse
    {
        return $this->json($this->p->coach($this->coach($u), true));
    }

    #[Route('/profil', methods: ['PUT'])]
    public function modifierProfil(#[CurrentUser] Utilisateur $u, Request $request): JsonResponse
    {
        $c = $this->coach($u);
        $d = $this->helper->json($request);
        $c->setSpecialite((string) ($d['specialite'] ?? $c->getSpecialite()))
            ->setBiographie($d['biographie'] ?? $c->getBiographie())
            ->setTarifHoraire((float) ($d['tarifHoraire'] ?? $c->getTarifHoraire()))
            ->setVille((string) ($d['ville'] ?? $c->getVille()));
        $this->helper->valider($c);
        $this->em->flush();

        return $this->json($this->p->coach($c, true));
    }

    /** Toutes les séances du coach (sert aussi au calendrier). */
    #[Route('/seances', methods: ['GET'])]
    public function seances(#[CurrentUser] Utilisateur $u): JsonResponse
    {
        return $this->json($this->p->liste($this->coach($u)->getSeances(), 'seance'));
    }

    #[Route('/seances', methods: ['POST'])]
    public function creer(#[CurrentUser] Utilisateur $u, Request $request, SeanceFormHandler $form): JsonResponse
    {
        $seance = $form->appliquer($this->helper->json($request), new Seance(), $this->coach($u));
        $this->em->persist($seance);
        $this->em->flush();

        return $this->json(['message' => 'Séance créée.', 'seance' => $this->p->seance($seance)], 201);
    }

    #[Route('/seances/{id<\d+>}', methods: ['PUT'])]
    #[IsGranted(SeanceVoter::GERER, subject: 'seance', message: 'Cette séance ne vous appartient pas.')]
    public function modifier(#[CurrentUser] Utilisateur $u, Seance $seance, Request $request, SeanceFormHandler $form): JsonResponse
    {
        $form->appliquer($this->helper->json($request), $seance, $this->coach($u));
        $this->em->flush();

        return $this->json(['message' => 'Séance modifiée.', 'seance' => $this->p->seance($seance)]);
    }

    /** Sans inscrit : suppression. Avec inscrits : annulation + email à chaque sportif. */
    #[Route('/seances/{id<\d+>}', methods: ['DELETE'])]
    #[IsGranted(SeanceVoter::GERER, subject: 'seance', message: 'Cette séance ne vous appartient pas.')]
    public function supprimer(Seance $seance, Notifier $notifier): JsonResponse
    {
        if ($seance->getReservations()->count() === 0) {
            $this->em->remove($seance);
            $this->em->flush();

            return $this->json(['message' => 'Séance supprimée.']);
        }
        $seance->annuler();
        $this->em->flush();
        $n = $notifier->seanceAnnulee($seance);

        return $this->json(['message' => "Séance annulée, $n participant(s) prévenu(s) par email.", 'seance' => $this->p->seance($seance)]);
    }

    #[Route('/disponibilites', methods: ['GET'])]
    public function disponibilites(#[CurrentUser] Utilisateur $u): JsonResponse
    {
        return $this->json($this->p->liste($this->coach($u)->getDisponibilites(), 'disponibilite'));
    }

    #[Route('/disponibilites', methods: ['POST'])]
    public function ajouterDisponibilite(#[CurrentUser] Utilisateur $u, Request $request): JsonResponse
    {
        $d = $this->helper->json($request);
        $dispo = (new Disponibilite())->setJourSemaine((int) ($d['jourSemaine'] ?? 0))
            ->setHeureDebut(RequestHelper::heure($d['heureDebut'] ?? null, 'heureDebut'))
            ->setHeureFin(RequestHelper::heure($d['heureFin'] ?? null, 'heureFin'));
        $this->helper->valider($dispo);
        $coach = $this->coach($u);
        foreach ($coach->getDisponibilites() as $autre) {
            if ($dispo->chevauche($autre)) {
                throw new ApiException('Le formulaire contient des erreurs.', 422, ['heureDebut' => 'Ce créneau chevauche une disponibilité existante.']);
            }
        }
        $coach->ajouterDisponibilite($dispo);
        $this->em->flush();

        return $this->json($this->p->disponibilite($dispo), 201);
    }

    #[Route('/disponibilites/{id<\d+>}', methods: ['DELETE'])]
    public function supprimerDisponibilite(#[CurrentUser] Utilisateur $u, Disponibilite $dispo): JsonResponse
    {
        if ($dispo->getCoach() !== $this->coach($u)) {
            throw new ApiException('Cette disponibilité ne vous appartient pas.', 403);
        }
        $this->em->remove($dispo);
        $this->em->flush();

        return $this->json(['message' => 'Disponibilité supprimée.']);
    }

    #[Route('/reservations', methods: ['GET'])]
    public function reservations(#[CurrentUser] Utilisateur $u, ReservationRepository $repo): JsonResponse
    {
        $liste = $repo->createQueryBuilder('r')->join('r.seance', 's')->where('s.coach = :c')->setParameter('c', $this->coach($u))
            ->orderBy('s.dateDebut', 'ASC')->getQuery()->getResult();

        return $this->json($this->p->liste($liste, 'reservation'));
    }

    #[Route('/avis', methods: ['GET'])]
    public function avis(#[CurrentUser] Utilisateur $u, AvisRepository $repo): JsonResponse
    {
        return $this->json($this->p->liste($repo->findBy(['coach' => $this->coach($u)], ['dateAvis' => 'DESC']), 'avis'));
    }

    #[Route('/stats', methods: ['GET'])]
    public function stats(#[CurrentUser] Utilisateur $u): JsonResponse
    {
        $c = $this->coach($u);
        $now = new \DateTimeImmutable();
        $aVenir = $participants = $capacite = 0;
        foreach ($c->getSeances() as $s) {
            if ($s->getStatut() === StatutSeance::ANNULEE) {
                continue;
            }
            $aVenir += $s->getDateDebut() > $now ? 1 : 0;
            $participants += $s->nombreInscrits();
            $capacite += $s->getCapaciteMax();
        }

        return $this->json([
            'seancesAVenir' => $aVenir,
            'participants' => $participants,
            'tauxRemplissage' => $capacite ? round(100 * $participants / $capacite, 1) : 0,
            'noteMoyenne' => $c->noteMoyenne(),
        ]);
    }

    private function coach(Utilisateur $u): \App\Entity\Coach
    {
        return $u->getCoach() ?? throw new ApiException('Profil coach introuvable.', 404);
    }
}
