<?php

namespace App\Entity;

use App\Repository\DisponibiliteRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Créneau hebdomadaire : disponibilité d'un coach OU horaire d'ouverture d'une salle.
 * jour_semaine : 1 = lundi ... 7 = dimanche (norme ISO-8601).
 */
#[ORM\Entity(repositoryClass: DisponibiliteRepository::class)]
#[ORM\Table(name: 'disponibilites')]
class Disponibilite
{
    public const JOURS = [1 => 'Lundi', 2 => 'Mardi', 3 => 'Mercredi', 4 => 'Jeudi', 5 => 'Vendredi', 6 => 'Samedi', 7 => 'Dimanche'];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_disponibilite')]
    private ?int $id = null;

    #[ORM\Column(name: 'jour_semaine', type: Types::SMALLINT)]
    #[Assert\Range(min: 1, max: 7, notInRangeMessage: 'Le jour doit être compris entre 1 (lundi) et 7 (dimanche).')]
    private int $jourSemaine = 1;

    #[ORM\Column(name: 'heure_debut', type: Types::TIME_IMMUTABLE)]
    private \DateTimeImmutable $heureDebut;

    #[ORM\Column(name: 'heure_fin', type: Types::TIME_IMMUTABLE)]
    #[Assert\GreaterThan(propertyPath: 'heureDebut', message: "L'heure de fin doit être après l'heure de début.")]
    private \DateTimeImmutable $heureFin;

    #[ORM\ManyToOne(inversedBy: 'disponibilites')]
    #[ORM\JoinColumn(name: 'id_coach', referencedColumnName: 'id_coach', nullable: true, onDelete: 'CASCADE')]
    private ?Coach $coach = null;

    #[ORM\ManyToOne(inversedBy: 'horaires')]
    #[ORM\JoinColumn(name: 'id_salle', referencedColumnName: 'id_salle', nullable: true, onDelete: 'CASCADE')]
    private ?Salle $salle = null;

    public function __construct(int $jour = 1, string $debut = '09:00', string $fin = '17:00')
    {
        $this->jourSemaine = $jour;
        $this->heureDebut = new \DateTimeImmutable('1970-01-01 '.$debut);
        $this->heureFin = new \DateTimeImmutable('1970-01-01 '.$fin);
    }

    public function getId(): ?int { return $this->id; }
    public function getJourSemaine(): int { return $this->jourSemaine; }
    public function setJourSemaine(int $j): static { $this->jourSemaine = $j; return $this; }
    public function getHeureDebut(): \DateTimeImmutable { return $this->heureDebut; }
    public function setHeureDebut(\DateTimeImmutable $h): static { $this->heureDebut = $h; return $this; }
    public function getHeureFin(): \DateTimeImmutable { return $this->heureFin; }
    public function setHeureFin(\DateTimeImmutable $h): static { $this->heureFin = $h; return $this; }
    public function getCoach(): ?Coach { return $this->coach; }
    public function setCoach(?Coach $c): static { $this->coach = $c; return $this; }
    public function getSalle(): ?Salle { return $this->salle; }
    public function setSalle(?Salle $s): static { $this->salle = $s; return $this; }

    /** Deux créneaux du même jour se chevauchent-ils ? */
    public function chevauche(self $autre): bool
    {
        return $this->jourSemaine === $autre->jourSemaine
            && $this->heureDebut < $autre->heureFin
            && $autre->heureDebut < $this->heureFin;
    }
}
