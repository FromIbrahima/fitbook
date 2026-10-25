<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration 1 : création des 9 tables du MLD + contraintes CHECK (règles de gestion).
 
 */
final class Version20261010000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'FitBook : 9 tables du MLD, clés étrangères et contraintes CHECK';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE utilisateurs (id_utilisateur INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, mot_de_passe VARCHAR(255) NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, telephone VARCHAR(20) DEFAULT NULL, role VARCHAR(20) NOT NULL, est_verifie TINYINT NOT NULL, token_confirmation VARCHAR(64) DEFAULT NULL, date_inscription DATETIME NOT NULL, UNIQUE INDEX UNIQ_497B315EE7927C74 (email), PRIMARY KEY (id_utilisateur)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE favoris (date_ajout DATETIME NOT NULL, id_utilisateur INT NOT NULL, id_salle INT NOT NULL, INDEX IDX_8933C43250EAE44 (id_utilisateur), INDEX IDX_8933C432A0123F6C (id_salle), PRIMARY KEY (id_utilisateur, id_salle)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE avis (id_avis INT AUTO_INCREMENT NOT NULL, note INT NOT NULL, commentaire LONGTEXT DEFAULT NULL, date_avis DATETIME NOT NULL, statut_moderation VARCHAR(20) NOT NULL, id_utilisateur INT NOT NULL, id_salle INT DEFAULT NULL, id_coach INT DEFAULT NULL, INDEX IDX_8F91ABF050EAE44 (id_utilisateur), INDEX IDX_8F91ABF0A0123F6C (id_salle), INDEX IDX_8F91ABF0D1DC2CFC (id_coach), PRIMARY KEY (id_avis)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE salles (id_salle INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, adresse VARCHAR(255) NOT NULL, code_postal VARCHAR(10) NOT NULL, ville VARCHAR(100) NOT NULL, telephone VARCHAR(20) DEFAULT NULL, description LONGTEXT DEFAULT NULL, equipements VARCHAR(255) DEFAULT NULL, latitude NUMERIC(10, 7) DEFAULT NULL, longitude NUMERIC(10, 7) DEFAULT NULL, id_utilisateur INT NOT NULL, INDEX IDX_799D45AA50EAE44 (id_utilisateur), PRIMARY KEY (id_salle)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE seances (id_seance INT AUTO_INCREMENT NOT NULL, titre VARCHAR(120) NOT NULL, date_debut DATETIME NOT NULL, date_fin DATETIME NOT NULL, capacite_max INT NOT NULL, prix NUMERIC(6, 2) NOT NULL, niveau VARCHAR(20) NOT NULL, statut VARCHAR(20) NOT NULL, id_coach INT NOT NULL, id_salle INT NOT NULL, id_activite INT NOT NULL, INDEX idx_seance_date (date_debut), INDEX IDX_FC699FF1D1DC2CFC (id_coach), INDEX IDX_FC699FF1A0123F6C (id_salle), INDEX IDX_FC699FF1E8AEB980 (id_activite), PRIMARY KEY (id_seance)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE disponibilites (id_disponibilite INT AUTO_INCREMENT NOT NULL, jour_semaine SMALLINT NOT NULL, heure_debut TIME NOT NULL, heure_fin TIME NOT NULL, id_coach INT DEFAULT NULL, id_salle INT DEFAULT NULL, INDEX IDX_B0F3489CD1DC2CFC (id_coach), INDEX IDX_B0F3489CA0123F6C (id_salle), PRIMARY KEY (id_disponibilite)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE coachs (id_coach INT AUTO_INCREMENT NOT NULL, specialite VARCHAR(100) NOT NULL, biographie LONGTEXT DEFAULT NULL, tarif_horaire NUMERIC(6, 2) NOT NULL, ville VARCHAR(100) NOT NULL, id_utilisateur INT NOT NULL, UNIQUE INDEX UNIQ_89E318FD50EAE44 (id_utilisateur), PRIMARY KEY (id_coach)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE reservations (id_reservation INT AUTO_INCREMENT NOT NULL, date_reservation DATETIME NOT NULL, statut VARCHAR(20) NOT NULL, code_confirmation VARCHAR(32) NOT NULL, id_utilisateur INT NOT NULL, id_seance INT NOT NULL, UNIQUE INDEX UNIQ_4DA2398315E059 (code_confirmation), UNIQUE INDEX uq_reservation_utilisateur_seance (id_utilisateur, id_seance), INDEX IDX_4DA23950EAE44 (id_utilisateur), INDEX IDX_4DA239F94A48E3 (id_seance), PRIMARY KEY (id_reservation)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE activites (id_activite INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, categorie VARCHAR(50) NOT NULL, UNIQUE INDEX UNIQ_766B5EB56C6E55B5 (nom), PRIMARY KEY (id_activite)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE favoris ADD CONSTRAINT FK_8933C43250EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favoris ADD CONSTRAINT FK_8933C432A0123F6C FOREIGN KEY (id_salle) REFERENCES salles (id_salle) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF050EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF0A0123F6C FOREIGN KEY (id_salle) REFERENCES salles (id_salle) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF0D1DC2CFC FOREIGN KEY (id_coach) REFERENCES coachs (id_coach) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE salles ADD CONSTRAINT FK_799D45AA50EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur)');
        $this->addSql('ALTER TABLE seances ADD CONSTRAINT FK_FC699FF1D1DC2CFC FOREIGN KEY (id_coach) REFERENCES coachs (id_coach)');
        $this->addSql('ALTER TABLE seances ADD CONSTRAINT FK_FC699FF1A0123F6C FOREIGN KEY (id_salle) REFERENCES salles (id_salle)');
        $this->addSql('ALTER TABLE seances ADD CONSTRAINT FK_FC699FF1E8AEB980 FOREIGN KEY (id_activite) REFERENCES activites (id_activite)');
        $this->addSql('ALTER TABLE disponibilites ADD CONSTRAINT FK_B0F3489CD1DC2CFC FOREIGN KEY (id_coach) REFERENCES coachs (id_coach) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE disponibilites ADD CONSTRAINT FK_B0F3489CA0123F6C FOREIGN KEY (id_salle) REFERENCES salles (id_salle) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE coachs ADD CONSTRAINT FK_89E318FD50EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reservations ADD CONSTRAINT FK_4DA23950EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reservations ADD CONSTRAINT FK_4DA239F94A48E3 FOREIGN KEY (id_seance) REFERENCES seances (id_seance) ON DELETE CASCADE');

        // ---- règles de gestion vérifiées aussi par MySQL (CHECK, MySQL >= 8.0.16 / MariaDB >= 10.2) ----
        $this->addSql("ALTER TABLE utilisateurs ADD CONSTRAINT chk_utilisateur_role CHECK (role IN ('SPORTIF','COACH','GESTIONNAIRE','ADMIN'))");
        $this->addSql('ALTER TABLE coachs ADD CONSTRAINT chk_coach_tarif CHECK (tarif_horaire >= 0)');
        $this->addSql('ALTER TABLE seances ADD CONSTRAINT chk_seance_dates CHECK (date_fin > date_debut)');
        $this->addSql('ALTER TABLE seances ADD CONSTRAINT chk_seance_capacite CHECK (capacite_max > 0)');
        $this->addSql('ALTER TABLE seances ADD CONSTRAINT chk_seance_prix CHECK (prix >= 0)');
        $this->addSql("ALTER TABLE seances ADD CONSTRAINT chk_seance_statut CHECK (statut IN ('PLANIFIEE','ANNULEE'))");
        $this->addSql("ALTER TABLE seances ADD CONSTRAINT chk_seance_niveau CHECK (niveau IN ('TOUS','DEBUTANT','INTERMEDIAIRE','AVANCE'))");
        $this->addSql("ALTER TABLE reservations ADD CONSTRAINT chk_reservation_statut CHECK (statut IN ('CONFIRMEE','ANNULEE'))");
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT chk_avis_note CHECK (note BETWEEN 1 AND 5)');
        $this->addSql("ALTER TABLE avis ADD CONSTRAINT chk_avis_moderation CHECK (statut_moderation IN ('EN_ATTENTE','VALIDE','REJETE'))");
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT chk_avis_cible CHECK ((id_salle IS NULL) <> (id_coach IS NULL))');
        $this->addSql('ALTER TABLE disponibilites ADD CONSTRAINT chk_dispo_jour CHECK (jour_semaine BETWEEN 1 AND 7)');
        $this->addSql('ALTER TABLE disponibilites ADD CONSTRAINT chk_dispo_heures CHECK (heure_fin > heure_debut)');
        $this->addSql('ALTER TABLE disponibilites ADD CONSTRAINT chk_dispo_cible CHECK ((id_coach IS NULL) <> (id_salle IS NULL))');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE favoris DROP FOREIGN KEY FK_8933C43250EAE44');
        $this->addSql('ALTER TABLE favoris DROP FOREIGN KEY FK_8933C432A0123F6C');
        $this->addSql('ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF050EAE44');
        $this->addSql('ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF0A0123F6C');
        $this->addSql('ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF0D1DC2CFC');
        $this->addSql('ALTER TABLE salles DROP FOREIGN KEY FK_799D45AA50EAE44');
        $this->addSql('ALTER TABLE seances DROP FOREIGN KEY FK_FC699FF1D1DC2CFC');
        $this->addSql('ALTER TABLE seances DROP FOREIGN KEY FK_FC699FF1A0123F6C');
        $this->addSql('ALTER TABLE seances DROP FOREIGN KEY FK_FC699FF1E8AEB980');
        $this->addSql('ALTER TABLE disponibilites DROP FOREIGN KEY FK_B0F3489CD1DC2CFC');
        $this->addSql('ALTER TABLE disponibilites DROP FOREIGN KEY FK_B0F3489CA0123F6C');
        $this->addSql('ALTER TABLE coachs DROP FOREIGN KEY FK_89E318FD50EAE44');
        $this->addSql('ALTER TABLE reservations DROP FOREIGN KEY FK_4DA23950EAE44');
        $this->addSql('ALTER TABLE reservations DROP FOREIGN KEY FK_4DA239F94A48E3');
        $this->addSql('DROP TABLE activites');
        $this->addSql('DROP TABLE avis');
        $this->addSql('DROP TABLE coachs');
        $this->addSql('DROP TABLE disponibilites');
        $this->addSql('DROP TABLE favoris');
        $this->addSql('DROP TABLE reservations');
        $this->addSql('DROP TABLE salles');
        $this->addSql('DROP TABLE seances');
        $this->addSql('DROP TABLE utilisateurs');
    }
}
