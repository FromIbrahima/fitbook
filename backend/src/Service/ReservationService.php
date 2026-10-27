<?php

namespace App\Service;

use App\Entity\Reservation;
use App\Entity\Salle;
use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Enum\StatutReservation;
use App\Enum\StatutSeance;
use App\Repository\ReservationRepository;
use App\Repository\SeanceRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Réservations et statistiques. Les PROCÉDURES STOCKÉES MySQL (cours MySQL partie 9) :
 *  - getNombreInscrits(IN idSeance, OUT nbInscrits)             → contrôle de capacité
 *  - getAvisSalle(IN idSalle)                                   → avis validés d'une salle
 *  - getNombreReservationsSalle(IN idSalle, OUT nbReservations) → statistiques du gestionnaire
 *
 * Comme dans le cours, une procédure avec un paramètre OUT s'appelle en deux étapes :
 *   CALL getNombreInscrits(12, @nbInscrits);
 *   SELECT @nbInscrits;
 * Les règles (déjà réservé, séance commencée, propriétaire...) sont vérifiées ici, côté code.
 */
class ReservationService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ReservationRepository $reservations,
        private readonly SeanceRepository $seances,
        private readonly Notifier $notifier,
    ) {
    }

    public function reserver(Utilisateur $u, Seance $s): Reservation
    {
        $r = $this->em->wrapInTransaction(function () use ($u, $s): Reservation {
            // verrou sur la ligne de la séance : deux réservations en même temps ne dépassent pas la capacité
            $this->em->lock($s, LockMode::PESSIMISTIC_WRITE);
            $this->em->refresh($s);

            if ($s->getStatut() !== StatutSeance::PLANIFIEE || $s->getDateDebut() <= new \DateTimeImmutable()) {
                throw new ApiException('Cette séance n\'est plus réservable (annulée ou déjà commencée).', 409);
            }
            $existante = $this->reservations->findOneBy(['utilisateur' => $u, 'seance' => $s]);
            if ($existante?->getStatut() === StatutReservation::CONFIRMEE) {
                throw new ApiException('Vous avez déjà réservé cette séance.', 409);
            }
            if ($this->nombreInscrits($s) >= $s->getCapaciteMax()) {
                throw new ApiException('Désolé, cette séance est complète.', 409);
            }

            if ($existante) {
                $existante->confirmer(); // le sportif avait annulé : on réactive sa réservation
                $r = $existante;
            } else {
                $r = (new Reservation())->setUtilisateur($u)->setSeance($s);
                $this->em->persist($r);
            }
            $this->em->flush();

            return $r;
        });
        $this->notifier->reservationConfirmee($r);

        return $r;
    }

    /** $u = null : annulation par un administrateur (pas de contrôle de propriétaire). */
    public function annuler(Reservation $r, ?Utilisateur $u): Reservation
    {
        if ($u !== null && $r->getUtilisateur()?->getId() !== $u->getId()) {
            throw new ApiException('Cette réservation ne vous appartient pas.', 403);
        }
        if ($r->getStatut() === StatutReservation::ANNULEE) {
            throw new ApiException('Cette réservation est déjà annulée.', 409);
        }
        if ($r->getSeance()->getDateDebut() <= new \DateTimeImmutable()) {
            throw new ApiException('Impossible d\'annuler : la séance a déjà commencé.', 409);
        }
        $r->annuler();
        $this->em->flush();
        $this->notifier->reservationAnnulee($r);

        return $r;
    }

    /** Procédure stockée avec paramètre OUT : CALL getNombreInscrits(?, @nbInscrits) puis SELECT @nbInscrits */
    public function nombreInscrits(Seance $s): int
    {
        $connexion = $this->em->getConnection();
        $connexion->executeStatement('CALL getNombreInscrits(?, @nbInscrits)', [$s->getId()]);

        return (int) $connexion->fetchOne('SELECT @nbInscrits');
    }

    /** @return array<string, int|float|null> */
    public function statistiquesSalle(Salle $salle): array
    {
        $connexion = $this->em->getConnection();

        // procédure avec paramètre IN : CALL getAvisSalle(?)
        $avis = $connexion->executeQuery('CALL getAvisSalle(?)', [$salle->getId()])->fetchAllAssociative();
        $nbAvis = count($avis);
        $noteMoyenne = $nbAvis ? round(array_sum(array_column($avis, 'note')) / $nbAvis, 1) : null;

        // procédure avec paramètres IN et OUT : CALL ... (?, @nbReservations) puis SELECT @nbReservations
        $connexion->executeStatement('CALL getNombreReservationsSalle(?, @nbReservations)', [$salle->getId()]);
        $nbReservations = (int) $connexion->fetchOne('SELECT @nbReservations');

        // le reste est calculé côté code (comme le recommande le cours)
        $maintenant = new \DateTimeImmutable();
        $debutMois = $maintenant->modify('first day of this month')->setTime(0, 0);
        $seancesAVenir = 0;
        $inscrits = 0;
        $capacite = 0;
        $ceMois = 0;
        foreach ($this->seances->findBy(['salle' => $salle]) as $s) {
            foreach ($s->getReservations() as $r) {
                if ($r->getStatut() === StatutReservation::CONFIRMEE && $r->getDateReservation() >= $debutMois) {
                    ++$ceMois;
                }
            }
            if ($s->getStatut() !== StatutSeance::PLANIFIEE) {
                continue;
            }
            $inscrits += $s->nombreInscrits();
            $capacite += $s->getCapaciteMax();
            if ($s->getDateDebut() > $maintenant) {
                ++$seancesAVenir;
            }
        }

        return [
            'seancesAVenir' => $seancesAVenir,
            'reservationsConfirmees' => $nbReservations,
            'reservationsCeMois' => $ceMois,
            'tauxRemplissage' => $capacite ? round(100 * $inscrits / $capacite, 1) : 0.0,
            'noteMoyenne' => $noteMoyenne,
            'nbAvis' => $nbAvis,
        ];
    }
}
