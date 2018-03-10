-- MySQL dump 10.16  Distrib 10.1.29-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: registration    Database: mrg_db
-- ------------------------------------------------------
-- Server version	10.1.26-MariaDB-0+deb9u1

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
-- Table structure for table `competition`
--

DROP TABLE IF EXISTS `competition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `competition` (
  `id` char(50) NOT NULL,
  `name` char(50) NOT NULL,
  `longName` char(50) NOT NULL,
  `rings` tinyint(3) unsigned NOT NULL,
  `minRobotsPerRing` tinyint(3) unsigned NOT NULL,
  `maxRobotsPerRing` tinyint(3) unsigned NOT NULL,
  `maxEntries` tinyint(3) unsigned NOT NULL,
  `checkString` char(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `registrationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `measureMass` tinyint(4) NOT NULL,
  `measureSize` tinyint(4) NOT NULL,
  `measureTime` tinyint(4) NOT NULL,
  `measureScratch` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `match`
--

DROP TABLE IF EXISTS `match`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `match` (
  `competition` char(3) NOT NULL,
  `round` tinyint(3) unsigned NOT NULL,
  `ring` tinyint(3) unsigned NOT NULL,
  `competitor1` int(10) unsigned NOT NULL,
  `competitor2` int(10) unsigned NOT NULL,
  `competitor1Wins` tinyint(4) DEFAULT NULL,
  `competitor2Wins` tinyint(4) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ring-assignment`
--

DROP TABLE IF EXISTS `ring-assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ring-assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `competition` char(3) NOT NULL,
  `robot` int(10) unsigned NOT NULL,
  `ring` int(10) unsigned NOT NULL,
  `letter` char(1) NOT NULL,
  `placed` tinyint(3) unsigned DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='INSERT into `ring-assignment` (robot, competition, ring, letter) VALUES (''4'',''PST'',''4'',''I'')';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `robot`
--

DROP TABLE IF EXISTS `robot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `robot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `robot` char(100) DEFAULT NULL,
  `competition` char(50) DEFAULT NULL,
  `driver1` char(50) DEFAULT NULL,
  `driver1Gr` char(50) DEFAULT NULL,
  `driver2` char(50) DEFAULT NULL,
  `driver2Gr` char(50) DEFAULT NULL,
  `driver3` char(50) DEFAULT NULL,
  `driver3Gr` char(50) DEFAULT NULL,
  `school` char(150) DEFAULT NULL,
  `coach` char(100) DEFAULT NULL,
  `email` char(100) DEFAULT NULL,
  `ph` char(16) DEFAULT NULL,
  `invoiced` decimal(4,2) DEFAULT NULL,
  `paid` decimal(4,2) DEFAULT NULL,
  `signedIn` tinyint(4) DEFAULT NULL,
  `tookPayment` char(30) DEFAULT NULL,
  `measured` tinyint(4) DEFAULT NULL,
  `late` tinyint(4) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `withdrawn` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1625 DEFAULT CHARSET=latin1 COMMENT='robot registrations';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `robotMeasurement`
--

DROP TABLE IF EXISTS `robotMeasurement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `robotMeasurement` (
  `robot` int(11) NOT NULL,
  `datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `result` varchar(4) DEFAULT NULL,
  `type` varchar(32) DEFAULT NULL,
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'mrg_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-03-10 15:45:38
