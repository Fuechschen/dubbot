
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

CREATE TABLE `users` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(50) NOT NULL DEFAULT 'null',
	`userid` VARCHAR(50) NOT NULL DEFAULT 'null',
	`roleid` VARCHAR(50) NOT NULL DEFAULT '0',
	`dubs` INT(11) NOT NULL DEFAULT '0',
	`status` INT(11) NOT NULL DEFAULT '0',
	`last_active` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
	`afk` INT(11) NULL DEFAULT '0',
	`warned_for_afk` INT(11) NULL DEFAULT '0',
	`created_at` DATETIME NULL DEFAULT NULL,
	`updated_at` DATETIME NULL DEFAULT NULL,
	INDEX `id` (`id`)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `custom_texts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trigger` varchar(50) NOT NULL,
  `response` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  UNIQUE KEY `trigger` (`trigger`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `custom_texts` (`id`, `trigger`, `response`) VALUES
	(1, 'bot', 'Get info about our bot here: https://dubbot.net'),
	(2, 'commands', 'Find the bot commands here: https://dubbot.net/commands/');
