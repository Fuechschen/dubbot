
CREATE TABLE IF NOT EXISTS `tracks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT 'null',
  `fkid` varchar(50) DEFAULT 'null',
  `thumbnail` varchar(50) DEFAULT 'null',
  `type` varchar(50) DEFAULT 'null',
  `songLength` int(11) NOT NULL DEFAULT '0',
  `blacklisted` int(11) unsigned DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL DEFAULT 'null',
  `userid` varchar(50) NOT NULL DEFAULT 'null',
  `roleid` varchar(50) NOT NULL DEFAULT '0',
  `dubs` int(11) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT '0',
  `mcuuid` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
