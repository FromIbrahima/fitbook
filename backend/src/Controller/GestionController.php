<?php

namespace App\Controller;

use App\Entity\Disponibilite;
use App\Entity\Salle;
use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Repository\AvisRepository;
use App\Repository\CoachRepository;
use App\Repository\ReservationRepository;
use App\Security\Voter\SalleVoter;
use App\Security\Voter\SeanceVoter;
use App\Service\ApiException;
use App\Service\Notifier;
use App\Service\Presenter;
use App\Service\RequestHelper;
use App\Service\ReservationService;
use App\Service\SeanceFormHandler;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/** Espace salle / gestionnaire (ROLE_GESTIONNAIRE) : infos, horaires, cours, capacités, calendrier, réservations, avis, stats. */
#[Route('/api/gestion')]
class GestionController extends AbstractController
{
    public function __construct(
        private readonly Presenter $p,
        private readonly RequestHelper $helper,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('/salles', methods: ['GET'])]
    public function mesSalles(#[CurrentUser] Utilisateur $u): JsonResponse
    {
        return $this->json($this->p->liste($u->getSalles(), 'salle', true));
    }

    #[Route('/salles', methods: ['POST'])]
    public function creerSalle(#[CurrentUser] Utilisateur $u, Request $request): JsonResponse
    {
        $salle = $this->remplir(new Salle(), $this->helper->json($request))->setGestionnaire($u);
        $this->helper->valider($salle);
        $this->em->persist($salle);
        $this->em->flush();

        return $this->json($this->p->salle($salle, true), 201);
    }

    #[Route('/salles/{id<\d+>}', methods: ['PUT'])]
    #[IsGranted(SalleVoter::GERER, subject: 'salle', message: 'Cette salle ne vous appartient pas.')]
    public function modifierSalle(Salle $salle, Request $request): JsonResponse
    {
        $this->remplir($salle, $this->helper->json($request));
        $this->helper->valider($salle);
        $this->em->flush();

        return $this->json($this->p->salle($salle, true));
    }

    /** Remplace tous les horaires d'ouverture : [{jourSemaine, heureDebut, heureFin}, ...] */
    #[Route('/salles/{id<\d+>}/horaires', methods: ['PUT'])]
    #[IsGranted(SalleVoter::GERER, subject: 'salle', message: 'Cette salle ne vous appartient pas.')]
    public function horaires(Salle $salle, Request $request): JsonResponse
    {
        $liste = $this->helper->json($request)['horaires'] ?? [];
        $nouveaux = [];
        foreach ($liste as $i => $h) {
            $d = (new Disponibilite())->setJourSemaine((int) ($h['jourSemaine'] ?? 0))
                ->setHeureDebut(RequestHelper::heure($h['heureDebut'] ?? null, "horaires[$i].heureDebut"))
                ->setHeureFin(RequestHelper::heure($h['heureFin'] ?? null, "horaires[$i].heureFin"));
            $this->helper->valider($d);
            foreach ($nouveaux as $autre) {
                if ($d->chevauche($autre)) {
                    throw new ApiException('Le formulaire contient des erreurs.', 422, ["horaires[$i]" => 'Deux créneaux se chevauchent.']);
                }
            }
            $nouveaux[] = $d;
        }
        foreach ($salle->getHoraires()->toArray() as $ancien) {
            $salle->getHoraires()->removeElement($ancien);
        }
        $this->em->flush();
        foreach ($nouveaux as $d) {
            $salle->ajouterHoraire($d);
        }
        $this->em->flush();

        return $this->json($this->p->liste($salle->getHoraires(), 'disponibilite'));
    }

    #[Route('/salles/{id<\d+>}/seances', methods: ['GET'])]
    #[IsGranted(SalleVoter::GERER, subject: 'salle')]
    public function seances(Salle $salle): JsonResponse
    {
        return $this->json($this->p->liste($salle->getSeances(), 'seance'));
    }

    #[Route('/seances', methods: ['POST'])]
    public function creerSeance(#[CurrentUser] Utilisateur $u, Request $request, SeanceFormHandler $form): JsonResponse
    {
        $data = $this->helper->json($request);
        $seance = $form->appliquer($data, new Seance());
        $this->denyAccessUnlessGranted(SeanceVoter::GERER, $seance, 'Vous ne pouvez programmer des cours que dans vos salles.');
        $this->em->persist($seance);
        $this->em->flush();

        return $this->json(['message' => 'Cours créé.', 'seance' => $this->p->seance($seance)], 201);
    }

    #[Route('/seances/{id<\d+>}', methods: ['PUT'])]
    #[IsGranted(SeanceVoter::GERER, subject: 'seance', message: 'Ce cours n\'est pas dans votre salle.')]
    public function modifierSeance(Seance $seance, Request $request, SeanceFormHandler $form): JsonResponse
    {
        $form->appliquer($this->helper->json($request), $seance);
        $this->denyAccessUnlessGranted(SeanceVoter::GERER, $seance, 'Vous ne pouvez pas déplacer un cours vers une autre salle.');
        $this->em->flush();

        return $this->json(['message' => 'Cours modifié.', 'seance' => $this->p->seance($seance)]);
    }

    #[Route('/seances/{id<\d+>}', methods: ['DELETE'])]
    #[IsGranted(SeanceVoter::GERER, subject: 'seance', message: 'Ce cours n\'est pas dans votre salle.')]
    public function supprimerSeance(Seance $seance, Notifier $notifier): JsonResponse
    {
        if ($seance->getReservations()->count() === 0) {
            $this->em->remove($seance);
            $this->em->flush();

            return $this->json(['message' => 'Cours supprimé.']);
        }
        $seance->annuler();
        $this->em->flush();
        $n = $notifier->seanceAnnulee($seance);

        return $this->json(['message' => "Cours annulé, $n participant(s) prévenu(s).", 'seance' => $this->p->seance($seance)]);
    }

    #[Route('/salles/{id<\d+>}/reservations', methods: ['GET'])]
    #[IsGranted(SalleVoter::GERER, subject: 'salle')]
    public function reservations(Salle $salle, ReservationRepository $repo): JsonResponse
    {
        $liste = $repo->createQueryBuilder('r')->join('r.seance', 's')->where('s.salle = :sa')->setParameter('sa', $salle)
            ->orderBy('s.dateDebut', 'ASC')->getQuery()->getResult();

        return $this->json($this->p->liste($liste, 'reservation'));
    }

    #[Route('/salles/{id<\d+>}/avis', methods: ['GET'])]
    #[IsGranted(SalleVoter::GERER, subject: 'salle')]
    public function avis(Salle $salle, AvisRepository $repo): JsonResponse
    {
        return $this->json($this->p->liste($repo->findBy(['salle' => $salle], ['dateAvis' => 'DESC']), 'avis'));
    }

    /** Statistiques calculées par la procédure stockée getAvisSalle et getNombreReservationsSalle */
    #[Route('/salles/{id<\d+>}/stats', methods: ['GET'])]
    #[IsGranted(SalleVoter::GERER, subject: 'salle')]
    public function stats(Salle $salle, ReservationService $service): JsonResponse
    {
        return $this->json($service->statistiquesSalle($salle));
    }

    /** Liste des coachs pour programmer un cours */
    #[Route('/coachs', methods: ['GET'])]
    public function coachs(CoachRepository $repo): JsonResponse
    {
        return $this->json($this->p->liste($repo->rechercher([]), 'coach'));
    }

    private function remplir(Salle $s, array $d): Salle
    {
        return $s->setNom((string) ($d['nom'] ?? $s->getNom()))
            ->setAdresse((string) ($d['adresse'] ?? $s->getAdresse()))
            ->setCodePostal((string) ($d['codePostal'] ?? $s->getCodePostal()))
            ->setVille((string) ($d['ville'] ?? $s->getVille()))
            ->setTelephone(array_key_exists('telephone', $d) ? $d['telephone'] : $s->getTelephone())
            ->setDescription(array_key_exists('description', $d) ? $d['description'] : $s->getDescription())
            ->setEquipements(isset($d['equipements']) ? (array) $d['equipements'] : $s->getEquipements())
            ->setLatitude(array_key_exists('latitude', $d) && $d['latitude'] !== null && $d['latitude'] !== '' ? (float) $d['latitude'] : $s->getLatitude())
            ->setLongitude(array_key_exists('longitude', $d) && $d['longitude'] !== null && $d['longitude'] !== '' ? (float) $d['longitude'] : $s->getLongitude());
    }
}
