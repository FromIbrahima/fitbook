<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;


final class Version20261010000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'FitBook : procédures stockées (getNombreInscrits, getAvisSalle, getNombreReservationsSalle)';
    }

    public function up(Schema $schema): void
    {
        foreach (self::procedures() as $sql) {
            $this->addSql($sql);
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP PROCEDURE IF EXISTS getNombreInscrits');
        $this->addSql('DROP PROCEDURE IF EXISTS getAvisSalle');
        $this->addSql('DROP PROCEDURE IF EXISTS getNombreReservationsSalle');
    }

    /** @return string[] « DROP PROCEDURE IF EXISTS » puis « CREATE PROCEDURE » (modifier = effacer puis recréer) */
    public static function procedures(): array
    {
        return [
            'DROP PROCEDURE IF EXISTS getNombreInscrits',
            <<<'SQL'
CREATE PROCEDURE getNombreInscrits(IN idSeance INT, OUT nbInscrits INT)
BEGIN
    SELECT COUNT(*) INTO nbInscrits FROM reservations WHERE id_seance = idSeance AND statut = "CONFIRMEE";
END
SQL,
            'DROP PROCEDURE IF EXISTS getAvisSalle',
            <<<'SQL'
CREATE PROCEDURE getAvisSalle(IN idSalle INT)
BEGIN
    SELECT * FROM avis WHERE id_salle = idSalle AND statut_moderation = "VALIDE";
END
SQL,
            'DROP PROCEDURE IF EXISTS getNombreReservationsSalle',
            <<<'SQL'
CREATE PROCEDURE getNombreReservationsSalle(IN idSalle INT, OUT nbReservations INT)
BEGIN
    SELECT COUNT(*) INTO nbReservations FROM reservations WHERE statut = "CONFIRMEE" AND id_seance IN (SELECT id_seance FROM seances WHERE id_salle = idSalle);
END
SQL,
        ];
    }
}
