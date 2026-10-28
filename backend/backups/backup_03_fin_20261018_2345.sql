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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites`
--

LOCK TABLES `activites` WRITE;
/*!40000 ALTER TABLE `activites` DISABLE KEYS */;
INSERT INTO `activites` VALUES
(1,'Yoga','Bien-être'),
(2,'Pilates','Bien-être'),
(3,'Méditation','Bien-être'),
(4,'CrossFit','Cardio & force'),
(5,'Boxe','Sports de combat'),
(6,'Musculation','Cardio & force'),
(7,'Running','Cardio & force');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis`
--

LOCK TABLES `avis` WRITE;
/*!40000 ALTER TABLE `avis` DISABLE KEYS */;
INSERT INTO `avis` VALUES
(1,5,'Super ambiance, la coach Yasmina est top. Je recommande !','2026-10-18 23:45:45','VALIDE',10,1,NULL),
(2,5,'Studio très propre et calme. Réservation simple et rapide.','2026-10-18 23:45:45','VALIDE',11,1,NULL),
(3,4,'Bons cours mais vestiaires un peu petits aux heures de pointe.','2026-10-18 23:45:45','VALIDE',12,1,NULL),
(4,5,'Box très bien équipée, coachs motivants.','2026-10-18 23:45:45','VALIDE',9,3,NULL),
(5,4,'Ambiance familiale, parfait pour débuter la boxe.','2026-10-18 23:45:45','VALIDE',13,4,NULL),
(6,5,'Le sauna après le pilates, un vrai bonheur.','2026-10-18 23:45:45','VALIDE',14,5,NULL),
(7,5,'Pédagogue et bienveillante, cours très fluides.','2026-10-18 23:45:45','VALIDE',10,NULL,1),
(8,5,'Exercices précis, on sent les progrès rapidement.','2026-10-18 23:45:45','VALIDE',11,NULL,3),
(9,4,'Exigeant mais toujours à l\'écoute.','2026-10-18 23:45:45','VALIDE',12,NULL,5),
(10,5,'Programmation au top, je progresse chaque semaine.','2026-10-18 23:45:45','VALIDE',9,NULL,2),
(11,3,'Joli lieu mais un peu bruyant côté rue ce jour-là.','2026-10-18 23:45:45','EN_ATTENTE',14,2,NULL),
(12,2,'Cours commencé avec 15 minutes de retard.','2026-10-18 23:45:45','EN_ATTENTE',13,NULL,4);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coachs`
--

LOCK TABLES `coachs` WRITE;
/*!40000 ALTER TABLE `coachs` DISABLE KEYS */;
INSERT INTO `coachs` VALUES
(1,'Yoga · Méditation','Professeure de yoga certifiée RYT-500, 10 ans d\'expérience. Vinyasa, Hatha et méditation guidée.',45.00,'Ixelles',4),
(2,'CrossFit · Musculation','Coach CrossFit L2, préparation physique et haltérophilie.',55.00,'Laeken',8),
(3,'Pilates','Pilates matwork et reformer, renforcement profond et posture.',40.00,'Uccle',5),
(4,'Yin Yoga','Yin yoga et mobilité, idéal pour récupérer après le sport.',35.00,'Etterbeek',6),
(5,'Boxe anglaise','Ancien boxeur amateur, cours techniques et cardio-boxe tous niveaux.',50.00,'Saint-Gilles',7);
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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilites`
--

LOCK TABLES `disponibilites` WRITE;
/*!40000 ALTER TABLE `disponibilites` DISABLE KEYS */;
INSERT INTO `disponibilites` VALUES
(1,1,'07:00:00','22:00:00',NULL,1),
(2,2,'07:00:00','22:00:00',NULL,1),
(3,3,'07:00:00','22:00:00',NULL,1),
(4,4,'07:00:00','22:00:00',NULL,1),
(5,5,'07:00:00','21:00:00',NULL,1),
(6,6,'09:00:00','18:00:00',NULL,1),
(7,7,'09:00:00','13:00:00',NULL,1),
(8,1,'07:00:00','22:00:00',NULL,2),
(9,2,'07:00:00','22:00:00',NULL,2),
(10,3,'07:00:00','22:00:00',NULL,2),
(11,4,'07:00:00','22:00:00',NULL,2),
(12,5,'07:00:00','21:00:00',NULL,2),
(13,6,'09:00:00','18:00:00',NULL,2),
(14,7,'09:00:00','13:00:00',NULL,2),
(15,1,'07:00:00','22:00:00',NULL,3),
(16,2,'07:00:00','22:00:00',NULL,3),
(17,3,'07:00:00','22:00:00',NULL,3),
(18,4,'07:00:00','22:00:00',NULL,3),
(19,5,'07:00:00','21:00:00',NULL,3),
(20,6,'09:00:00','18:00:00',NULL,3),
(21,7,'09:00:00','13:00:00',NULL,3),
(22,1,'07:00:00','22:00:00',NULL,4),
(23,2,'07:00:00','22:00:00',NULL,4),
(24,3,'07:00:00','22:00:00',NULL,4),
(25,4,'07:00:00','22:00:00',NULL,4),
(26,5,'07:00:00','21:00:00',NULL,4),
(27,6,'09:00:00','18:00:00',NULL,4),
(28,7,'09:00:00','13:00:00',NULL,4),
(29,1,'07:00:00','22:00:00',NULL,5),
(30,2,'07:00:00','22:00:00',NULL,5),
(31,3,'07:00:00','22:00:00',NULL,5),
(32,4,'07:00:00','22:00:00',NULL,5),
(33,5,'07:00:00','21:00:00',NULL,5),
(34,6,'09:00:00','18:00:00',NULL,5),
(35,7,'09:00:00','13:00:00',NULL,5),
(36,1,'17:00:00','21:00:00',1,NULL),
(37,2,'07:00:00','10:00:00',1,NULL),
(38,3,'17:00:00','21:00:00',1,NULL),
(39,4,'18:00:00','21:00:00',1,NULL),
(40,6,'09:00:00','12:00:00',1,NULL),
(41,1,'12:00:00','14:00:00',3,NULL),
(42,3,'12:00:00','14:00:00',3,NULL),
(43,5,'12:00:00','14:00:00',3,NULL),
(44,2,'19:00:00','21:30:00',4,NULL),
(45,5,'19:00:00','21:30:00',4,NULL),
(46,7,'10:00:00','12:00:00',4,NULL),
(47,1,'18:00:00','22:00:00',5,NULL),
(48,3,'18:00:00','22:00:00',5,NULL),
(49,6,'10:00:00','13:00:00',5,NULL),
(50,1,'07:00:00','09:00:00',2,NULL),
(51,2,'07:00:00','09:00:00',2,NULL),
(52,4,'07:00:00','09:00:00',2,NULL),
(53,6,'09:00:00','12:00:00',2,NULL);
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
INSERT INTO `favoris` VALUES
('2026-10-18 23:45:45',9,1),
('2026-10-18 23:45:45',9,3),
('2026-10-18 23:45:45',10,4);
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
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES
(1,'2026-10-18 23:45:45','CONFIRMEE','BE794DAB4392',9,2),
(2,'2026-10-18 23:45:45','CONFIRMEE','BEBB79B22B36',9,3),
(3,'2026-10-18 23:45:45','CONFIRMEE','B9C84586ACC2',10,3),
(4,'2026-10-18 23:45:45','CONFIRMEE','13052C737FAB',9,4),
(5,'2026-10-18 23:45:45','CONFIRMEE','ED5C70B825BE',10,4),
(6,'2026-10-18 23:45:45','CONFIRMEE','23A29C3F68BD',11,4),
(7,'2026-10-18 23:45:45','CONFIRMEE','F6BE513DD537',9,5),
(8,'2026-10-18 23:45:45','CONFIRMEE','F256798B35C2',10,5),
(9,'2026-10-18 23:45:45','CONFIRMEE','A985F44319A5',11,5),
(10,'2026-10-18 23:45:45','CONFIRMEE','4EBEEC5FA153',12,5),
(11,'2026-10-18 23:45:45','CONFIRMEE','7A9923C430AB',9,7),
(12,'2026-10-18 23:45:45','CONFIRMEE','D776E6277250',9,8),
(13,'2026-10-18 23:45:45','CONFIRMEE','343CE33028E3',10,8),
(14,'2026-10-18 23:45:45','CONFIRMEE','5278DC49DD2F',9,9),
(15,'2026-10-18 23:45:45','CONFIRMEE','D03CA4FC00DA',10,9),
(16,'2026-10-18 23:45:45','CONFIRMEE','8B1A4E93E1AB',11,9),
(17,'2026-10-18 23:45:45','CONFIRMEE','E616B49F6C73',9,10),
(18,'2026-10-18 23:45:45','CONFIRMEE','BEF59CBE1CCC',10,10),
(19,'2026-10-18 23:45:45','CONFIRMEE','EE9A8A535A0E',11,10),
(20,'2026-10-18 23:45:45','CONFIRMEE','93B8A85CE8AA',12,10),
(21,'2026-10-18 23:45:45','CONFIRMEE','933748EFFFCD',9,12),
(22,'2026-10-18 23:45:45','CONFIRMEE','1DB79D70EBB5',9,13),
(23,'2026-10-18 23:45:45','CONFIRMEE','B258BCAF9215',10,13),
(24,'2026-10-18 23:45:45','CONFIRMEE','52A3604817C2',9,14),
(25,'2026-10-18 23:45:45','CONFIRMEE','5690A9BBEE04',10,14),
(26,'2026-10-18 23:45:45','CONFIRMEE','1EF13531A45B',11,14),
(27,'2026-10-18 23:45:45','CONFIRMEE','4A37BF8984E8',9,15),
(28,'2026-10-18 23:45:45','CONFIRMEE','B87F1D2C805D',10,15),
(29,'2026-10-18 23:45:45','CONFIRMEE','C35E1CFEF802',11,15),
(30,'2026-10-18 23:45:45','CONFIRMEE','6790012DD390',12,15),
(31,'2026-10-18 23:45:45','CONFIRMEE','E1FBE49981D1',9,17),
(32,'2026-10-18 23:45:45','CONFIRMEE','A4759E81847C',9,18),
(33,'2026-10-18 23:45:45','CONFIRMEE','D20793BB328F',10,18),
(34,'2026-10-18 23:45:45','CONFIRMEE','FE56C580D147',9,19),
(35,'2026-10-18 23:45:45','CONFIRMEE','7F234375FB8C',10,19),
(36,'2026-10-18 23:45:45','CONFIRMEE','7A1C4C0694A2',11,19),
(37,'2026-10-18 23:45:45','CONFIRMEE','4D9795D23370',9,20),
(38,'2026-10-18 23:45:45','CONFIRMEE','9A6CEE7B46EC',10,20),
(39,'2026-10-18 23:45:45','CONFIRMEE','0A51D73B7341',11,20),
(40,'2026-10-18 23:45:45','CONFIRMEE','A84287277108',12,20),
(41,'2026-10-18 23:45:45','CONFIRMEE','7AFE873C0C7E',9,22),
(42,'2026-10-18 23:45:45','CONFIRMEE','FA5082BF5220',9,23),
(43,'2026-10-18 23:45:45','CONFIRMEE','B53D67ACE750',10,23),
(44,'2026-10-18 23:45:45','CONFIRMEE','06AE830DB236',9,24),
(45,'2026-10-18 23:45:45','CONFIRMEE','14994B24E7F7',10,24),
(46,'2026-10-18 23:45:45','CONFIRMEE','AB60282E134B',11,24),
(47,'2026-10-18 23:45:45','CONFIRMEE','DDBD20A1DFE7',9,25),
(48,'2026-10-18 23:45:45','CONFIRMEE','195DE90EAC8E',10,25),
(49,'2026-10-18 23:45:45','CONFIRMEE','AE17EEC5A48B',11,25),
(50,'2026-10-18 23:45:45','CONFIRMEE','A07ED1CB2F39',12,25),
(51,'2026-10-18 23:45:45','CONFIRMEE','2C5CDF8CCAE6',9,27),
(52,'2026-10-18 23:45:45','CONFIRMEE','3AEECD324949',9,28),
(53,'2026-10-18 23:45:45','CONFIRMEE','C30E03C46C80',10,28),
(54,'2026-10-18 23:45:45','CONFIRMEE','3E2AFDDA0C65',9,29),
(55,'2026-10-18 23:45:45','CONFIRMEE','58F7FDA96B33',10,29),
(56,'2026-10-18 23:45:45','CONFIRMEE','A71FAB043FCD',11,29),
(57,'2026-10-18 23:45:45','CONFIRMEE','D5713396BC03',9,30),
(58,'2026-10-18 23:45:45','CONFIRMEE','4BF1AF1E8687',10,30),
(59,'2026-10-18 23:45:45','CONFIRMEE','9619799C507F',11,30),
(60,'2026-10-18 23:45:45','CONFIRMEE','F63940C57C71',12,30),
(61,'2026-10-18 23:45:45','CONFIRMEE','503DA8428B54',13,30),
(62,'2026-10-18 23:45:45','CONFIRMEE','64BF0BA5D323',14,30),
(63,'2026-10-18 23:45:45','CONFIRMEE','15A939860F91',16,30),
(64,'2026-10-18 23:45:45','CONFIRMEE','22CFF4091A28',17,30),
(65,'2026-10-18 23:45:45','CONFIRMEE','3A6E16742F13',18,30),
(66,'2026-10-18 23:45:45','CONFIRMEE','7D45EB2A6E07',19,30),
(67,'2026-10-18 23:45:45','CONFIRMEE','A6524C3B24A5',20,30),
(68,'2026-10-18 23:45:45','CONFIRMEE','7EAB44E0F385',21,30),
(69,'2026-10-18 23:45:45','CONFIRMEE','64559CB5F7EA',9,32),
(70,'2026-10-18 23:45:45','CONFIRMEE','685140F6F0C0',9,33),
(71,'2026-10-18 23:45:45','CONFIRMEE','32D1C3179592',10,33),
(72,'2026-10-18 23:45:45','CONFIRMEE','49FEE866E4E9',9,34),
(73,'2026-10-18 23:45:45','CONFIRMEE','E140B321F253',10,34),
(74,'2026-10-18 23:45:45','CONFIRMEE','56EDBB762358',11,34),
(75,'2026-10-18 23:45:45','CONFIRMEE','643214B359B4',9,35),
(76,'2026-10-18 23:45:45','CONFIRMEE','8ABAAAA7B7B7',10,35),
(77,'2026-10-18 23:45:45','CONFIRMEE','B79575F6EB62',11,35),
(78,'2026-10-18 23:45:45','CONFIRMEE','4820A70A5A19',12,35),
(79,'2026-10-18 23:45:45','CONFIRMEE','949D86135FD1',9,37),
(80,'2026-10-18 23:45:45','CONFIRMEE','87AC5904699A',9,38),
(81,'2026-10-18 23:45:45','CONFIRMEE','A61E6BA92196',10,38),
(82,'2026-10-18 23:45:45','CONFIRMEE','4D0587FAA5F4',11,38),
(83,'2026-10-18 23:45:45','CONFIRMEE','76029B6C1875',12,38),
(84,'2026-10-18 23:45:45','CONFIRMEE','73C6D0A7749E',13,38),
(85,'2026-10-18 23:45:45','CONFIRMEE','BB16BFB58E2C',14,38),
(86,'2026-10-18 23:45:45','CONFIRMEE','94A2E6B2FCAE',22,38),
(87,'2026-10-18 23:45:45','CONFIRMEE','506D0B375D3C',23,38),
(88,'2026-10-18 23:45:45','CONFIRMEE','D056DB023F69',24,38),
(89,'2026-10-18 23:45:45','CONFIRMEE','82076AC17AFE',25,38),
(90,'2026-10-18 23:45:45','CONFIRMEE','DDDC491D16B4',26,38),
(91,'2026-10-18 23:45:45','CONFIRMEE','F547BB3D3C09',27,38),
(92,'2026-10-18 23:45:45','CONFIRMEE','6B912FBCD9F2',9,39),
(93,'2026-10-18 23:45:45','CONFIRMEE','60B9966BFEB4',10,39),
(94,'2026-10-18 23:45:45','CONFIRMEE','B956E548481B',11,39),
(95,'2026-10-18 23:45:45','CONFIRMEE','9752D1E9EF58',9,40),
(96,'2026-10-18 23:45:45','CONFIRMEE','FF2240255537',10,40),
(97,'2026-10-18 23:45:45','CONFIRMEE','2525494E8BBF',11,40),
(98,'2026-10-18 23:45:45','CONFIRMEE','D5AC5241AE73',12,40),
(99,'2026-10-18 23:45:45','CONFIRMEE','3FAEFB9C31DB',9,42),
(100,'2026-10-18 23:45:45','CONFIRMEE','1CD2F38DA178',9,43),
(101,'2026-10-18 23:45:45','CONFIRMEE','47BCE206311C',10,43),
(102,'2026-10-18 23:45:45','CONFIRMEE','D6366CFCA218',9,44),
(103,'2026-10-18 23:45:45','CONFIRMEE','7C00B9E9D601',10,44),
(104,'2026-10-18 23:45:45','CONFIRMEE','C8BFAB5D64DA',11,44),
(105,'2026-10-18 23:45:45','CONFIRMEE','72FBFED540A6',9,45),
(106,'2026-10-18 23:45:45','CONFIRMEE','7DE25C4CA14E',10,45),
(107,'2026-10-18 23:45:45','CONFIRMEE','CAAB51A77864',11,45),
(108,'2026-10-18 23:45:45','CONFIRMEE','F0BE91C648E8',12,45),
(109,'2026-10-18 23:45:45','CONFIRMEE','381A33F275B4',9,47),
(110,'2026-10-18 23:45:45','CONFIRMEE','7688DECF56FA',10,47),
(111,'2026-10-18 23:45:45','CONFIRMEE','9B89546D1B36',11,47),
(112,'2026-10-18 23:45:45','CONFIRMEE','0FBC297AB1D1',12,47),
(113,'2026-10-18 23:45:45','CONFIRMEE','4F6490A523B2',13,47),
(114,'2026-10-18 23:45:45','CONFIRMEE','9CCA278BAB38',14,47),
(115,'2026-10-18 23:45:45','CONFIRMEE','7D596B1DB3F1',28,47),
(116,'2026-10-18 23:45:45','CONFIRMEE','CA8A06A45A3A',29,47),
(117,'2026-10-18 23:45:45','CONFIRMEE','2829683F5391',30,47),
(118,'2026-10-18 23:45:45','CONFIRMEE','527DFEEBB152',31,47),
(119,'2026-10-18 23:45:45','CONFIRMEE','2A06BD02CE92',32,47),
(120,'2026-10-18 23:45:45','CONFIRMEE','3E5A12422CD6',33,47),
(121,'2026-10-18 23:45:45','CONFIRMEE','F07EEC94082E',9,48),
(122,'2026-10-18 23:45:45','CONFIRMEE','CA121C32D99D',10,48),
(123,'2026-10-18 23:45:45','CONFIRMEE','4F366BE1814F',9,49),
(124,'2026-10-18 23:45:45','CONFIRMEE','814FC20EACD4',10,49),
(125,'2026-10-18 23:45:45','CONFIRMEE','36995B301B5F',11,49),
(126,'2026-10-18 23:45:45','CONFIRMEE','1196C87AE4BF',9,50),
(127,'2026-10-18 23:45:45','CONFIRMEE','C5BB98205953',10,50),
(128,'2026-10-18 23:45:45','CONFIRMEE','083EEEE4F013',11,50),
(129,'2026-10-18 23:45:45','CONFIRMEE','F730030B88BB',12,50),
(130,'2026-10-18 23:45:45','CONFIRMEE','79FF20761A87',9,52),
(131,'2026-10-18 23:45:45','CONFIRMEE','103970871029',9,53),
(132,'2026-10-18 23:45:45','CONFIRMEE','A6EFBD3C4F43',10,53),
(133,'2026-10-18 23:45:45','CONFIRMEE','9E65BB6BE81E',9,54),
(134,'2026-10-18 23:45:45','CONFIRMEE','90E5694B51A7',10,54),
(135,'2026-10-18 23:45:45','CONFIRMEE','3E0C2E60A24B',11,54),
(136,'2026-10-18 23:45:45','CONFIRMEE','9C7966A4CB4E',9,55),
(137,'2026-10-18 23:45:45','CONFIRMEE','D7FAD15B542E',10,55),
(138,'2026-10-18 23:45:45','CONFIRMEE','A6A5DF959E35',11,55),
(139,'2026-10-18 23:45:45','CONFIRMEE','63A7493FB55D',12,55),
(140,'2026-10-18 23:45:45','CONFIRMEE','4E8152010850',13,55),
(141,'2026-10-18 23:45:45','CONFIRMEE','5E3565E76D0C',14,55),
(142,'2026-10-18 23:45:45','CONFIRMEE','183CD150892E',34,55),
(143,'2026-10-18 23:45:45','CONFIRMEE','F887AC4FAF19',35,55),
(144,'2026-10-18 23:45:45','CONFIRMEE','7FA2E4AD70CF',36,55),
(145,'2026-10-18 23:45:45','CONFIRMEE','A8810BEF780E',37,55),
(146,'2026-10-18 23:45:45','CONFIRMEE','1D01C91EB669',38,55),
(147,'2026-10-18 23:45:45','CONFIRMEE','1F61B6F234A2',39,55),
(148,'2026-10-18 23:45:45','CONFIRMEE','323F560445B9',9,57),
(149,'2026-10-18 23:45:45','CONFIRMEE','0D2A894F1E4D',9,58),
(150,'2026-10-18 23:45:45','CONFIRMEE','D5EC81EADE70',10,58);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salles`
--

LOCK TABLES `salles` WRITE;
/*!40000 ALTER TABLE `salles` DISABLE KEYS */;
INSERT INTO `salles` VALUES
(1,'Zen Studio','Rue du Bailli 42','1050','Ixelles','02 345 67 89','Un studio lumineux de 400 m² dédié au yoga, au pilates et à la méditation. Cours pour tous les niveaux, encadrés par des coachs certifiés.','Vestiaires,Douches,Tapis fournis,Wi-Fi,Parking vélo',50.8270000,4.3640000,2),
(2,'Lotus Loft','Avenue d\'Auderghem 120','1040','Etterbeek','02 640 11 22','Loft cosy pour le yoga doux, le yin et le yoga prénatal.','Vestiaires,Tisanerie,Tapis fournis',50.8335000,4.3890000,2),
(3,'Box Atomium','Boulevard du Centenaire 8','1020','Laeken','02 478 90 12','Box de CrossFit de 600 m² avec zone haltérophilie et rameurs.','Vestiaires,Douches,Casiers,Parking',50.8950000,4.3410000,3),
(4,'Ring Club','Chaussée de Waterloo 210','1060','Saint-Gilles','02 537 45 66','Club de boxe historique : ring, sacs, cardio-boxe et préparation physique.','Vestiaires,Douches,Gants prêtés',50.8260000,4.3450000,3),
(5,'Move Center','Rue Vanderkindere 300','1180','Uccle','02 344 55 77','Centre de remise en forme : pilates, musculation et running club.','Vestiaires,Douches,Wi-Fi,Parking,Sauna',50.8100000,4.3560000,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seances`
--

LOCK TABLES `seances` WRITE;
/*!40000 ALTER TABLE `seances` DISABLE KEYS */;
INSERT INTO `seances` VALUES
(1,'Méditation guidée','2026-10-08 20:00:00','2026-10-08 20:45:00',20,10.00,'TOUS','PLANIFIEE',1,1,3),
(2,'WOD Intensif','2026-10-08 07:00:00','2026-10-08 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(3,'Pilates Core','2026-10-09 12:15:00','2026-10-09 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(4,'Yin Yoga','2026-10-09 19:45:00','2026-10-09 20:45:00',12,13.00,'DEBUTANT','PLANIFIEE',4,2,1),
(5,'Cardio-boxe','2026-10-10 10:30:00','2026-10-10 11:30:00',16,14.00,'INTERMEDIAIRE','PLANIFIEE',5,4,5),
(6,'Haltérophilie technique','2026-10-10 10:00:00','2026-10-10 11:30:00',8,20.00,'INTERMEDIAIRE','PLANIFIEE',2,3,6),
(7,'Yoga prénatal','2026-10-11 10:30:00','2026-10-11 11:30:00',8,17.00,'DEBUTANT','PLANIFIEE',4,2,1),
(8,'Vinyasa Flow','2026-10-12 18:30:00','2026-10-12 19:30:00',15,15.00,'TOUS','PLANIFIEE',1,1,1),
(9,'Pilates Core','2026-10-12 12:15:00','2026-10-12 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(10,'Boxe débutant','2026-10-12 19:00:00','2026-10-12 20:00:00',12,12.00,'DEBUTANT','PLANIFIEE',5,4,5),
(11,'WOD Intensif','2026-10-12 07:00:00','2026-10-12 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(12,'Réveil yoga','2026-10-13 07:30:00','2026-10-13 08:30:00',15,12.00,'DEBUTANT','PLANIFIEE',1,1,1),
(13,'Yin Yoga','2026-10-13 19:45:00','2026-10-13 20:45:00',12,13.00,'DEBUTANT','PLANIFIEE',4,2,1),
(14,'WOD Intensif','2026-10-13 07:00:00','2026-10-13 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(15,'Vinyasa Flow','2026-10-14 18:30:00','2026-10-14 19:30:00',15,15.00,'TOUS','PLANIFIEE',1,1,1),
(16,'Pilates Core','2026-10-14 12:15:00','2026-10-14 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(17,'Boxe débutant','2026-10-14 19:00:00','2026-10-14 20:00:00',12,12.00,'DEBUTANT','PLANIFIEE',5,4,5),
(18,'Méditation guidée','2026-10-15 20:00:00','2026-10-15 20:45:00',20,10.00,'TOUS','PLANIFIEE',1,1,3),
(19,'WOD Intensif','2026-10-15 07:00:00','2026-10-15 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(20,'Pilates Core','2026-10-16 12:15:00','2026-10-16 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(21,'Yin Yoga','2026-10-16 19:45:00','2026-10-16 20:45:00',12,13.00,'DEBUTANT','PLANIFIEE',4,2,1),
(22,'Cardio-boxe','2026-10-17 10:30:00','2026-10-17 11:30:00',16,14.00,'INTERMEDIAIRE','PLANIFIEE',5,4,5),
(23,'Haltérophilie technique','2026-10-17 10:00:00','2026-10-17 11:30:00',8,20.00,'INTERMEDIAIRE','PLANIFIEE',2,3,6),
(24,'Yoga prénatal','2026-10-18 10:30:00','2026-10-18 11:30:00',8,17.00,'DEBUTANT','PLANIFIEE',4,2,1),
(25,'Vinyasa Flow','2026-10-19 18:30:00','2026-10-19 19:30:00',15,15.00,'TOUS','PLANIFIEE',1,1,1),
(26,'Pilates Core','2026-10-19 12:15:00','2026-10-19 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(27,'Boxe débutant','2026-10-19 19:00:00','2026-10-19 20:00:00',12,12.00,'DEBUTANT','PLANIFIEE',5,4,5),
(28,'WOD Intensif','2026-10-19 07:00:00','2026-10-19 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(29,'Réveil yoga','2026-10-20 07:30:00','2026-10-20 08:30:00',15,12.00,'DEBUTANT','PLANIFIEE',1,1,1),
(30,'Yin Yoga','2026-10-20 19:45:00','2026-10-20 20:45:00',12,13.00,'DEBUTANT','PLANIFIEE',4,2,1),
(31,'WOD Intensif','2026-10-20 07:00:00','2026-10-20 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(32,'Vinyasa Flow','2026-10-21 18:30:00','2026-10-21 19:30:00',15,15.00,'TOUS','PLANIFIEE',1,1,1),
(33,'Pilates Core','2026-10-21 12:15:00','2026-10-21 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(34,'Boxe débutant','2026-10-21 19:00:00','2026-10-21 20:00:00',12,12.00,'DEBUTANT','PLANIFIEE',5,4,5),
(35,'Méditation guidée','2026-10-22 20:00:00','2026-10-22 20:45:00',20,10.00,'TOUS','PLANIFIEE',1,1,3),
(36,'WOD Intensif','2026-10-22 07:00:00','2026-10-22 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(37,'Pilates Core','2026-10-23 12:15:00','2026-10-23 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(38,'Yin Yoga','2026-10-23 19:45:00','2026-10-23 20:45:00',12,13.00,'DEBUTANT','PLANIFIEE',4,2,1),
(39,'Cardio-boxe','2026-10-24 10:30:00','2026-10-24 11:30:00',16,14.00,'INTERMEDIAIRE','PLANIFIEE',5,4,5),
(40,'Haltérophilie technique','2026-10-24 10:00:00','2026-10-24 11:30:00',8,20.00,'INTERMEDIAIRE','PLANIFIEE',2,3,6),
(41,'Yoga prénatal','2026-10-25 10:30:00','2026-10-25 11:30:00',8,17.00,'DEBUTANT','PLANIFIEE',4,2,1),
(42,'Vinyasa Flow','2026-10-26 18:30:00','2026-10-26 19:30:00',15,15.00,'TOUS','PLANIFIEE',1,1,1),
(43,'Pilates Core','2026-10-26 12:15:00','2026-10-26 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(44,'Boxe débutant','2026-10-26 19:00:00','2026-10-26 20:00:00',12,12.00,'DEBUTANT','PLANIFIEE',5,4,5),
(45,'WOD Intensif','2026-10-26 07:00:00','2026-10-26 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(46,'Réveil yoga','2026-10-27 07:30:00','2026-10-27 08:30:00',15,12.00,'DEBUTANT','PLANIFIEE',1,1,1),
(47,'Yin Yoga','2026-10-27 19:45:00','2026-10-27 20:45:00',12,13.00,'DEBUTANT','PLANIFIEE',4,2,1),
(48,'WOD Intensif','2026-10-27 07:00:00','2026-10-27 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(49,'Vinyasa Flow','2026-10-28 18:30:00','2026-10-28 19:30:00',15,15.00,'TOUS','PLANIFIEE',1,1,1),
(50,'Pilates Core','2026-10-28 12:15:00','2026-10-28 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(51,'Boxe débutant','2026-10-28 19:00:00','2026-10-28 20:00:00',12,12.00,'DEBUTANT','PLANIFIEE',5,4,5),
(52,'Méditation guidée','2026-10-29 20:00:00','2026-10-29 20:45:00',20,10.00,'TOUS','PLANIFIEE',1,1,3),
(53,'WOD Intensif','2026-10-29 07:00:00','2026-10-29 08:00:00',14,18.00,'AVANCE','PLANIFIEE',2,3,4),
(54,'Pilates Core','2026-10-30 12:15:00','2026-10-30 13:00:00',10,16.00,'INTERMEDIAIRE','PLANIFIEE',3,5,2),
(55,'Yin Yoga','2026-10-30 19:45:00','2026-10-30 20:45:00',12,13.00,'DEBUTANT','PLANIFIEE',4,2,1),
(56,'Cardio-boxe','2026-10-31 10:30:00','2026-10-31 11:30:00',16,14.00,'INTERMEDIAIRE','PLANIFIEE',5,4,5),
(57,'Haltérophilie technique','2026-10-31 10:00:00','2026-10-31 11:30:00',8,20.00,'INTERMEDIAIRE','PLANIFIEE',2,3,6),
(58,'Yoga prénatal','2026-11-01 10:30:00','2026-11-01 11:30:00',8,17.00,'DEBUTANT','PLANIFIEE',4,2,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utilisateurs`
--

LOCK TABLES `utilisateurs` WRITE;
/*!40000 ALTER TABLE `utilisateurs` DISABLE KEYS */;
INSERT INTO `utilisateurs` VALUES
(1,'admin@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Admin','FitBook',NULL,'ADMIN',1,NULL,'2026-10-18 23:45:44'),
(2,'mamadou.barry@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Barry','Mamadou','0470 12 34 56','GESTIONNAIRE',1,NULL,'2026-10-18 23:45:45'),
(3,'claire.dubois@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Dubois','Claire','0471 22 33 44','GESTIONNAIRE',1,NULL,'2026-10-18 23:45:45'),
(4,'yasmina.benali@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Benali','Yasmina',NULL,'COACH',1,NULL,'2026-10-18 23:45:45'),
(5,'ngozi.okafor@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Okafor','Ngozi',NULL,'COACH',1,NULL,'2026-10-18 23:45:45'),
(6,'lucas.janssens@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Janssens','Lucas',NULL,'COACH',1,NULL,'2026-10-18 23:45:45'),
(7,'karim.elamrani@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','El Amrani','Karim',NULL,'COACH',1,NULL,'2026-10-18 23:45:45'),
(8,'sofie.peeters@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Peeters','Sofie',NULL,'COACH',1,NULL,'2026-10-18 23:45:45'),
(9,'aissatou.bah@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Bah','Aïssatou',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(10,'cheikh.fall@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Fall','Cheikh',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(11,'elise.petit@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Petit','Élise',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(12,'kofi.mensah@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Mensah','Kofi',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(13,'ines.martin@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Martin','Inès',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(14,'tom.vermeulen@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Vermeulen','Tom',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(15,'nouveau@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Nouveau','Compte',NULL,'SPORTIF',0,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','2026-10-18 23:45:45'),
(16,'sportif29.6@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°29-6',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(17,'sportif29.7@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°29-7',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(18,'sportif29.8@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°29-8',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(19,'sportif29.9@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°29-9',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(20,'sportif29.10@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°29-10',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(21,'sportif29.11@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°29-11',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(22,'sportif37.6@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°37-6',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(23,'sportif37.7@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°37-7',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(24,'sportif37.8@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°37-8',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(25,'sportif37.9@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°37-9',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(26,'sportif37.10@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°37-10',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(27,'sportif37.11@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°37-11',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(28,'sportif46.6@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°46-6',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(29,'sportif46.7@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°46-7',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(30,'sportif46.8@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°46-8',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(31,'sportif46.9@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°46-9',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(32,'sportif46.10@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°46-10',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(33,'sportif46.11@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°46-11',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(34,'sportif54.6@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°54-6',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(35,'sportif54.7@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°54-7',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(36,'sportif54.8@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°54-8',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(37,'sportif54.9@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°54-9',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(38,'sportif54.10@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°54-10',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45'),
(39,'sportif54.11@fitbook.be','$2y$13$OaWH3LT4XaITQGaZ68iq3.Ecz5Vm1axx5/fw5Gg5wttgwhbhQ83um','Sportif','N°54-11',NULL,'SPORTIF',1,NULL,'2026-10-18 23:45:45');
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

-- Dump completed on 2026-10-18 23:45:47
