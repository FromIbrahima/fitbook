<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/** Association FAVORI (n,n) du MCD : clé primaire composée (id_utilisateur, id_salle) + date_ajout. */
#[ORM\Entity]
#[ORM\Table(name: 'favoris')]
class Favori
{
    #[ORM\Id]
    #[ORM\ManyToOne(inversedBy: 'favoris')]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false, onDelete: 'CASCADE')]
    private Utilisateur $utilisateur;

    #[ORM\Id]
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'id_salle', referencedColumnName: 'id_salle', nullable: false, onDelete: 'CASCADE')]
    private Salle $salle;

    #[ORM\Column(name: 'date_ajout', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $dateAjout;

    public function __construct(Utilisateur $utilisateur, Salle $salle)
    {
        $this->utilisateur = $utilisateur;
        $this->salle = $salle;
        $this->dateAjout = new \DateTimeImmutable();
    }

    public function getUtilisateur(): Utilisateur { return $this->utilisateur; }
    public function getSalle(): Salle { return $this->salle; }
    public function getDateAjout(): \DateTimeImmutable { return $this->dateAjout; }
}
