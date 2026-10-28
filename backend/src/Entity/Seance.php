<?php

namespace App\Entity;

use App\Enum\Niveau;
use App\Enum\StatutReservation;
use App\Enum\StatutSeance;
use App\Repository\SeanceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SeanceRepository::class)]
#[ORM\Table(name: 'seances')]
#[ORM\Index(name: 'idx_seance_date', columns: ['date_debut'])]
class Seance
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_seance')]
    private ?int $id = null;

    #[ORM\Column(length: 120)]
    #[Assert\NotBlank(message: 'Le titre est obligatoire.')]
    #[Assert\Length(min: 3, max: 120, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $titre = '';

    #[ORM\Column(name: 'date_debut', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $dateDebut;

    #[ORM\Column(name: 'date_fin', type: Types::DATETIME_IMMUTABLE)]
    #[Assert\GreaterThan(propertyPath: 'dateDebut', message: 'La fin doit être après le début.')]
    private \DateTimeImmutable $dateFin;

    #[ORM\Column(name: 'capacite_max')]
    #[Assert\Range(min: 1, max: 500, notInRangeMessage: 'La capacité doit être comprise entre {{ min }} et {{ max }}.')]
    private int $capaciteMax = 10;

    #[ORM\Column(type: Types::DECIMAL, precision: 6, scale: 2)]
    #[Assert\PositiveOrZero(message: 'La valeur doit être positive.')]
    private string $prix = '0.00';

    #[ORM\Column(length: 20, enumType: Niveau::class)]
    private Niveau $niveau = Niveau::TOUS;

    #[ORM\Column(length: 20, enumType: StatutSeance::class)]
    private StatutSeance $statut = StatutSeance::PLANIFIEE;

    #[ORM\ManyToOne(inversedBy: 'seances')]
    #[ORM\JoinColumn(name: 'id_coach', referencedColumnName: 'id_coach', nullable: false)]
    private ?Coach $coach = null;

    #[ORM\ManyToOne(inversedBy: 'seances')]
    #[ORM\JoinColumn(name: 'id_salle', referencedColumnName: 'id_salle', nullable: false)]
    private ?Salle $salle = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'id_activite', referencedColumnName: 'id_activite', nullable: false)]
    private ?Activite $activite = null;

    /** @var Collection<int, Reservation> */
    #[ORM\OneToMany(mappedBy: 'seance', targetEntity: Reservation::class)]
    private Collection $reservations;

    public function __construct()
    {
        $this->reservations = new ArrayCollection();
        $this->dateDebut = new \DateTimeImmutable('+1 day');
        $this->dateFin = $this->dateDebut->modify('+1 hour');
    }

    public function getId(): ?int { return $this->id; }
    public function getTitre(): string { return $this->titre; }
    public function setTitre(string $t): static { $this->titre = trim($t); return $this; }
    public function getDateDebut(): \DateTimeImmutable { return $this->dateDebut; }
    public function setDateDebut(\DateTimeImmutable $d): static { $this->dateDebut = $d; return $this; }
    public function getDateFin(): \DateTimeImmutable { return $this->dateFin; }
    public function setDateFin(\DateTimeImmutable $d): static { $this->dateFin = $d; return $this; }
    public function getCapaciteMax(): int { return $this->capaciteMax; }
    public function setCapaciteMax(int $c): static { $this->capaciteMax = $c; return $this; }
    public function getPrix(): float { return (float) $this->prix; }
    public function setPrix(float $p): static { $this->prix = number_format($p, 2, '.', ''); return $this; }
    public function getNiveau(): Niveau { return $this->niveau; }
    public function setNiveau(Niveau $n): static { $this->niveau = $n; return $this; }
    public function getStatut(): StatutSeance { return $this->statut; }
    public function setStatut(StatutSeance $s): static { $this->statut = $s; return $this; }
    public function getCoach(): ?Coach { return $this->coach; }
    public function setCoach(Coach $c): static { $this->coach = $c; return $this; }
    public function getSalle(): ?Salle { return $this->salle; }
    public function setSalle(Salle $s): static { $this->salle = $s; return $this; }
    public function getActivite(): ?Activite { return $this->activite; }
    public function setActivite(Activite $a): static { $this->activite = $a; return $this; }
    /** @return Collection<int, Reservation> */
    public function getReservations(): Collection { return $this->reservations; }

    public function nombreInscrits(): int
    {
        return $this->reservations->filter(fn (Reservation $r) => $r->getStatut() === StatutReservation::CONFIRMEE)->count();
    }

    /** Contrôle de capacité : places restantes (jamais négatif). */
    public function placesRestantes(): int
    {
        return max(0, $this->capaciteMax - $this->nombreInscrits());
    }

    public function estComplete(): bool
    {
        return $this->placesRestantes() === 0;
    }

    public function estReservable(?\DateTimeImmutable $maintenant = null): bool
    {
        $maintenant ??= new \DateTimeImmutable();

        return $this->statut === StatutSeance::PLANIFIEE && $this->dateDebut > $maintenant && !$this->estComplete();
    }

    public function annuler(): void
    {
        $this->statut = StatutSeance::ANNULEE;
        foreach ($this->reservations as $r) {
            $r->annuler();
        }
    }
}
