<?php

namespace App\Entity;

use App\Enum\Role;
use App\Repository\UtilisateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
#[ORM\Table(name: 'utilisateurs')]
#[UniqueEntity(fields: ['email'], message: 'Cette adresse email est déjà utilisée.')]
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_utilisateur')]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank(message: "L'email est obligatoire.")]
    #[Assert\Email(message: 'Adresse email invalide.')]
    #[Assert\Length(max: 180, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $email = '';

    #[ORM\Column(name: 'mot_de_passe', length: 255)]
    private string $motDePasse = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(min: 2, max: 100, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $nom = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
    #[Assert\Length(min: 2, max: 100, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $prenom = '';

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Regex(pattern: '/^[0-9 +().-]{6,20}$/', message: 'Numéro de téléphone invalide.')]
    private ?string $telephone = null;

    #[ORM\Column(length: 20, enumType: Role::class)]
    private Role $role = Role::SPORTIF;

    #[ORM\Column(name: 'est_verifie')]
    private bool $estVerifie = false;

    #[ORM\Column(name: 'token_confirmation', length: 64, nullable: true)]
    private ?string $tokenConfirmation = null;

    #[ORM\Column(name: 'date_inscription', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $dateInscription;

    #[ORM\OneToOne(mappedBy: 'utilisateur', cascade: ['persist', 'remove'])]
    private ?Coach $coach = null;

    /** @var Collection<int, Salle> */
    #[ORM\OneToMany(mappedBy: 'gestionnaire', targetEntity: Salle::class)]
    private Collection $salles;

    /** @var Collection<int, Reservation> */
    #[ORM\OneToMany(mappedBy: 'utilisateur', targetEntity: Reservation::class, cascade: ['remove'])]
    private Collection $reservations;

    /** @var Collection<int, Favori> */
    #[ORM\OneToMany(mappedBy: 'utilisateur', targetEntity: Favori::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $favoris;

    public function __construct()
    {
        $this->dateInscription = new \DateTimeImmutable();
        $this->salles = new ArrayCollection();
        $this->reservations = new ArrayCollection();
        $this->favoris = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): static { $this->email = mb_strtolower(trim($email)); return $this; }

    public function getUserIdentifier(): string { return $this->email; }

    /** Rôles Symfony : ROLE_SPORTIF, ROLE_COACH, ROLE_GESTIONNAIRE ou ROLE_ADMIN */
    public function getRoles(): array
    {
        return ['ROLE_'.$this->role->value, 'ROLE_USER'];
    }

    public function getPassword(): string { return $this->motDePasse; }
    public function setPassword(string $hash): static { $this->motDePasse = $hash; return $this; }

    public function eraseCredentials(): void {}

    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = trim($nom); return $this; }

    public function getPrenom(): string { return $this->prenom; }
    public function setPrenom(string $prenom): static { $this->prenom = trim($prenom); return $this; }

    public function getTelephone(): ?string { return $this->telephone; }
    public function setTelephone(?string $telephone): static { $this->telephone = $telephone ?: null; return $this; }

    public function getRole(): Role { return $this->role; }
    public function setRole(Role $role): static { $this->role = $role; return $this; }

    public function isEstVerifie(): bool { return $this->estVerifie; }
    public function setEstVerifie(bool $v): static { $this->estVerifie = $v; return $this; }

    public function getTokenConfirmation(): ?string { return $this->tokenConfirmation; }
    public function setTokenConfirmation(?string $t): static { $this->tokenConfirmation = $t; return $this; }

    /** Confirme l'email si le jeton correspond (comparaison à temps constant). */
    public function confirmerEmail(string $token): bool
    {
        if ($this->tokenConfirmation === null || !hash_equals($this->tokenConfirmation, $token)) {
            return false;
        }
        $this->estVerifie = true;
        $this->tokenConfirmation = null;

        return true;
    }

    public function getDateInscription(): \DateTimeImmutable { return $this->dateInscription; }

    public function getCoach(): ?Coach { return $this->coach; }
    public function setCoach(?Coach $coach): static
    {
        $this->coach = $coach;
        if ($coach !== null && $coach->getUtilisateur() !== $this) {
            $coach->setUtilisateur($this);
        }

        return $this;
    }

    /** @return Collection<int, Salle> */
    public function getSalles(): Collection { return $this->salles; }

    /** @return Collection<int, Reservation> */
    public function getReservations(): Collection { return $this->reservations; }

    /** @return Collection<int, Favori> */
    public function getFavoris(): Collection { return $this->favoris; }

    public function aEnFavori(Salle $salle): bool
    {
        foreach ($this->favoris as $f) {
            if ($f->getSalle() === $salle) {
                return true;
            }
        }

        return false;
    }

    public function ajouterFavori(Salle $salle): void
    {
        if (!$this->aEnFavori($salle)) {
            $this->favoris->add(new Favori($this, $salle));
        }
    }

    public function retirerFavori(Salle $salle): void
    {
        foreach ($this->favoris as $f) {
            if ($f->getSalle() === $salle) {
                $this->favoris->removeElement($f);
            }
        }
    }

    public function getNomComplet(): string { return $this->prenom.' '.$this->nom; }
}
