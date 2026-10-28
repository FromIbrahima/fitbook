<?php

namespace App\Service;

use App\Entity\Avis;
use App\Entity\Coach;
use App\Entity\Disponibilite;
use App\Entity\Reservation;
use App\Entity\Salle;
use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Enum\StatutModeration;

/** Transforme les entités en tableaux JSON pour le frontend. */
class Presenter
{
    public function utilisateur(Utilisateur $u): array
    {
        return [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'nom' => $u->getNom(),
            'prenom' => $u->getPrenom(),
            'telephone' => $u->getTelephone(),
            'role' => $u->getRole()->value,
            'estVerifie' => $u->isEstVerifie(),
            'dateInscription' => $u->getDateInscription()->format(DATE_ATOM),
            'coachId' => $u->getCoach()?->getId(),
        ];
    }

    public function salle(Salle $s, bool $complet = false, ?Utilisateur $viewer = null): array
    {
        $avisValides = $s->getAvis()->filter(fn (Avis $a) => $a->getStatutModeration() === StatutModeration::VALIDE);
        $data = [
            'id' => $s->getId(),
            'nom' => $s->getNom(),
            'adresse' => $s->getAdresse(),
            'codePostal' => $s->getCodePostal(),
            'ville' => $s->getVille(),
            'telephone' => $s->getTelephone(),
            'description' => $s->getDescription(),
            'equipements' => $s->getEquipements(),
            'latitude' => $s->getLatitude(),
            'longitude' => $s->getLongitude(),
            'noteMoyenne' => $s->noteMoyenne(),
            'nbAvis' => $avisValides->count(),
            'activites' => array_values(array_unique(array_map(fn (Seance $x) => $x->getActivite()->getNom(), $s->getSeances()->toArray()))),
            'estFavori' => $viewer?->aEnFavori($s) ?? false,
        ];
        if ($complet) {
            $data['horaires'] = array_map([$this, 'disponibilite'], $s->getHoraires()->toArray());
            $data['avis'] = array_values(array_map([$this, 'avis'], $avisValides->toArray()));
            $coachs = [];
            foreach ($s->getSeances() as $se) {
                $coachs[$se->getCoach()->getId()] = $this->coach($se->getCoach());
            }
            $data['coachs'] = array_values($coachs);
            $data['gestionnaire'] = $s->getGestionnaire()?->getNomComplet();
        }

        return $data;
    }

    public function coach(Coach $c, bool $complet = false): array
    {
        $avisValides = $c->getAvis()->filter(fn (Avis $a) => $a->getStatutModeration() === StatutModeration::VALIDE);
        $data = [
            'id' => $c->getId(),
            'nom' => $c->getNom(),
            'prenom' => $c->getUtilisateur()?->getPrenom(),
            'nomFamille' => $c->getUtilisateur()?->getNom(),
            'specialite' => $c->getSpecialite(),
            'biographie' => $c->getBiographie(),
            'tarifHoraire' => $c->getTarifHoraire(),
            'ville' => $c->getVille(),
            'noteMoyenne' => $c->noteMoyenne(),
            'nbAvis' => $avisValides->count(),
        ];
        if ($complet) {
            $data['disponibilites'] = array_map([$this, 'disponibilite'], $c->getDisponibilites()->toArray());
            $data['avis'] = array_values(array_map([$this, 'avis'], $avisValides->toArray()));
        }

        return $data;
    }

    public function seance(Seance $s): array
    {
        return [
            'id' => $s->getId(),
            'titre' => $s->getTitre(),
            'dateDebut' => $s->getDateDebut()->format('Y-m-d\TH:i:s'),
            'dateFin' => $s->getDateFin()->format('Y-m-d\TH:i:s'),
            'capaciteMax' => $s->getCapaciteMax(),
            'inscrits' => $s->nombreInscrits(),
            'placesRestantes' => $s->placesRestantes(),
            'prix' => $s->getPrix(),
            'niveau' => $s->getNiveau()->value,
            'statut' => $s->getStatut()->value,
            'activite' => ['id' => $s->getActivite()->getId(), 'nom' => $s->getActivite()->getNom(), 'categorie' => $s->getActivite()->getCategorie()],
            'salle' => ['id' => $s->getSalle()->getId(), 'nom' => $s->getSalle()->getNom(), 'ville' => $s->getSalle()->getVille()],
            'coach' => ['id' => $s->getCoach()->getId(), 'nom' => $s->getCoach()->getNom()],
        ];
    }

    public function reservation(Reservation $r): array
    {
        return [
            'id' => $r->getId(),
            'dateReservation' => $r->getDateReservation()->format(DATE_ATOM),
            'statut' => $r->getStatut()->value,
            'codeConfirmation' => $r->getCodeConfirmation(),
            'seance' => $this->seance($r->getSeance()),
            'sportif' => ['id' => $r->getUtilisateur()->getId(), 'nom' => $r->getUtilisateur()->getNomComplet(), 'email' => $r->getUtilisateur()->getEmail()],
        ];
    }

    public function avis(Avis $a): array
    {
        return [
            'id' => $a->getId(),
            'note' => $a->getNote(),
            'commentaire' => $a->getCommentaire(),
            'dateAvis' => $a->getDateAvis()->format(DATE_ATOM),
            'statutModeration' => $a->getStatutModeration()->value,
            'auteur' => $a->getAuteur()?->getPrenom().' '.mb_substr((string) $a->getAuteur()?->getNom(), 0, 1).'.',
            'salle' => $a->getSalle() ? ['id' => $a->getSalle()->getId(), 'nom' => $a->getSalle()->getNom()] : null,
            'coach' => $a->getCoach() ? ['id' => $a->getCoach()->getId(), 'nom' => $a->getCoach()->getNom()] : null,
        ];
    }

    public function disponibilite(Disponibilite $d): array
    {
        return [
            'id' => $d->getId(),
            'jourSemaine' => $d->getJourSemaine(),
            'jour' => Disponibilite::JOURS[$d->getJourSemaine()] ?? '?',
            'heureDebut' => $d->getHeureDebut()->format('H:i'),
            'heureFin' => $d->getHeureFin()->format('H:i'),
        ];
    }

    /** @param iterable<object> $liste */
    public function liste(iterable $liste, string $methode, mixed ...$args): array
    {
        $out = [];
        foreach ($liste as $e) {
            $out[] = $this->$methode($e, ...$args);
        }

        return $out;
    }
}
