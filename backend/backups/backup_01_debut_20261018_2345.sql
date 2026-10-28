/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: fitbook
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `fitbook`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `fitbook` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `fitbook`;

--
-- Table structure for table `activites`
--

DROP TABLE IF EXISTS `activites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activites` (
  `id_activite` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `categorie` varchar(50) NOT NULL,
  PRIMARY KEY (`id_activite`),
  UNIQUE KEY `UNIQ_766B5EB56C6E55B5` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites`
--

LOCK TABLES `activites` WRITE;
/*!40000 ALTER TABLE `activites` DISABLE KEYS */;
/*!40000 ALTER TABLE `activites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avis`
--

DROP TABLE IF EXISTS `avis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `avis` (
  `id_avis` int(11) NOT NULL AUTO_INCREMENT,
  `note` int(11) NOT NULL,
  `commentaire` longtext DEFAULT NULL,
  `date_avis` datetime NOT NULL,
  `statut_moderation` varchar(20) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `id_salle` int(11) DEFAULT NULL,
  `id_coach` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_avis`),
  KEY `IDX_8F91ABF050EAE44` (`id_utilisateur`),
  KEY `IDX_8F91ABF0A0123F6C` (`id_salle`),
  KEY `IDX_8F91ABF0D1DC2CFC` (`id_coach`),
  CONSTRAINT `FK_8F91ABF050EAE44` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE,
  CONSTRAINT `FK_8F91ABF0A0123F6C` FOREIGN KEY (`id_salle`) REFERENCES `salles` (`id_salle`) ON DELETE CASCADE,
  CONSTRAINT `FK_8F91ABF0D1DC2CFC` FOREIGN KEY (`id_coach`) REFERENCES `coachs` (`id_coach`) ON DELETE CASCADE,
  CONSTRAINT `chk_avis_note` CHECK (`note` between 1 and 5),
  CONSTRAINT `chk_avis_moderation` CHECK (`statut_moderation` in ('EN_ATTENTE','VALIDE','REJETE')),
  CONSTRAINT `chk_avis_cible` CHECK (`id_salle` is null <> (`id_coach` is null))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis`
--

LOCK TABLES `avis` WRITE;
/*!40000 ALTER TABLE `avis` DISABLE KEYS */;
/*!40000 ALTER TABLE `avis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coachs`
--

DROP TABLE IF EXISTS `coachs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `coachs` (
  `id_coach` int(11) NOT NULL AUTO_INCREMENT,
  `specialite` varchar(100) NOT NULL,
  `biographie` longtext DEFAULT NULL,
  `tarif_horaire` decimal(6,2) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  PRIMARY KEY (`id_coach`),
  UNIQUE KEY `UNIQ_89E318FD50EAE44` (`id_utilisateur`),
  CONSTRAINT `FK_89E318FD50EAE44` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE,
  CONSTRAINT `chk_coach_tarif` CHECK (`tarif_horaire` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coachs`
--

LOCK TABLES `coachs` WRITE;
/*!40000 ALTER TABLE `coachs` DISABLE KEYS */;
/*!40000 ALTER TABLE `coachs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilites`
--

DROP TABLE IF EXISTS `disponibilites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilites` (
  `id_disponibilite` int(11) NOT NULL AUTO_INCREMENT,
  `jour_semaine` smallint(6) NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `id_coach` int(11) DEFAULT NULL,
  `id_salle` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_disponibilite`),
  KEY `IDX_B0F3489CD1DC2CFC` (`id_coach`),
  KEY `IDX_B0F3489CA0123F6C` (`id_salle`),
  CONSTRAINT `FK_B0F3489CA0123F6C` FOREIGN KEY (`id_salle`) REFERENCES `salles` (`id_salle`) ON DELETE CASCADE,
  CONSTRAINT `FK_B0F3489CD1DC2CFC` FOREIGN KEY (`id_coach`) REFERENCES `coachs` (`id_coach`) ON DELETE CASCADE,
  CONSTRAINT `chk_dispo_jour` CHECK (`jour_semaine` between 1 and 7),
  CONSTRAINT `chk_dispo_heures` CHECK (`heure_fin` > `heure_debut`),
  CONSTRAINT `chk_dispo_cible` CHECK (`id_coach` is null <> (`id_salle` is null))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilites`
--

LOCK TABLES `disponibilites` WRITE;
/*!40000 ALTER TABLE `disponibilites` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctrine_migration_versions`
--

DROP TABLE IF EXISTS `doctrine_migration_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctrine_migration_versions`
--

LOCK TABLES `doctrine_migration_versions` WRITE;
/*!40000 ALTER TABLE `doctrine_migration_versions` DISABLE KEYS */;
INSERT INTO `doctrine_migration_versions` VALUES
('DoctrineMigrations\\Version20261010000001','2026-10-18 23:45:43',243),
('DoctrineMigrations\\Version20261010000002','2026-10-18 23:45:43',5);
/*!40000 ALTER TABLE `doctrine_migration_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoris`
--

DROP TABLE IF EXISTS `favoris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoris` (
  `date_ajout` datetime NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `id_salle` int(11) NOT NULL,
  PRIMARY KEY (`id_utilisateur`,`id_salle`),
  KEY `IDX_8933C43250EAE44` (`id_utilisateur`),
  KEY `IDX_8933C432A0123F6C` (`id_salle`),
  CONSTRAINT `FK_8933C43250EAE44` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE,
  CONSTRAINT `FK_8933C432A0123F6C` FOREIGN KEY (`id_salle`) REFERENCES `salles` (`id_salle`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoris`
--

LOCK TABLES `favoris` WRITE;
/*!40000 ALTER TABLE `favoris` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id_reservation` int(11) NOT NULL AUTO_INCREMENT,
  `date_reservation` datetime NOT NULL,
  `statut` varchar(20) NOT NULL,
  `code_confirmation` varchar(32) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `id_seance` int(11) NOT NULL,
  PRIMARY KEY (`id_reservation`),
  UNIQUE KEY `UNIQ_4DA2398315E059` (`code_confirmation`),
  UNIQUE KEY `uq_reservation_utilisateur_seance` (`id_utilisateur`,`id_seance`),
  KEY `IDX_4DA23950EAE44` (`id_utilisateur`),
  KEY `IDX_4DA239F94A48E3` (`id_seance`),
  CONSTRAINT `FK_4DA23950EAE44` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE,
  CONSTRAINT `FK_4DA239F94A48E3` FOREIGN KEY (`id_seance`) REFERENCES `seances` (`id_seance`) ON DELETE CASCADE,
  CONSTRAINT `chk_reservation_statut` CHECK (`statut` in ('CONFIRMEE','ANNULEE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salles`
--

DROP TABLE IF EXISTS `salles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `salles` (
  `id_salle` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `adresse` varchar(255) NOT NULL,
  `code_postal` varchar(10) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `equipements` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `id_utilisateur` int(11) NOT NULL,
  PRIMARY KEY (`id_salle`),
  KEY `IDX_799D45AA50EAE44` (`id_utilisateur`),
  CONSTRAINT `FK_799D45AA50EAE44` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salles`
--

LOCK TABLES `salles` WRITE;
/*!40000 ALTER TABLE `salles` DISABLE KEYS */;
/*!40000 ALTER TABLE `salles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seances`
--

DROP TABLE IF EXISTS `seances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seances` (
  `id_seance` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(120) NOT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `capacite_max` int(11) NOT NULL,
  `prix` decimal(6,2) NOT NULL,
  `niveau` varchar(20) NOT NULL,
  `statut` varchar(20) NOT NULL,
  `id_coach` int(11) NOT NULL,
  `id_salle` int(11) NOT NULL,
  `id_activite` int(11) NOT NULL,
  PRIMARY KEY (`id_seance`),
  KEY `idx_seance_date` (`date_debut`),
  KEY `IDX_FC699FF1D1DC2CFC` (`id_coach`),
  KEY `IDX_FC699FF1A0123F6C` (`id_salle`),
  KEY `IDX_FC699FF1E8AEB980` (`id_activite`),
  CONSTRAINT `FK_FC699FF1A0123F6C` FOREIGN KEY (`id_salle`) REFERENCES `salles` (`id_salle`),
  CONSTRAINT `FK_FC699FF1D1DC2CFC` FOREIGN KEY (`id_coach`) REFERENCES `coachs` (`id_coach`),
  CONSTRAINT `FK_FC699FF1E8AEB980` FOREIGN KEY (`id_activite`) REFERENCES `activites` (`id_activite`),
  CONSTRAINT `chk_seance_dates` CHECK (`date_fin` > `date_debut`),
  CONSTRAINT `chk_seance_capacite` CHECK (`capacite_max` > 0),
  CONSTRAINT `chk_seance_prix` CHECK (`prix` >= 0),
  CONSTRAINT `chk_seance_statut` CHECK (`statut` in ('PLANIFIEE','ANNULEE')),
  CONSTRAINT `chk_seance_niveau` CHECK (`niveau` in ('TOUS','DEBUTANT','INTERMEDIAIRE','AVANCE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seances`
--

LOCK TABLES `seances` WRITE;
/*!40000 ALTER TABLE `seances` DISABLE KEYS */;
/*!40000 ALTER TABLE `seances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `utilisateurs` (
  `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(180) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `role` varchar(20) NOT NULL,
  `est_verifie` tinyint(4) NOT NULL,
  `token_confirmation` varchar(64) DEFAULT NULL,
  `date_inscription` datetime NOT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `UNIQ_497B315EE7927C74` (`email`),
  CONSTRAINT `chk_utilisateur_role` CHECK (`role` in ('SPORTIF','COACH','GESTIONNAIRE','ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utilisateurs`
--

LOCK TABLES `utilisateurs` WRITE;
/*!40000 ALTER TABLE `utilisateurs` DISABLE KEYS */;
/*!40000 ALTER TABLE `utilisateurs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'fitbook'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getAvisSalle` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`fitbook_user`@`localhost` PROCEDURE `getAvisSalle`(IN idSalle INT)
BEGIN
    SELECT * FROM avis WHERE id_salle = idSalle AND statut_moderation = "VALIDE";
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getNombreInscrits` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`fitbook_user`@`localhost` PROCEDURE `getNombreInscrits`(IN idSeance INT, OUT nbInscrits INT)
BEGIN
    SELECT COUNT(*) INTO nbInscrits FROM reservations WHERE id_seance = idSeance AND statut = "CONFIRMEE";
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getNombreReservationsSalle` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`fitbook_user`@`localhost` PROCEDURE `getNombreReservationsSalle`(IN idSalle INT, OUT nbReservations INT)
BEGIN
    SELECT COUNT(*) INTO nbReservations FROM reservations WHERE statut = "CONFIRMEE" AND id_seance IN (SELECT id_seance FROM seances WHERE id_salle = idSalle);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 23:45:44
