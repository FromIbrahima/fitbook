<?php

namespace App\Entity;

use App\Enum\StatutModeration;
use App\Repository\AvisRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ORM\Entity(repositoryClass: AvisRepository::class)]
#[ORM\Table(name: 'avis')]
class Avis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_avis')]
    private ?int $id = null;

    #[ORM\Column]
    #[Assert\Range(min: 1, max: 5, notInRangeMessage: 'La note doit être comprise entre 1 et 5.')]
    private int $note = 5;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(min: 10, max: 1000, minMessage: 'Le commentaire doit contenir au moins {{ limit }} caractères.')]
    private ?string $commentaire = null;

    #[ORM\Column(name: 'date_avis', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $dateAvis;

    #[ORM\Column(name: 'statut_moderation', length: 20, enumType: StatutModeration::class)]
    private StatutModeration $statutModeration = StatutModeration::EN_ATTENTE;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false, onDelete: 'CASCADE')]
    private ?Utilisateur $auteur = null;

    #[ORM\ManyToOne(inversedBy: 'avis')]
    #[ORM\JoinColumn(name: 'id_salle', referencedColumnName: 'id_salle', nullable: true, onDelete: 'CASCADE')]
    private ?Salle $salle = null;

    #[ORM\ManyToOne(inversedBy: 'avis')]
    #[ORM\JoinColumn(name: 'id_coach', referencedColumnName: 'id_coach', nullable: true, onDelete: 'CASCADE')]
    private ?Coach $coach = null;

    public function __construct()
    {
        $this->dateAvis = new \DateTimeImmutable();
    }

    /** Règle de gestion : un avis porte sur une salle OU sur un coach (pas les deux). */
    #[Assert\Callback]
    public function validerCible(ExecutionContextInterface $context): void
    {
        if (($this->salle === null) === ($this->coach === null)) {
            $context->buildViolation('Un avis doit porter sur une salle ou sur un coach.')->atPath('cible')->addViolation();
        }
    }

    public function getId(): ?int { return $this->id; }
    public function getNote(): int { return $this->note; }
    public function setNote(int $n): static { $this->note = $n; return $this; }
    public function getCommentaire(): ?string { return $this->commentaire; }
    public function setCommentaire(?string $c): static { $this->commentaire = $c !== null ? trim($c) : null; return $this; }
    public function getDateAvis(): \DateTimeImmutable { return $this->dateAvis; }
    public function getStatutModeration(): StatutModeration { return $this->statutModeration; }
    public function getAuteur(): ?Utilisateur { return $this->auteur; }
    public function setAuteur(Utilisateur $u): static { $this->auteur = $u; return $this; }
    public function getSalle(): ?Salle { return $this->salle; }
    public function setSalle(?Salle $s): static { $this->salle = $s; return $this; }
    public function getCoach(): ?Coach { return $this->coach; }
    public function setCoach(?Coach $c): static { $this->coach = $c; return $this; }

    public function valider(): void { $this->statutModeration = StatutModeration::VALIDE; }
    public function rejeter(): void { $this->statutModeration = StatutModeration::REJETE; }
}
