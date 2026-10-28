<?php

namespace App\Entity;

use App\Enum\StatutModeration;
use App\Repository\CoachRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CoachRepository::class)]
#[ORM\Table(name: 'coachs')]
class Coach
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_coach')]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'La spécialité est obligatoire.')]
    #[Assert\Length(max: 100, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $specialite = '';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 2000, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private ?string $biographie = null;

    #[ORM\Column(name: 'tarif_horaire', type: Types::DECIMAL, precision: 6, scale: 2)]
    #[Assert\PositiveOrZero(message: 'Le tarif doit être positif.')]
    private string $tarifHoraire = '0.00';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'La ville est obligatoire.')]
    private string $ville = '';

    #[ORM\OneToOne(inversedBy: 'coach')]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false, unique: true, onDelete: 'CASCADE')]
    private ?Utilisateur $utilisateur = null;

    /** @var Collection<int, Seance> */
    #[ORM\OneToMany(mappedBy: 'coach', targetEntity: Seance::class)]
    #[ORM\OrderBy(['dateDebut' => 'ASC'])]
    private Collection $seances;

    /** @var Collection<int, Avis> */
    #[ORM\OneToMany(mappedBy: 'coach', targetEntity: Avis::class)]
    private Collection $avis;

    /** @var Collection<int, Disponibilite> */
    #[ORM\OneToMany(mappedBy: 'coach', targetEntity: Disponibilite::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['jourSemaine' => 'ASC', 'heureDebut' => 'ASC'])]
    private Collection $disponibilites;

    public function __construct()
    {
        $this->seances = new ArrayCollection();
        $this->avis = new ArrayCollection();
        $this->disponibilites = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getSpecialite(): string { return $this->specialite; }
    public function setSpecialite(string $s): static { $this->specialite = trim($s); return $this; }
    public function getBiographie(): ?string { return $this->biographie; }
    public function setBiographie(?string $b): static { $this->biographie = $b; return $this; }
    public function getTarifHoraire(): float { return (float) $this->tarifHoraire; }
    public function setTarifHoraire(float $t): static { $this->tarifHoraire = number_format($t, 2, '.', ''); return $this; }
    public function getVille(): string { return $this->ville; }
    public function setVille(string $v): static { $this->ville = trim($v); return $this; }
    public function getUtilisateur(): ?Utilisateur { return $this->utilisateur; }
    public function setUtilisateur(Utilisateur $u): static { $this->utilisateur = $u; return $this; }
    /** @return Collection<int, Seance> */
    public function getSeances(): Collection { return $this->seances; }
    /** @return Collection<int, Avis> */
    public function getAvis(): Collection { return $this->avis; }
    /** @return Collection<int, Disponibilite> */
    public function getDisponibilites(): Collection { return $this->disponibilites; }

    public function ajouterDisponibilite(Disponibilite $d): static
    {
        if (!$this->disponibilites->contains($d)) {
            $this->disponibilites->add($d);
            $d->setCoach($this);
        }

        return $this;
    }

    /** Moyenne des avis validés par la modération (null si aucun avis). */
    public function noteMoyenne(): ?float
    {
        $notes = [];
        foreach ($this->avis as $a) {
            if ($a->getStatutModeration() === StatutModeration::VALIDE) {
                $notes[] = $a->getNote();
            }
        }

        return $notes ? round(array_sum($notes) / count($notes), 1) : null;
    }

    public function getNom(): string { return $this->utilisateur?->getNomComplet() ?? ''; }
}
