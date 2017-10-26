-- --------------------------------------------------------
-- Host:                         registration
-- Server version:               10.1.26-MariaDB-0+deb9u1 - Debian 9.1
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table mrg_db.competition
CREATE TABLE IF NOT EXISTS `competition` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.
-- Dumping structure for table mrg_db.match
CREATE TABLE IF NOT EXISTS `match` (
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

-- Data exporting was unselected.
-- Dumping structure for table mrg_db.ring-assignment
CREATE TABLE IF NOT EXISTS `ring-assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `competition` char(3) NOT NULL,
  `robot` int(10) unsigned NOT NULL,
  `ring` int(10) unsigned NOT NULL,
  `letter` char(1) NOT NULL,
  `placed` tinyint(3) unsigned DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=283 DEFAULT CHARSET=utf8mb4 COMMENT='INSERT into `ring-assignment` (robot, competition, ring, letter) VALUES (''4'',''PST'',''4'',''I'')';

-- Data exporting was unselected.
-- Dumping structure for table mrg_db.robot
CREATE TABLE IF NOT EXISTS `robot` (
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
) ENGINE=InnoDB AUTO_INCREMENT=789 DEFAULT CHARSET=latin1 COMMENT='robot registrations';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
