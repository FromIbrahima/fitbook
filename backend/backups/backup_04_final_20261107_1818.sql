-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : sam. 07 nov. 2026 à 18:18
-- Version du serveur : 9.1.0
-- Version de PHP : 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `fitbook`
--

DELIMITER $$
--
-- Procédures
--
DROP PROCEDURE IF EXISTS `getAvisSalle`$$
CREATE DEFINER=`fitbook_user`@`localhost` PROCEDURE `getAvisSalle` (IN `idSalle` INT)   BEGIN
    SELECT * FROM avis WHERE id_salle = idSalle AND statut_moderation = "VALIDE";
END$$

DROP PROCEDURE IF EXISTS `getNombreInscrits`$$
CREATE DEFINER=`fitbook_user`@`localhost` PROCEDURE `getNombreInscrits` (IN `idSeance` INT, OUT `nbInscrits` INT)   BEGIN
    SELECT COUNT(*) INTO nbInscrits FROM reservations WHERE id_seance = idSeance AND statut = "CONFIRMEE";
END$$

DROP PROCEDURE IF EXISTS `getNombreReservationsSalle`$$
CREATE DEFINER=`fitbook_user`@`localhost` PROCEDURE `getNombreReservationsSalle` (IN `idSalle` INT, OUT `nbReservations` INT)   BEGIN
    SELECT COUNT(*) INTO nbReservations FROM reservations WHERE statut = "CONFIRMEE" AND id_seance IN (SELECT id_seance FROM seances WHERE id_salle = idSalle);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `activites`
--

DROP TABLE IF EXISTS `activites`;
CREATE TABLE IF NOT EXISTS `activites` (
  `id_activite` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `categorie` varchar(50) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_activite`),
  UNIQUE KEY `UNIQ_766B5EB56C6E55B5` (`nom`)
) ENGINE=MyISAM AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `activites`
--

INSERT INTO `activites` (`id_activite`, `nom`, `categorie`, `photo`) VALUES
(71, 'Yoga', 'Bien-être', 'images/activites/yoga.jpg'),
(72, 'Pilates', 'Bien-être', 'images/activites/pilates.jpg'),
(73, 'Méditation', 'Bien-être', 'images/activites/meditation.jpg'),
(74, 'CrossFit', 'Cardio & force', 'images/activites/crossfit.jpg'),
(75, 'Boxe', 'Sports de combat', 'images/activites/boxe.jpg'),
(76, 'Musculation', 'Cardio & force', 'images/activites/musculation.jpg'),
(77, 'Running', 'Cardio & force', 'images/activites/running.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

DROP TABLE IF EXISTS `avis`;
CREATE TABLE IF NOT EXISTS `avis` (
  `id_avis` int NOT NULL AUTO_INCREMENT,
  `note` int NOT NULL,
  `commentaire` longtext,
  `date_avis` datetime NOT NULL,
  `statut_moderation` varchar(20) NOT NULL,
  `id_utilisateur` int NOT NULL,
  `id_salle` int DEFAULT NULL,
  `id_coach` int DEFAULT NULL,
  PRIMARY KEY (`id_avis`),
  KEY `IDX_8F91ABF050EAE44` (`id_utilisateur`),
  KEY `IDX_8F91ABF0A0123F6C` (`id_salle`),
  KEY `IDX_8F91ABF0D1DC2CFC` (`id_coach`)
) ;

--
-- Déchargement des données de la table `avis`
--

INSERT INTO `avis` (`id_avis`, `note`, `commentaire`, `date_avis`, `statut_moderation`, `id_utilisateur`, `id_salle`, `id_coach`) VALUES
(124, 5, 'Super ambiance, la coach Yasmina est top. Je recommande !', '2026-11-06 23:20:50', 'VALIDE', 424, 53, NULL),
(125, 5, 'Studio très propre et calme. Réservation simple et rapide.', '2026-11-06 23:20:50', 'VALIDE', 425, 53, NULL),
(126, 4, 'Bons cours mais vestiaires un peu petits aux heures de pointe.', '2026-11-06 23:20:50', 'VALIDE', 426, 53, NULL),
(127, 5, 'Box très bien équipée, coachs motivants.', '2026-11-06 23:20:50', 'VALIDE', 423, 55, NULL),
(128, 4, 'Ambiance familiale, parfait pour débuter la boxe.', '2026-11-06 23:20:50', 'VALIDE', 427, 56, NULL),
(129, 5, 'Le sauna après le pilates, un vrai bonheur.', '2026-11-06 23:20:50', 'VALIDE', 428, 57, NULL),
(130, 5, 'Pédagogue et bienveillante, cours très fluides.', '2026-11-06 23:20:50', 'VALIDE', 424, NULL, 61),
(131, 5, 'Exercices précis, on sent les progrès rapidement.', '2026-11-06 23:20:50', 'VALIDE', 425, NULL, 64),
(132, 4, 'Exigeant mais toujours à l\'écoute.', '2026-11-06 23:20:50', 'VALIDE', 426, NULL, 65),
(133, 5, 'Programmation au top, je progresse chaque semaine.', '2026-11-06 23:20:50', 'VALIDE', 423, NULL, 63),
(134, 3, 'Joli lieu mais un peu bruyant côté rue ce jour-là.', '2026-11-06 23:20:50', 'EN_ATTENTE', 428, 54, NULL),
(135, 2, 'Cours commencé avec 15 minutes de retard.', '2026-11-06 23:20:50', 'EN_ATTENTE', 427, NULL, 62);

-- --------------------------------------------------------

--
-- Structure de la table `coachs`
--

DROP TABLE IF EXISTS `coachs`;
CREATE TABLE IF NOT EXISTS `coachs` (
  `id_coach` int NOT NULL AUTO_INCREMENT,
  `specialite` varchar(100) NOT NULL,
  `biographie` longtext,
  `tarif_horaire` decimal(6,2) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `id_utilisateur` int NOT NULL,
  PRIMARY KEY (`id_coach`),
  UNIQUE KEY `UNIQ_89E318FD50EAE44` (`id_utilisateur`)
) ;

--
-- Déchargement des données de la table `coachs`
--

INSERT INTO `coachs` (`id_coach`, `specialite`, `biographie`, `tarif_horaire`, `ville`, `id_utilisateur`) VALUES
(61, 'Yoga · Méditation', 'Professeure de yoga certifiée RYT-500, 10 ans d\'expérience. Vinyasa, Hatha et méditation guidée.', 45.00, 'Ixelles', 418),
(62, 'Yin Yoga', 'Yin yoga et mobilité, idéal pour récupérer après le sport.', 35.00, 'Etterbeek', 420),
(63, 'CrossFit · Musculation', 'Coach CrossFit L2, préparation physique et haltérophilie.', 55.00, 'Laeken', 422),
(64, 'Pilates', 'Pilates matwork et reformer, renforcement profond et posture.', 40.00, 'Uccle', 419),
(65, 'Boxe anglaise', 'Ancien boxeur amateur, cours techniques et cardio-boxe tous niveaux.', 50.00, 'Saint-Gilles', 421);

-- --------------------------------------------------------

--
-- Structure de la table `disponibilites`
--

DROP TABLE IF EXISTS `disponibilites`;
CREATE TABLE IF NOT EXISTS `disponibilites` (
  `id_disponibilite` int NOT NULL AUTO_INCREMENT,
  `jour_semaine` smallint NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `id_coach` int DEFAULT NULL,
  `id_salle` int DEFAULT NULL,
  PRIMARY KEY (`id_disponibilite`),
  KEY `IDX_B0F3489CD1DC2CFC` (`id_coach`),
  KEY `IDX_B0F3489CA0123F6C` (`id_salle`)
) ;

--
-- Déchargement des données de la table `disponibilites`
--

INSERT INTO `disponibilites` (`id_disponibilite`, `jour_semaine`, `heure_debut`, `heure_fin`, `id_coach`, `id_salle`) VALUES
(535, 1, '07:00:00', '22:00:00', NULL, 53),
(536, 2, '07:00:00', '22:00:00', NULL, 53),
(537, 3, '07:00:00', '22:00:00', NULL, 53),
(538, 4, '07:00:00', '22:00:00', NULL, 53),
(539, 5, '07:00:00', '21:00:00', NULL, 53),
(540, 6, '09:00:00', '18:00:00', NULL, 53),
(541, 7, '09:00:00', '13:00:00', NULL, 53),
(542, 1, '07:00:00', '22:00:00', NULL, 54),
(543, 2, '07:00:00', '22:00:00', NULL, 54),
(544, 3, '07:00:00', '22:00:00', NULL, 54),
(545, 4, '07:00:00', '22:00:00', NULL, 54),
(546, 5, '07:00:00', '21:00:00', NULL, 54),
(547, 6, '09:00:00', '18:00:00', NULL, 54),
(548, 7, '09:00:00', '13:00:00', NULL, 54),
(549, 1, '07:00:00', '22:00:00', NULL, 55),
(550, 2, '07:00:00', '22:00:00', NULL, 55),
(551, 3, '07:00:00', '22:00:00', NULL, 55),
(552, 4, '07:00:00', '22:00:00', NULL, 55),
(553, 5, '07:00:00', '21:00:00', NULL, 55),
(554, 6, '09:00:00', '18:00:00', NULL, 55),
(555, 7, '09:00:00', '13:00:00', NULL, 55),
(556, 1, '07:00:00', '22:00:00', NULL, 56),
(557, 2, '07:00:00', '22:00:00', NULL, 56),
(558, 3, '07:00:00', '22:00:00', NULL, 56),
(559, 4, '07:00:00', '22:00:00', NULL, 56),
(560, 5, '07:00:00', '21:00:00', NULL, 56),
(561, 6, '09:00:00', '18:00:00', NULL, 56),
(562, 7, '09:00:00', '13:00:00', NULL, 56),
(563, 1, '07:00:00', '22:00:00', NULL, 57),
(564, 2, '07:00:00', '22:00:00', NULL, 57),
(565, 3, '07:00:00', '22:00:00', NULL, 57),
(566, 4, '07:00:00', '22:00:00', NULL, 57),
(567, 5, '07:00:00', '21:00:00', NULL, 57),
(568, 6, '09:00:00', '18:00:00', NULL, 57),
(569, 7, '09:00:00', '13:00:00', NULL, 57),
(570, 1, '17:00:00', '21:00:00', 61, NULL),
(571, 2, '07:00:00', '10:00:00', 61, NULL),
(572, 3, '17:00:00', '21:00:00', 61, NULL),
(573, 4, '18:00:00', '21:00:00', 61, NULL),
(574, 6, '09:00:00', '12:00:00', 61, NULL),
(575, 1, '12:00:00', '14:00:00', 64, NULL),
(576, 3, '12:00:00', '14:00:00', 64, NULL),
(577, 5, '12:00:00', '14:00:00', 64, NULL),
(578, 2, '19:00:00', '21:30:00', 62, NULL),
(579, 5, '19:00:00', '21:30:00', 62, NULL),
(580, 7, '10:00:00', '12:00:00', 62, NULL),
(581, 1, '18:00:00', '22:00:00', 65, NULL),
(582, 3, '18:00:00', '22:00:00', 65, NULL),
(583, 6, '10:00:00', '13:00:00', 65, NULL),
(584, 1, '07:00:00', '09:00:00', 63, NULL),
(585, 2, '07:00:00', '09:00:00', 63, NULL),
(586, 4, '07:00:00', '09:00:00', 63, NULL),
(587, 6, '09:00:00', '12:00:00', 63, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

DROP TABLE IF EXISTS `doctrine_migration_versions`;
CREATE TABLE IF NOT EXISTS `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL,
  PRIMARY KEY (`version`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20261010000001', '2026-10-19 10:36:41', 2162),
('DoctrineMigrations\\Version20261010000002', '2026-10-19 10:36:43', 1238),
('DoctrineMigrations\\Version20261103000001', '2026-11-03 22:54:54', 276),
('DoctrineMigrations\\Version20261104000001', '2026-11-04 14:31:27', 228),
('DoctrineMigrations\\Version20261104000002', '2026-11-04 14:31:28', 826);

-- --------------------------------------------------------

--
-- Structure de la table `favoris`
--

DROP TABLE IF EXISTS `favoris`;
CREATE TABLE IF NOT EXISTS `favoris` (
  `date_ajout` datetime NOT NULL,
  `id_utilisateur` int NOT NULL,
  `id_salle` int NOT NULL,
  PRIMARY KEY (`id_utilisateur`,`id_salle`),
  KEY `IDX_8933C43250EAE44` (`id_utilisateur`),
  KEY `IDX_8933C432A0123F6C` (`id_salle`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `favoris`
--

INSERT INTO `favoris` (`date_ajout`, `id_utilisateur`, `id_salle`) VALUES
('2026-11-06 23:20:50', 423, 53),
('2026-11-06 23:20:50', 423, 55),
('2026-11-06 23:20:50', 424, 56);

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id_reservation` int NOT NULL AUTO_INCREMENT,
  `date_reservation` datetime NOT NULL,
  `statut` varchar(20) NOT NULL,
  `code_confirmation` varchar(32) NOT NULL,
  `id_utilisateur` int NOT NULL,
  `id_seance` int NOT NULL,
  PRIMARY KEY (`id_reservation`),
  UNIQUE KEY `UNIQ_4DA2398315E059` (`code_confirmation`),
  UNIQUE KEY `uq_reservation_utilisateur_seance` (`id_utilisateur`,`id_seance`),
  KEY `IDX_4DA23950EAE44` (`id_utilisateur`),
  KEY `IDX_4DA239F94A48E3` (`id_seance`)
) ;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id_reservation`, `date_reservation`, `statut`, `code_confirmation`, `id_utilisateur`, `id_seance`) VALUES
(1651, '2026-11-06 23:20:50', 'CONFIRMEE', '315305D39B4A', 423, 621),
(1652, '2026-11-06 23:20:50', 'CONFIRMEE', 'F41402F0C728', 423, 622),
(1653, '2026-11-06 23:20:50', 'CONFIRMEE', '3523E040DC34', 424, 622),
(1654, '2026-11-06 23:20:50', 'CONFIRMEE', 'F8398C13CC8E', 423, 623),
(1655, '2026-11-06 23:20:50', 'CONFIRMEE', '25484FE119E5', 424, 623),
(1656, '2026-11-06 23:20:50', 'CONFIRMEE', '8A7596C5C4EE', 425, 623),
(1657, '2026-11-06 23:20:50', 'CONFIRMEE', 'F8A190767357', 423, 624),
(1658, '2026-11-06 23:20:50', 'CONFIRMEE', '36E967391130', 424, 624),
(1659, '2026-11-06 23:20:50', 'CONFIRMEE', 'CD1698B50116', 425, 624),
(1660, '2026-11-06 23:20:50', 'CONFIRMEE', '78A24DC6D722', 426, 624),
(1661, '2026-11-06 23:20:50', 'CONFIRMEE', '8E3311E68D0C', 423, 626),
(1662, '2026-11-06 23:20:50', 'CONFIRMEE', '24488A013A61', 423, 627),
(1663, '2026-11-06 23:20:50', 'CONFIRMEE', 'E46C4D6F0A1E', 424, 627),
(1664, '2026-11-06 23:20:50', 'CONFIRMEE', 'D6C037B6BA81', 423, 628),
(1665, '2026-11-06 23:20:50', 'CONFIRMEE', '62D852EA50C4', 424, 628),
(1666, '2026-11-06 23:20:50', 'CONFIRMEE', 'B7D07CABC925', 425, 628),
(1667, '2026-11-06 23:20:50', 'CONFIRMEE', '436B5EEB419B', 423, 629),
(1668, '2026-11-06 23:20:50', 'CONFIRMEE', '860E5214879D', 424, 629),
(1669, '2026-11-06 23:20:50', 'CONFIRMEE', 'D0CB36D8FBFF', 425, 629),
(1670, '2026-11-06 23:20:50', 'CONFIRMEE', '15C528C15D1E', 426, 629),
(1671, '2026-11-06 23:20:50', 'CONFIRMEE', 'BE1F675D43BB', 423, 631),
(1672, '2026-11-06 23:20:50', 'CONFIRMEE', '3184B7EC95D6', 423, 632),
(1673, '2026-11-06 23:20:50', 'CONFIRMEE', '6A08069F1CAE', 424, 632),
(1674, '2026-11-06 23:20:50', 'CONFIRMEE', '0CA887E8CB1B', 423, 633),
(1675, '2026-11-06 23:20:50', 'CONFIRMEE', 'F873576ECDBC', 424, 633),
(1676, '2026-11-06 23:20:50', 'CONFIRMEE', 'BF50F6D1F63A', 425, 633),
(1677, '2026-11-06 23:20:50', 'CONFIRMEE', '28CCE30C1608', 423, 634),
(1678, '2026-11-06 23:20:50', 'CONFIRMEE', '4A15CA1F45CD', 424, 634),
(1679, '2026-11-06 23:20:50', 'CONFIRMEE', '7F8C8E500543', 425, 634),
(1680, '2026-11-06 23:20:50', 'CONFIRMEE', '3A883CC3F2CA', 426, 634),
(1681, '2026-11-06 23:20:50', 'CONFIRMEE', '555975D519C1', 423, 636),
(1682, '2026-11-06 23:20:50', 'CONFIRMEE', 'D0FBD9EDA1C6', 423, 637),
(1683, '2026-11-06 23:20:50', 'CONFIRMEE', 'E528FAE77B4D', 424, 637),
(1684, '2026-11-06 23:20:50', 'CONFIRMEE', 'A4DF283B42EA', 423, 638),
(1685, '2026-11-06 23:20:50', 'CONFIRMEE', 'F5459916B8FB', 424, 638),
(1686, '2026-11-06 23:20:50', 'CONFIRMEE', '2E1DBA4BBED2', 425, 638),
(1687, '2026-11-06 23:20:50', 'CONFIRMEE', 'D324415773D5', 423, 639),
(1688, '2026-11-06 23:20:50', 'CONFIRMEE', '7A8B8232DF2F', 424, 639),
(1689, '2026-11-06 23:20:50', 'CONFIRMEE', '61B483B877B1', 425, 639),
(1690, '2026-11-06 23:20:50', 'CONFIRMEE', '626B5AEF3E45', 426, 639),
(1691, '2026-11-06 23:20:50', 'CONFIRMEE', 'B3FEEA8C3271', 423, 641),
(1692, '2026-11-06 23:20:50', 'CONFIRMEE', '5DABB2AEF4F6', 423, 642),
(1693, '2026-11-06 23:20:50', 'CONFIRMEE', 'D837E2554794', 424, 642),
(1694, '2026-11-06 23:20:50', 'CONFIRMEE', 'AE607D387B70', 423, 643),
(1695, '2026-11-06 23:20:50', 'CONFIRMEE', '6CBD2B9F7F6C', 424, 643),
(1696, '2026-11-06 23:20:50', 'CONFIRMEE', 'A0DAA2DFA1B5', 425, 643),
(1697, '2026-11-06 23:20:50', 'CONFIRMEE', 'CD20F98CFAA0', 423, 644),
(1698, '2026-11-06 23:20:50', 'CONFIRMEE', '273C5ABE06F1', 424, 644),
(1699, '2026-11-06 23:20:50', 'CONFIRMEE', '8F75C335491E', 425, 644),
(1700, '2026-11-06 23:20:50', 'CONFIRMEE', 'C2932C4CB654', 426, 644),
(1701, '2026-11-06 23:20:50', 'CONFIRMEE', '746687F7EEAF', 423, 646),
(1702, '2026-11-06 23:20:50', 'CONFIRMEE', '7995B4038C8E', 423, 647),
(1703, '2026-11-06 23:20:50', 'CONFIRMEE', '437964C36AC1', 424, 647),
(1704, '2026-11-06 23:20:50', 'CONFIRMEE', 'CF205A995969', 423, 648),
(1705, '2026-11-06 23:20:50', 'CONFIRMEE', '1418091C41E6', 424, 648),
(1706, '2026-11-06 23:20:50', 'CONFIRMEE', 'A78650DE7D47', 425, 648),
(1707, '2026-11-06 23:20:50', 'CONFIRMEE', 'D7F9D037BE1B', 423, 649),
(1708, '2026-11-06 23:20:50', 'CONFIRMEE', 'B1618606C5B4', 424, 649),
(1709, '2026-11-06 23:20:50', 'CONFIRMEE', 'A10AB8FB0A9C', 425, 649),
(1710, '2026-11-06 23:20:50', 'CONFIRMEE', 'FB06B1AF8916', 426, 649),
(1711, '2026-11-06 23:20:50', 'CONFIRMEE', '1F13B0095F80', 423, 651),
(1712, '2026-11-06 23:20:50', 'CONFIRMEE', '85BC6DC1642B', 423, 652),
(1713, '2026-11-06 23:20:50', 'CONFIRMEE', '471247B7898C', 424, 652),
(1714, '2026-11-06 23:20:50', 'CONFIRMEE', '81EDC4CDCA36', 423, 653),
(1715, '2026-11-06 23:20:50', 'CONFIRMEE', '8005F8869AEE', 424, 653),
(1716, '2026-11-06 23:20:50', 'CONFIRMEE', 'BA12FFA96ED2', 425, 653),
(1717, '2026-11-06 23:20:50', 'CONFIRMEE', '9F7817158751', 423, 654),
(1718, '2026-11-06 23:20:50', 'CONFIRMEE', '7178F8505734', 424, 654),
(1719, '2026-11-06 23:20:50', 'CONFIRMEE', 'D8B0CD62C4C5', 425, 654),
(1720, '2026-11-06 23:20:50', 'CONFIRMEE', '40C7D28CA04B', 426, 654),
(1721, '2026-11-06 23:20:50', 'CONFIRMEE', '4B2ED7779734', 423, 655),
(1722, '2026-11-06 23:20:50', 'CONFIRMEE', '4CA71451EC25', 424, 655),
(1723, '2026-11-06 23:20:50', 'CONFIRMEE', '8B7BAF5825A9', 425, 655),
(1724, '2026-11-06 23:20:50', 'CONFIRMEE', 'F1AE57899F55', 426, 655),
(1725, '2026-11-06 23:20:50', 'CONFIRMEE', '37A32812F067', 427, 655),
(1726, '2026-11-06 23:20:50', 'CONFIRMEE', 'EC8C9387A770', 428, 655),
(1727, '2026-11-06 23:20:50', 'CONFIRMEE', 'BF7C4CFC50BE', 430, 655),
(1728, '2026-11-06 23:20:50', 'CONFIRMEE', '42B4BFAE7A19', 431, 655),
(1729, '2026-11-06 23:20:50', 'CONFIRMEE', 'EFCEC822C5CD', 432, 655),
(1730, '2026-11-06 23:20:50', 'CONFIRMEE', 'F16A8C2C2BE8', 433, 655),
(1731, '2026-11-06 23:20:50', 'CONFIRMEE', '9894648A415B', 434, 655),
(1732, '2026-11-06 23:20:50', 'CONFIRMEE', 'FCF9BFF29E7D', 435, 655),
(1733, '2026-11-06 23:20:50', 'CONFIRMEE', '3176CB6F5013', 423, 656),
(1734, '2026-11-06 23:20:50', 'CONFIRMEE', 'CC46B646EBF4', 423, 657),
(1735, '2026-11-06 23:20:50', 'CONFIRMEE', '2263B5D60F3E', 424, 657),
(1736, '2026-11-06 23:20:50', 'CONFIRMEE', '142D8E3D10D1', 423, 658),
(1737, '2026-11-06 23:20:50', 'CONFIRMEE', 'A28F3BC0CDC7', 424, 658),
(1738, '2026-11-06 23:20:50', 'CONFIRMEE', '7CAB75649C4E', 425, 658),
(1739, '2026-11-06 23:20:50', 'CONFIRMEE', 'B70C7AFF064F', 423, 659),
(1740, '2026-11-06 23:20:50', 'CONFIRMEE', 'E5772B064654', 424, 659),
(1741, '2026-11-06 23:20:50', 'CONFIRMEE', 'EEE516F4C734', 425, 659),
(1742, '2026-11-06 23:20:50', 'CONFIRMEE', '1DD3F760C513', 426, 659),
(1743, '2026-11-06 23:20:50', 'CONFIRMEE', '071D9A9DAC43', 423, 661),
(1744, '2026-11-06 23:20:50', 'CONFIRMEE', 'EA39548EA10D', 423, 662),
(1745, '2026-11-06 23:20:50', 'CONFIRMEE', '70128D46621B', 424, 662),
(1746, '2026-11-06 23:20:50', 'CONFIRMEE', 'C11100EC2949', 423, 663),
(1747, '2026-11-06 23:20:50', 'CONFIRMEE', '0E3A543B43BC', 424, 663),
(1748, '2026-11-06 23:20:50', 'CONFIRMEE', '3E0CD58D5E23', 425, 663),
(1749, '2026-11-06 23:20:50', 'CONFIRMEE', '443A5F0A50CA', 426, 663),
(1750, '2026-11-06 23:20:50', 'CONFIRMEE', 'A89D65881F43', 427, 663),
(1751, '2026-11-06 23:20:50', 'CONFIRMEE', '6685B6BA1051', 428, 663),
(1752, '2026-11-06 23:20:50', 'CONFIRMEE', 'CDE67B0156C4', 436, 663),
(1753, '2026-11-06 23:20:50', 'CONFIRMEE', '30F44B77C8D8', 437, 663),
(1754, '2026-11-06 23:20:50', 'CONFIRMEE', '08F2E48F394E', 438, 663),
(1755, '2026-11-06 23:20:50', 'CONFIRMEE', 'A5C1D4B3A7AE', 439, 663),
(1756, '2026-11-06 23:20:50', 'CONFIRMEE', '08F05F1609B4', 440, 663),
(1757, '2026-11-06 23:20:50', 'CONFIRMEE', '355E98BBCD8D', 441, 663),
(1758, '2026-11-06 23:20:50', 'CONFIRMEE', '5F3C80DE7F37', 423, 664),
(1759, '2026-11-06 23:20:50', 'CONFIRMEE', 'B13D9B2A79E0', 424, 664),
(1760, '2026-11-06 23:20:50', 'CONFIRMEE', 'F12F8A72DDA8', 425, 664),
(1761, '2026-11-06 23:20:50', 'CONFIRMEE', '679645099E9D', 426, 664),
(1762, '2026-11-06 23:20:50', 'CONFIRMEE', '1AF20D563668', 423, 666),
(1763, '2026-11-06 23:20:50', 'CONFIRMEE', '2C2073ECD49D', 423, 667),
(1764, '2026-11-06 23:20:50', 'CONFIRMEE', '7124C984988B', 424, 667),
(1765, '2026-11-06 23:20:50', 'CONFIRMEE', '558793B990C5', 423, 668),
(1766, '2026-11-06 23:20:50', 'CONFIRMEE', 'EA31CF831708', 424, 668),
(1767, '2026-11-06 23:20:50', 'CONFIRMEE', '8FE7973B5445', 425, 668),
(1768, '2026-11-06 23:20:50', 'CONFIRMEE', '9BE7C1086B3B', 423, 669),
(1769, '2026-11-06 23:20:50', 'CONFIRMEE', '783EDD1448A9', 424, 669),
(1770, '2026-11-06 23:20:50', 'CONFIRMEE', '376C4409F9BF', 425, 669),
(1771, '2026-11-06 23:20:50', 'CONFIRMEE', '82086954DD7D', 426, 669),
(1772, '2026-11-06 23:20:50', 'CONFIRMEE', '327C19F7ED74', 423, 671),
(1773, '2026-11-06 23:20:50', 'CONFIRMEE', '27BCD4305ED1', 423, 672),
(1774, '2026-11-06 23:20:50', 'CONFIRMEE', '654B63C852E2', 424, 672),
(1775, '2026-11-06 23:20:50', 'CONFIRMEE', '6F792F6CDB6D', 425, 672),
(1776, '2026-11-06 23:20:50', 'CONFIRMEE', '8CED9779F1AA', 426, 672),
(1777, '2026-11-06 23:20:50', 'CONFIRMEE', 'C3D02D99A844', 427, 672),
(1778, '2026-11-06 23:20:50', 'CONFIRMEE', 'ED9100566A49', 428, 672),
(1779, '2026-11-06 23:20:50', 'CONFIRMEE', 'CF57E8197CE9', 442, 672),
(1780, '2026-11-06 23:20:50', 'CONFIRMEE', '5E770230A6D1', 443, 672),
(1781, '2026-11-06 23:20:50', 'CONFIRMEE', '83B20C94F460', 444, 672),
(1782, '2026-11-06 23:20:50', 'CONFIRMEE', '49EAE6242035', 445, 672),
(1783, '2026-11-06 23:20:50', 'CONFIRMEE', 'E4ED8FE2A431', 446, 672),
(1784, '2026-11-06 23:20:50', 'CONFIRMEE', 'E48E70B9896D', 447, 672),
(1785, '2026-11-06 23:20:50', 'CONFIRMEE', 'A22A94DF7512', 423, 673),
(1786, '2026-11-06 23:20:50', 'CONFIRMEE', '9825D95DBC15', 424, 673),
(1787, '2026-11-06 23:20:50', 'CONFIRMEE', '8FF87C4CBF96', 425, 673),
(1788, '2026-11-06 23:20:50', 'CONFIRMEE', 'A2696CC5C132', 423, 674),
(1789, '2026-11-06 23:20:50', 'CONFIRMEE', '708E47F647C4', 424, 674),
(1790, '2026-11-06 23:20:50', 'CONFIRMEE', 'F9C2BF5D6151', 425, 674),
(1791, '2026-11-06 23:20:50', 'CONFIRMEE', '5409782BBE9B', 426, 674),
(1792, '2026-11-06 23:20:50', 'CONFIRMEE', '27B28C92AAD4', 423, 676),
(1793, '2026-11-06 23:20:50', 'CONFIRMEE', '0E21D99CCD08', 423, 677),
(1794, '2026-11-06 23:20:50', 'CONFIRMEE', 'CAC77FCB9232', 424, 677),
(1795, '2026-11-06 23:20:50', 'CONFIRMEE', '0EA17BDC427A', 423, 678),
(1796, '2026-11-06 23:20:50', 'CONFIRMEE', '8A8D9D06A2DB', 424, 678),
(1797, '2026-11-06 23:20:50', 'CONFIRMEE', '731575E56649', 425, 678),
(1798, '2026-11-06 23:20:50', 'CONFIRMEE', 'C99DD529A9BA', 423, 679),
(1799, '2026-11-06 23:20:50', 'CONFIRMEE', 'CBCBB953D949', 424, 679),
(1800, '2026-11-06 23:20:50', 'CONFIRMEE', '86FC3B3EC506', 425, 679),
(1801, '2026-11-06 23:20:50', 'CONFIRMEE', 'C1FBC46AF06A', 426, 679),
(1802, '2026-11-06 23:20:50', 'CONFIRMEE', '12EE9A387AD2', 423, 680),
(1803, '2026-11-06 23:20:50', 'CONFIRMEE', '7D9DC9A787F5', 424, 680),
(1804, '2026-11-06 23:20:50', 'CONFIRMEE', 'A3C5553C0E60', 425, 680),
(1805, '2026-11-06 23:20:50', 'CONFIRMEE', '9669659E0E58', 426, 680),
(1806, '2026-11-06 23:20:50', 'CONFIRMEE', '43CD7E2D003B', 427, 680),
(1807, '2026-11-06 23:20:50', 'CONFIRMEE', 'A0C7DE972554', 428, 680),
(1808, '2026-11-06 23:20:50', 'CONFIRMEE', 'D8A88CF8447B', 448, 680),
(1809, '2026-11-06 23:20:50', 'CONFIRMEE', '7882671801C7', 449, 680),
(1810, '2026-11-06 23:20:50', 'CONFIRMEE', 'B8614C53CE3B', 450, 680),
(1811, '2026-11-06 23:20:50', 'CONFIRMEE', '13978A2A2302', 451, 680),
(1812, '2026-11-06 23:20:50', 'CONFIRMEE', 'F7D62404354E', 452, 680),
(1813, '2026-11-06 23:20:50', 'CONFIRMEE', 'B8A9EB10F183', 453, 680);

-- --------------------------------------------------------

--
-- Structure de la table `salles`
--

DROP TABLE IF EXISTS `salles`;
CREATE TABLE IF NOT EXISTS `salles` (
  `id_salle` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `adresse` varchar(255) NOT NULL,
  `code_postal` varchar(10) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `description` longtext,
  `equipements` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `id_utilisateur` int NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_salle`),
  KEY `IDX_799D45AA50EAE44` (`id_utilisateur`)
) ENGINE=MyISAM AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `salles`
--

INSERT INTO `salles` (`id_salle`, `nom`, `adresse`, `code_postal`, `ville`, `telephone`, `description`, `equipements`, `latitude`, `longitude`, `id_utilisateur`, `photo`) VALUES
(53, 'Zen Studio', 'Rue du Bailli 42', '1050', 'Ixelles', '02 345 67 89', 'Un studio lumineux de 400 m² dédié au yoga, au pilates et à la méditation. Cours pour tous les niveaux, encadrés par des coachs certifiés.', 'Vestiaires,Douches,Tapis fournis,Wi-Fi,Parking vélo', 50.8270000, 4.3640000, 416, 'images/salles/zen-studio.jpg'),
(54, 'Lotus Loft', 'Avenue d\'Auderghem 120', '1040', 'Etterbeek', '02 640 11 22', 'Loft cosy pour le yoga doux, le yin et le yoga prénatal.', 'Vestiaires,Tisanerie,Tapis fournis', 50.8335000, 4.3890000, 416, 'images/salles/lotus-loft.jpg'),
(55, 'Box Atomium', 'Boulevard du Centenaire 8', '1020', 'Laeken', '02 478 90 12', 'Box de CrossFit de 600 m² avec zone haltérophilie et rameurs.', 'Vestiaires,Douches,Casiers,Parking', 50.8950000, 4.3410000, 417, 'images/salles/box-atomium.jpg'),
(56, 'Ring Club', 'Chaussée de Waterloo 210', '1060', 'Saint-Gilles', '02 537 45 66', 'Club de boxe historique : ring, sacs, cardio-boxe et préparation physique.', 'Vestiaires,Douches,Gants prêtés', 50.8260000, 4.3450000, 417, 'images/salles/ring-club.jpg'),
(57, 'Move Center', 'Rue Vanderkindere 300', '1180', 'Uccle', '02 344 55 77', 'Centre de remise en forme : pilates, musculation et running club.', 'Vestiaires,Douches,Wi-Fi,Parking,Sauna', 50.8100000, 4.3560000, 417, 'images/salles/move-center.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `seances`
--

DROP TABLE IF EXISTS `seances`;
CREATE TABLE IF NOT EXISTS `seances` (
  `id_seance` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(120) NOT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `capacite_max` int NOT NULL,
  `prix` decimal(6,2) NOT NULL,
  `niveau` varchar(20) NOT NULL,
  `statut` varchar(20) NOT NULL,
  `id_coach` int NOT NULL,
  `id_salle` int NOT NULL,
  `id_activite` int NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_seance`),
  KEY `idx_seance_date` (`date_debut`),
  KEY `IDX_FC699FF1D1DC2CFC` (`id_coach`),
  KEY `IDX_FC699FF1A0123F6C` (`id_salle`),
  KEY `IDX_FC699FF1E8AEB980` (`id_activite`)
) ;

--
-- Déchargement des données de la table `seances`
--

INSERT INTO `seances` (`id_seance`, `titre`, `date_debut`, `date_fin`, `capacite_max`, `prix`, `niveau`, `statut`, `id_coach`, `id_salle`, `id_activite`, `photo`) VALUES
(620, 'Réveil yoga', '2026-10-27 07:30:00', '2026-10-27 08:30:00', 15, 12.00, 'DEBUTANT', 'PLANIFIEE', 61, 53, 71, 'images/seances/reveil-yoga.jpg'),
(621, 'Yin Yoga', '2026-10-27 19:45:00', '2026-10-27 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(622, 'WOD Intensif', '2026-10-27 07:00:00', '2026-10-27 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(623, 'Vinyasa Flow', '2026-10-28 18:30:00', '2026-10-28 19:30:00', 15, 15.00, 'TOUS', 'PLANIFIEE', 61, 53, 71, 'images/seances/vinyasa-flow.jpg'),
(624, 'Pilates Core', '2026-10-28 12:15:00', '2026-10-28 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(625, 'Boxe débutant', '2026-10-28 19:00:00', '2026-10-28 20:00:00', 12, 12.00, 'DEBUTANT', 'PLANIFIEE', 65, 56, 75, 'images/seances/boxe-debutant.jpg'),
(626, 'Méditation guidée', '2026-10-29 20:00:00', '2026-10-29 20:45:00', 20, 10.00, 'TOUS', 'PLANIFIEE', 61, 53, 73, 'images/seances/meditation-guidee.jpg'),
(627, 'WOD Intensif', '2026-10-29 07:00:00', '2026-10-29 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(628, 'Pilates Core', '2026-10-30 12:15:00', '2026-10-30 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(629, 'Yin Yoga', '2026-10-30 19:45:00', '2026-10-30 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(630, 'Cardio-boxe', '2026-10-31 10:30:00', '2026-10-31 11:30:00', 16, 14.00, 'INTERMEDIAIRE', 'PLANIFIEE', 65, 56, 75, 'images/seances/cardio-boxe.jpg'),
(631, 'Haltérophilie technique', '2026-10-31 10:00:00', '2026-10-31 11:30:00', 8, 20.00, 'INTERMEDIAIRE', 'PLANIFIEE', 63, 55, 76, 'images/seances/halterophilie-technique.jpg'),
(632, 'Yoga prénatal', '2026-11-01 10:30:00', '2026-11-01 11:30:00', 8, 17.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yoga-prenatal.jpg'),
(633, 'Vinyasa Flow', '2026-11-02 18:30:00', '2026-11-02 19:30:00', 15, 15.00, 'TOUS', 'PLANIFIEE', 61, 53, 71, 'images/seances/vinyasa-flow.jpg'),
(634, 'Pilates Core', '2026-11-02 12:15:00', '2026-11-02 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(635, 'Boxe débutant', '2026-11-02 19:00:00', '2026-11-02 20:00:00', 12, 12.00, 'DEBUTANT', 'PLANIFIEE', 65, 56, 75, 'images/seances/boxe-debutant.jpg'),
(636, 'WOD Intensif', '2026-11-02 07:00:00', '2026-11-02 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(637, 'Réveil yoga', '2026-11-03 07:30:00', '2026-11-03 08:30:00', 15, 12.00, 'DEBUTANT', 'PLANIFIEE', 61, 53, 71, 'images/seances/reveil-yoga.jpg'),
(638, 'Yin Yoga', '2026-11-03 19:45:00', '2026-11-03 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(639, 'WOD Intensif', '2026-11-03 07:00:00', '2026-11-03 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(640, 'Vinyasa Flow', '2026-11-04 18:30:00', '2026-11-04 19:30:00', 15, 15.00, 'TOUS', 'PLANIFIEE', 61, 53, 71, 'images/seances/vinyasa-flow.jpg'),
(641, 'Pilates Core', '2026-11-04 12:15:00', '2026-11-04 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(642, 'Boxe débutant', '2026-11-04 19:00:00', '2026-11-04 20:00:00', 12, 12.00, 'DEBUTANT', 'PLANIFIEE', 65, 56, 75, 'images/seances/boxe-debutant.jpg'),
(643, 'Méditation guidée', '2026-11-05 20:00:00', '2026-11-05 20:45:00', 20, 10.00, 'TOUS', 'PLANIFIEE', 61, 53, 73, 'images/seances/meditation-guidee.jpg'),
(644, 'WOD Intensif', '2026-11-05 07:00:00', '2026-11-05 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(645, 'Pilates Core', '2026-11-06 12:15:00', '2026-11-06 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(646, 'Yin Yoga', '2026-11-06 19:45:00', '2026-11-06 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(647, 'Cardio-boxe', '2026-11-07 10:30:00', '2026-11-07 11:30:00', 16, 14.00, 'INTERMEDIAIRE', 'PLANIFIEE', 65, 56, 75, 'images/seances/cardio-boxe.jpg'),
(648, 'Haltérophilie technique', '2026-11-07 10:00:00', '2026-11-07 11:30:00', 8, 20.00, 'INTERMEDIAIRE', 'PLANIFIEE', 63, 55, 76, 'images/seances/halterophilie-technique.jpg'),
(649, 'Yoga prénatal', '2026-11-08 10:30:00', '2026-11-08 11:30:00', 8, 17.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yoga-prenatal.jpg'),
(650, 'Vinyasa Flow', '2026-11-09 18:30:00', '2026-11-09 19:30:00', 15, 15.00, 'TOUS', 'PLANIFIEE', 61, 53, 71, 'images/seances/vinyasa-flow.jpg'),
(651, 'Pilates Core', '2026-11-09 12:15:00', '2026-11-09 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(652, 'Boxe débutant', '2026-11-09 19:00:00', '2026-11-09 20:00:00', 12, 12.00, 'DEBUTANT', 'PLANIFIEE', 65, 56, 75, 'images/seances/boxe-debutant.jpg'),
(653, 'WOD Intensif', '2026-11-09 07:00:00', '2026-11-09 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(654, 'Réveil yoga', '2026-11-10 07:30:00', '2026-11-10 08:30:00', 15, 12.00, 'DEBUTANT', 'PLANIFIEE', 61, 53, 71, 'images/seances/reveil-yoga.jpg'),
(655, 'Yin Yoga', '2026-11-10 19:45:00', '2026-11-10 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(656, 'WOD Intensif', '2026-11-10 07:00:00', '2026-11-10 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(657, 'Vinyasa Flow', '2026-11-11 18:30:00', '2026-11-11 19:30:00', 15, 15.00, 'TOUS', 'PLANIFIEE', 61, 53, 71, 'images/seances/vinyasa-flow.jpg'),
(658, 'Pilates Core', '2026-11-11 12:15:00', '2026-11-11 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(659, 'Boxe débutant', '2026-11-11 19:00:00', '2026-11-11 20:00:00', 12, 12.00, 'DEBUTANT', 'PLANIFIEE', 65, 56, 75, 'images/seances/boxe-debutant.jpg'),
(660, 'Méditation guidée', '2026-11-12 20:00:00', '2026-11-12 20:45:00', 20, 10.00, 'TOUS', 'PLANIFIEE', 61, 53, 73, 'images/seances/meditation-guidee.jpg'),
(661, 'WOD Intensif', '2026-11-12 07:00:00', '2026-11-12 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(662, 'Pilates Core', '2026-11-13 12:15:00', '2026-11-13 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(663, 'Yin Yoga', '2026-11-13 19:45:00', '2026-11-13 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(664, 'Cardio-boxe', '2026-11-14 10:30:00', '2026-11-14 11:30:00', 16, 14.00, 'INTERMEDIAIRE', 'PLANIFIEE', 65, 56, 75, 'images/seances/cardio-boxe.jpg'),
(665, 'Haltérophilie technique', '2026-11-14 10:00:00', '2026-11-14 11:30:00', 8, 20.00, 'INTERMEDIAIRE', 'PLANIFIEE', 63, 55, 76, 'images/seances/halterophilie-technique.jpg'),
(666, 'Yoga prénatal', '2026-11-15 10:30:00', '2026-11-15 11:30:00', 8, 17.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yoga-prenatal.jpg'),
(667, 'Vinyasa Flow', '2026-11-16 18:30:00', '2026-11-16 19:30:00', 15, 15.00, 'TOUS', 'PLANIFIEE', 61, 53, 71, 'images/seances/vinyasa-flow.jpg'),
(668, 'Pilates Core', '2026-11-16 12:15:00', '2026-11-16 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(669, 'Boxe débutant', '2026-11-16 19:00:00', '2026-11-16 20:00:00', 12, 12.00, 'DEBUTANT', 'PLANIFIEE', 65, 56, 75, 'images/seances/boxe-debutant.jpg'),
(670, 'WOD Intensif', '2026-11-16 07:00:00', '2026-11-16 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(671, 'Réveil yoga', '2026-11-17 07:30:00', '2026-11-17 08:30:00', 15, 12.00, 'DEBUTANT', 'PLANIFIEE', 61, 53, 71, 'images/seances/reveil-yoga.jpg'),
(672, 'Yin Yoga', '2026-11-17 19:45:00', '2026-11-17 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(673, 'WOD Intensif', '2026-11-17 07:00:00', '2026-11-17 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(674, 'Vinyasa Flow', '2026-11-18 18:30:00', '2026-11-18 19:30:00', 15, 15.00, 'TOUS', 'PLANIFIEE', 61, 53, 71, 'images/seances/vinyasa-flow.jpg'),
(675, 'Pilates Core', '2026-11-18 12:15:00', '2026-11-18 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(676, 'Boxe débutant', '2026-11-18 19:00:00', '2026-11-18 20:00:00', 12, 12.00, 'DEBUTANT', 'PLANIFIEE', 65, 56, 75, 'images/seances/boxe-debutant.jpg'),
(677, 'Méditation guidée', '2026-11-19 20:00:00', '2026-11-19 20:45:00', 20, 10.00, 'TOUS', 'PLANIFIEE', 61, 53, 73, 'images/seances/meditation-guidee.jpg'),
(678, 'WOD Intensif', '2026-11-19 07:00:00', '2026-11-19 08:00:00', 14, 18.00, 'AVANCE', 'PLANIFIEE', 63, 55, 74, 'images/seances/wod-intensif.jpg'),
(679, 'Pilates Core', '2026-11-20 12:15:00', '2026-11-20 13:00:00', 10, 16.00, 'INTERMEDIAIRE', 'PLANIFIEE', 64, 57, 72, 'images/seances/pilates-core.jpg'),
(680, 'Yin Yoga', '2026-11-20 19:45:00', '2026-11-20 20:45:00', 12, 13.00, 'DEBUTANT', 'PLANIFIEE', 62, 54, 71, 'images/seances/yin-yoga.jpg'),
(681, 'gla', '2026-11-10 18:00:00', '2026-11-10 19:00:00', 1, 15.00, 'TOUS', 'PLANIFIEE', 61, 55, 75, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `email` varchar(180) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `role` varchar(20) NOT NULL,
  `est_verifie` tinyint NOT NULL,
  `token_confirmation` varchar(64) DEFAULT NULL,
  `date_inscription` datetime NOT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `UNIQ_497B315EE7927C74` (`email`)
) ;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id_utilisateur`, `email`, `mot_de_passe`, `nom`, `prenom`, `telephone`, `role`, `est_verifie`, `token_confirmation`, `date_inscription`) VALUES
(415, 'admin@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Admin', 'FitBook', NULL, 'ADMIN', 1, NULL, '2026-11-06 23:20:50'),
(416, 'mamadou.barry@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Barry', 'Mamadou', '0470 12 34 56', 'GESTIONNAIRE', 1, NULL, '2026-11-06 23:20:50'),
(417, 'claire.dubois@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Dubois', 'Claire', '0471 22 33 44', 'GESTIONNAIRE', 1, NULL, '2026-11-06 23:20:50'),
(418, 'yasmina.benali@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Benali', 'Yasmina', NULL, 'COACH', 1, NULL, '2026-11-06 23:20:50'),
(419, 'ngozi.okafor@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Okafor', 'Ngozi', NULL, 'COACH', 1, NULL, '2026-11-06 23:20:50'),
(420, 'lucas.janssens@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Janssens', 'Lucas', NULL, 'COACH', 1, NULL, '2026-11-06 23:20:50'),
(421, 'karim.elamrani@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'El Amrani', 'Karim', NULL, 'COACH', 1, NULL, '2026-11-06 23:20:50'),
(422, 'sofie.peeters@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Peeters', 'Sofie', NULL, 'COACH', 1, NULL, '2026-11-06 23:20:50'),
(423, 'aissatou.bah@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Bah', 'Aïssatou', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(424, 'cheikh.fall@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Fall', 'Cheikh', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(425, 'elise.petit@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Petit', 'Élise', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(426, 'kofi.mensah@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Mensah', 'Kofi', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(427, 'ines.martin@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Martin', 'Inès', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(428, 'tom.vermeulen@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Vermeulen', 'Tom', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(429, 'nouveau@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Nouveau', 'Compte', NULL, 'SPORTIF', 0, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '2026-11-06 23:20:50'),
(430, 'sportif35.6@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°35-6', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(431, 'sportif35.7@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°35-7', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(432, 'sportif35.8@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°35-8', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(433, 'sportif35.9@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°35-9', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(434, 'sportif35.10@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°35-10', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(435, 'sportif35.11@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°35-11', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(436, 'sportif43.6@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°43-6', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(437, 'sportif43.7@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°43-7', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(438, 'sportif43.8@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°43-8', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(439, 'sportif43.9@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°43-9', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(440, 'sportif43.10@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°43-10', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(441, 'sportif43.11@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°43-11', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(442, 'sportif52.6@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°52-6', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(443, 'sportif52.7@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°52-7', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(444, 'sportif52.8@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°52-8', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(445, 'sportif52.9@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°52-9', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(446, 'sportif52.10@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°52-10', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(447, 'sportif52.11@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°52-11', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(448, 'sportif60.6@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°60-6', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(449, 'sportif60.7@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°60-7', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(450, 'sportif60.8@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°60-8', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(451, 'sportif60.9@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°60-9', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(452, 'sportif60.10@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°60-10', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50'),
(453, 'sportif60.11@fitbook.be', '$2y$13$zEknngw4rW9EwXZSaNmytudo37gjNo6O7fPGDxRgwL9xKUsBQFEpG', 'Sportif', 'N°60-11', NULL, 'SPORTIF', 1, NULL, '2026-11-06 23:20:50');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
