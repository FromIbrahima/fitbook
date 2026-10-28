<?php

namespace App\Service;

use App\Entity\Coach;
use App\Entity\Seance;
use App\Enum\Niveau;
use App\Repository\ActiviteRepository;
use App\Repository\CoachRepository;
use App\Repository\SalleRepository;

/**
 * Formulaire de séance (coach et gestionnaire) :
 *  1. structure validée par JSON Schema (config/json_schema/seance.schema.json)
 *  2. règles métier : séance future, salle ouverte, pas de chevauchement pour le coach
 *  3. contraintes de l'entité (Symfony Validator)
 */
class SeanceFormHandler
{
    public function __construct(
        private readonly JsonSchemaValidator $schema,
        private readonly RequestHelper $helper,
        private readonly ActiviteRepository $activites,
        private readonly SalleRepository $salles,
        private readonly CoachRepository $coachs,
    ) {
    }

    /** @param array<string, mixed> $data */
    public function appliquer(array $data, Seance $seance, ?Coach $coachImpose = null): Seance
    {
        $this->schema->valider($data, 'seance');

        $activite = $this->activites->find($data['activiteId']) ?? throw new ApiException('Le formulaire contient des erreurs.', 422, ['activiteId' => 'Activité inconnue.']);
        $salle = $this->salles->find($data['salleId']) ?? throw new ApiException('Le formulaire contient des erreurs.', 422, ['salleId' => 'Salle inconnue.']);
        $coach = $coachImpose ?? (isset($data['coachId']) ? $this->coachs->find($data['coachId']) : null);
        if ($coach === null) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, ['coachId' => 'Coach obligatoire.']);
        }
        $debut = RequestHelper::date($data['dateDebut'], 'dateDebut');
        $fin = RequestHelper::date($data['dateFin'], 'dateFin');

        $erreurs = [];
        if ($debut <= new \DateTimeImmutable()) {
            $erreurs['dateDebut'] = 'La séance doit être programmée dans le futur.';
        }
        if ($salle->getHoraires()->count() > 0 && (!$salle->estOuverte($debut) || !$salle->estOuverte($fin->modify('-1 minute')))) {
            $erreurs['dateDebut'] ??= 'La salle est fermée sur ce créneau (voir ses horaires d\'ouverture).';
        }
        foreach ($coach->getSeances() as $autre) {
            if ($autre !== $seance && $autre->getStatut()->value === 'PLANIFIEE' && $debut < $autre->getDateFin() && $autre->getDateDebut() < $fin) {
                $erreurs['dateDebut'] ??= 'Le coach a déjà une séance sur ce créneau ('.$autre->getTitre().').';
            }
        }
        if ($seance->getId() !== null && (int) $data['capaciteMax'] < $seance->nombreInscrits()) {
            $erreurs['capaciteMax'] = 'La capacité ne peut pas être inférieure au nombre d\'inscrits ('.$seance->nombreInscrits().').';
        }
        if ($erreurs) {
            throw new ApiException('Le formulaire contient des erreurs.', 422, $erreurs);
        }

        $seance->setTitre($data['titre'])
            ->setActivite($activite)->setSalle($salle)->setCoach($coach)
            ->setDateDebut($debut)->setDateFin($fin)
            ->setCapaciteMax((int) $data['capaciteMax'])->setPrix((float) $data['prix'])
            ->setNiveau(Niveau::from($data['niveau']));
        $this->helper->valider($seance);

        return $seance;
    }
}
