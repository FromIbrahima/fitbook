<?php

namespace App\Entity;

use App\Enum\StatutModeration;
use App\Repository\SalleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SalleRepository::class)]
#[ORM\Table(name: 'salles')]
class Salle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_salle')]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom de la salle est obligatoire.')]
    #[Assert\Length(min: 2, max: 100, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $nom = '';

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    private string $adresse = '';

    #[ORM\Column(name: 'code_postal', length: 10)]
    #[Assert\Regex(pattern: '/^\d{4,5}$/', message: 'Code postal invalide (4 ou 5 chiffres).')]
    private string $codePostal = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'La ville est obligatoire.')]
    private string $ville = '';

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Regex(pattern: '/^[0-9 +().-]{6,20}$/', message: 'Numéro de téléphone invalide.')]
    private ?string $telephone = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 3000, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private ?string $description = null;

    /** Liste séparée par des virgules : "Vestiaires,Douches,Wi-Fi" */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $equipements = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Assert\Range(min: -90, max: 90, notInRangeMessage: 'Valeur attendue entre {{ min }} et {{ max }}.')]
    private ?string $latitude = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Assert\Range(min: -180, max: 180, notInRangeMessage: 'Valeur attendue entre {{ min }} et {{ max }}.')]
    private ?string $longitude = null;

    #[ORM\ManyToOne(inversedBy: 'salles')]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false)]
    private ?Utilisateur $gestionnaire = null;

    /** @var Collection<int, Seance> */
    #[ORM\OneToMany(mappedBy: 'salle', targetEntity: Seance::class)]
    #[ORM\OrderBy(['dateDebut' => 'ASC'])]
    private Collection $seances;

    /** @var Collection<int, Avis> */
    #[ORM\OneToMany(mappedBy: 'salle', targetEntity: Avis::class)]
    private Collection $avis;

    /** Horaires d'ouverture @var Collection<int, Disponibilite> */
    #[ORM\OneToMany(mappedBy: 'salle', targetEntity: Disponibilite::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['jourSemaine' => 'ASC', 'heureDebut' => 'ASC'])]
    private Collection $horaires;

    public function __construct()
    {
        $this->seances = new ArrayCollection();
        $this->avis = new ArrayCollection();
        $this->horaires = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function setNom(string $n): static { $this->nom = trim($n); return $this; }
    public function getAdresse(): string { return $this->adresse; }
    public function setAdresse(string $a): static { $this->adresse = trim($a); return $this; }
    public function getCodePostal(): string { return $this->codePostal; }
    public function setCodePostal(string $c): static { $this->codePostal = trim($c); return $this; }
    public function getVille(): string { return $this->ville; }
    public function setVille(string $v): static { $this->ville = trim($v); return $this; }
    public function getTelephone(): ?string { return $this->telephone; }
    public function setTelephone(?string $t): static { $this->telephone = $t ?: null; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): static { $this->description = $d; return $this; }

    /** @return string[] */
    public function getEquipements(): array
    {
        return $this->equipements ? array_values(array_filter(array_map('trim', explode(',', $this->equipements)))) : [];
    }

    /** @param string[] $e */
    public function setEquipements(array $e): static
    {
        $this->equipements = $e ? implode(',', array_map('trim', $e)) : null;

        return $this;
    }

    public function getLatitude(): ?float { return $this->latitude !== null ? (float) $this->latitude : null; }
    public function setLatitude(?float $l): static { $this->latitude = $l !== null ? (string) $l : null; return $this; }
    public function getLongitude(): ?float { return $this->longitude !== null ? (float) $this->longitude : null; }
    public function setLongitude(?float $l): static { $this->longitude = $l !== null ? (string) $l : null; return $this; }
    public function getGestionnaire(): ?Utilisateur { return $this->gestionnaire; }
    public function setGestionnaire(Utilisateur $u): static { $this->gestionnaire = $u; return $this; }
    /** @return Collection<int, Seance> */
    public function getSeances(): Collection { return $this->seances; }
    /** @return Collection<int, Avis> */
    public function getAvis(): Collection { return $this->avis; }
    /** @return Collection<int, Disponibilite> */
    public function getHoraires(): Collection { return $this->horaires; }

    public function ajouterHoraire(Disponibilite $d): static
    {
        if (!$this->horaires->contains($d)) {
            $this->horaires->add($d);
            $d->setSalle($this);
        }

        return $this;
    }

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

    /** La salle est-elle ouverte à cette date / heure ? */
    public function estOuverte(\DateTimeInterface $date): bool
    {
        $jour = (int) $date->format('N');
        $heure = $date->format('H:i:s');
        foreach ($this->horaires as $h) {
            if ($h->getJourSemaine() === $jour && $h->getHeureDebut()->format('H:i:s') <= $heure && $heure < $h->getHeureFin()->format('H:i:s')) {
                return true;
            }
        }

        return false;
    }
}
