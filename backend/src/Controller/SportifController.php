<?php

namespace App\Controller;

use App\Entity\Avis;
use App\Entity\Reservation;
use App\Entity\Salle;
use App\Entity\Utilisateur;
use App\Enum\StatutReservation;
use App\Repository\AvisRepository;
use App\Repository\CoachRepository;
use App\Repository\ReservationRepository;
use App\Repository\SalleRepository;
use App\Repository\SeanceRepository;
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

/** Espace sportif (ROLE_SPORTIF via access_control) : réservations, historique, favoris, avis. */
#[Route('/api/sportif')]
class SportifController extends AbstractController
{
    public function __construct(
        private readonly Presenter $p,
        private readonly RequestHelper $helper,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /** Réservations à venir + historique (passées ou annulées) */
    #[Route('/reservations', methods: ['GET'])]
    public function reservations(#[CurrentUser] Utilisateur $u, ReservationRepository $repo): JsonResponse
    {
        $toutes = $repo->findBy(['utilisateur' => $u], ['dateReservation' => 'DESC']);
        $now = new \DateTimeImmutable();
        $aVenir = $historique = [];
        foreach ($toutes as $r) {
            if ($r->getStatut() === StatutReservation::CONFIRMEE && $r->getSeance()->getDateDebut() > $now) {
                $aVenir[] = $this->p->reservation($r);
            } else {
                $historique[] = $this->p->reservation($r);
            }
        }
        usort($aVenir, fn ($a, $b) => $a['seance']['dateDebut'] <=> $b['seance']['dateDebut']);

        return $this->json(['aVenir' => $aVenir, 'historique' => $historique]);
    }

    #[Route('/reservations', methods: ['POST'])]
    public function reserver(#[CurrentUser] Utilisateur $u, Request $request, SeanceRepository $seances, ReservationService $service): JsonResponse
    {
        $id = (int) ($this->helper->json($request)['seanceId'] ?? 0);
        $seance = $seances->find($id) ?? throw new ApiException('Séance introuvable.', 404);
        $r = $service->reserver($u, $seance);

        return $this->json(['message' => 'Réservation confirmée ! Un email vous a été envoyé.', 'reservation' => $this->p->reservation($r)], 201);
    }

    #[Route('/reservations/{id<\d+>}/annuler', methods: ['POST'])]
    public function annuler(#[CurrentUser] Utilisateur $u, Reservation $reservation, ReservationService $service): JsonResponse
    {
        $r = $service->annuler($reservation, $u);

        return $this->json(['message' => 'Réservation annulée.', 'reservation' => $this->p->reservation($r)]);
    }

    #[Route('/favoris', methods: ['GET'])]
    public function favoris(#[CurrentUser] Utilisateur $u): JsonResponse
    {
        $salles = [];
        foreach ($u->getFavoris() as $f) {
            $salles[] = $this->p->salle($f->getSalle(), false, $u) + ['dateAjout' => $f->getDateAjout()->format(DATE_ATOM)];
        }

        return $this->json($salles);
    }

    #[Route('/favoris/{id<\d+>}', methods: ['POST'])]
    public function ajouterFavori(#[CurrentUser] Utilisateur $u, Salle $salle): JsonResponse
    {
        $u->ajouterFavori($salle);
        $this->em->flush();

        return $this->json(['message' => $salle->getNom().' ajoutée à vos favoris.', 'estFavori' => true]);
    }

    #[Route('/favoris/{id<\d+>}', methods: ['DELETE'])]
    public function retirerFavori(#[CurrentUser] Utilisateur $u, Salle $salle): JsonResponse
    {
        $u->retirerFavori($salle);
        $this->em->flush();

        return $this->json(['message' => $salle->getNom().' retirée de vos favoris.', 'estFavori' => false]);
    }

    #[Route('/avis', methods: ['GET'])]
    public function mesAvis(#[CurrentUser] Utilisateur $u, AvisRepository $repo): JsonResponse
    {
        return $this->json($this->p->liste($repo->findBy(['auteur' => $u], ['dateAvis' => 'DESC']), 'avis'));
    }

    /**
     * Publier un avis + note sur une salle OU un coach.
     * Règles : avoir réservé au moins une séance dans cette salle / avec ce coach, un seul avis par cible.
     * L'avis est publié après modération par un administrateur.
     */
    #[Route('/avis', methods: ['POST'])]
    public function publierAvis(#[CurrentUser] Utilisateur $u, Request $request, SalleRepository $salles, CoachRepository $coachs, AvisRepository $avisRepo, ReservationRepository $resas): JsonResponse
    {
        $d = $this->helper->json($request);
        $salle = !empty($d['salleId']) ? $salles->find((int) $d['salleId']) : null;
        $coach = !empty($d['coachId']) ? $coachs->find((int) $d['coachId']) : null;

        $avis = (new Avis())->setAuteur($u)->setSalle($salle)->setCoach($coach)
            ->setNote((int) ($d['note'] ?? 0))->setCommentaire($d['commentaire'] ?? null);
        $this->helper->valider($avis);

        $critere = $salle ? ['salle' => $salle] : ['coach' => $coach];
        if ($avisRepo->findOneBy(['auteur' => $u] + $critere)) {
            throw new ApiException('Vous avez déjà donné votre avis.', 409);
        }
        $aParticipe = $resas->createQueryBuilder('r')->select('COUNT(r.id)')->join('r.seance', 's')
            ->where('r.utilisateur = :u')->setParameter('u', $u)
            ->andWhere($salle ? 's.salle = :cible' : 's.coach = :cible')->setParameter('cible', $salle ?? $coach)
            ->getQuery()->getSingleScalarResult();
        if ((int) $aParticipe === 0) {
            throw new ApiException('Vous devez avoir réservé une séance pour donner votre avis.', 403);
        }
        $this->em->persist($avis);
        $this->em->flush();

        return $this->json(['message' => 'Merci ! Votre avis sera visible après modération.', 'avis' => $this->p->avis($avis)], 201);
    }
}
