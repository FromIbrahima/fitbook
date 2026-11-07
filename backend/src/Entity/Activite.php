<?php

namespace App\Entity;

use App\Repository\ActiviteRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ActiviteRepository::class)]
#[ORM\Table(name: 'activites')]
#[UniqueEntity(fields: ['nom'], message: 'Cette activité existe déjà.')]
class Activite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_activite')]
    private ?int $id = null;

    #[ORM\Column(length: 100, unique: true)]
    #[Assert\NotBlank(message: "Le nom de l'activité est obligatoire.")]
    #[Assert\Length(min: 2, max: 100, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $nom = '';

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'La catégorie est obligatoire.')]
    #[Assert\Length(max: 50, minMessage: 'Au moins {{ limit }} caractères.', maxMessage: 'Au plus {{ limit }} caractères.')]
    private string $categorie = '';

    /** Photo affichée sur les cartes des séances de cette activité : "images/activites/yoga.jpg" */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $photo = null;

    public function getId(): ?int { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function setNom(string $n): static { $this->nom = trim($n); return $this; }
    public function getCategorie(): string { return $this->categorie; }
    public function setCategorie(string $c): static { $this->categorie = trim($c); return $this; }
    public function getPhoto(): ?string { return $this->photo; }
    public function setPhoto(?string $p): static { $this->photo = $p; return $this; }
}
