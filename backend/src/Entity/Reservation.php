<?php

namespace App\Entity;

use App\Enum\StatutReservation;
use App\Repository\ReservationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
#[ORM\Table(name: 'reservations')]
#[ORM\UniqueConstraint(name: 'uq_reservation_utilisateur_seance', columns: ['id_utilisateur', 'id_seance'])]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_reservation')]
    private ?int $id = null;

    #[ORM\Column(name: 'date_reservation', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $dateReservation;

    #[ORM\Column(length: 20, enumType: StatutReservation::class)]
    private StatutReservation $statut = StatutReservation::CONFIRMEE;

    /** Code unique affiché en QR code pour l'entrée à la séance */
    #[ORM\Column(name: 'code_confirmation', length: 32, unique: true)]
    private string $codeConfirmation;

    #[ORM\ManyToOne(inversedBy: 'reservations')]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false, onDelete: 'CASCADE')]
    private ?Utilisateur $utilisateur = null;

    #[ORM\ManyToOne(inversedBy: 'reservations')]
    #[ORM\JoinColumn(name: 'id_seance', referencedColumnName: 'id_seance', nullable: false, onDelete: 'CASCADE')]
    private ?Seance $seance = null;

    public function __construct()
    {
        $this->dateReservation = new \DateTimeImmutable();
        $this->codeConfirmation = strtoupper(bin2hex(random_bytes(6)));
    }

    public function getId(): ?int { return $this->id; }
    public function getDateReservation(): \DateTimeImmutable { return $this->dateReservation; }
    public function getStatut(): StatutReservation { return $this->statut; }
    public function getCodeConfirmation(): string { return $this->codeConfirmation; }
    public function getUtilisateur(): ?Utilisateur { return $this->utilisateur; }
    public function setUtilisateur(Utilisateur $u): static { $this->utilisateur = $u; return $this; }
    public function getSeance(): ?Seance { return $this->seance; }
    public function setSeance(Seance $s): static { $this->seance = $s; return $this; }

    public function confirmer(): void { $this->statut = StatutReservation::CONFIRMEE; }
    public function annuler(): void { $this->statut = StatutReservation::ANNULEE; }
}
