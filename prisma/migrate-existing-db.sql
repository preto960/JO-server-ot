-- ============================================
-- Migrate existing OT Server database for MyAAC Next.js Web
-- Compatible with MySQL 5.7+ and MariaDB
-- Run this on your existing MySQL database (otserver)
-- ============================================

DROP PROCEDURE IF EXISTS `add_column_if_missing`;
DELIMITER $$
CREATE PROCEDURE `add_column_if_missing`(
  IN tbl VARCHAR(64),
  IN col VARCHAR(64),
  IN col_def VARCHAR(500)
)
BEGIN
  DECLARE col_count INT;
  SELECT COUNT(*) INTO col_count
    FROM `information_schema`.`COLUMNS`
    WHERE `TABLE_SCHEMA` = DATABASE()
      AND `TABLE_NAME` = tbl
      AND `COLUMN_NAME` = col;
  IF col_count = 0 THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', col_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('Added column `', col, '` to `', tbl, '`') AS result;
  ELSE
    SELECT CONCAT('Column `', col, '` already exists in `', tbl, '`') AS result;
  END IF;
END$$
DELIMITER ;

-- ====== ALTER ACCOUNTS TABLE ======
CALL `add_column_if_missing`('accounts', 'salt', 'VARCHAR(40) DEFAULT NULL');
CALL `add_column_if_missing`('accounts', 'coins', 'INT NOT NULL DEFAULT 0');
CALL `add_column_if_missing`('accounts', 'email', 'VARCHAR(255) DEFAULT ""');
CALL `add_column_if_missing`('accounts', 'type', 'INT NOT NULL DEFAULT 1');
CALL `add_column_if_missing`('accounts', 'premend', 'INT NOT NULL DEFAULT 0');
CALL `add_column_if_missing`('accounts', 'created', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL `add_column_if_missing`('accounts', 'lastday', 'INT NOT NULL DEFAULT 0');

-- ====== ALTER GUILDS TABLE ======
CALL `add_column_if_missing`('guilds', 'motd', 'VARCHAR(255) NOT NULL DEFAULT ""');
CALL `add_column_if_missing`('guilds', 'description', 'TEXT');
CALL `add_column_if_missing`('guilds', 'logo_gfx_name', 'VARCHAR(100) NOT NULL DEFAULT "default"');

-- ====== ALTER PLAYERS TABLE ======
CALL `add_column_if_missing`('players', 'comment', 'VARCHAR(255) NOT NULL DEFAULT ""');
CALL `add_column_if_missing`('players', 'hidden', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL `add_column_if_missing`('players', 'deletion', 'INT NOT NULL DEFAULT -1');
CALL `add_column_if_missing`('players', 'balance', 'INT NOT NULL DEFAULT 0');
CALL `add_column_if_missing`('players', 'offlinetraining_time', 'INT NOT NULL DEFAULT 43200');
CALL `add_column_if_missing`('players', 'offlinetraining_skill', 'INT NOT NULL DEFAULT -1');
CALL `add_column_if_missing`('players', 'created', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

-- ====== CREATE MYAAC WEB TABLES ======

CREATE TABLE IF NOT EXISTS `myaac_news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `body` TEXT NOT NULL,
  `type` INT NOT NULL DEFAULT 1,
  `date` INT NOT NULL DEFAULT 0,
  `category` INT NOT NULL DEFAULT 0,
  `player_id` INT NOT NULL DEFAULT 0,
  `last_modified_by` INT NOT NULL DEFAULT 0,
  `last_modified_date` INT NOT NULL DEFAULT 0,
  `comments` VARCHAR(50) NOT NULL DEFAULT '',
  `article_text` VARCHAR(300) NOT NULL DEFAULT '',
  `article_image` VARCHAR(100) NOT NULL DEFAULT '',
  `hidden` TINYINT(1) NOT NULL DEFAULT 0,
  INDEX `idx_type` (`type`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_news_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL DEFAULT '',
  `description` VARCHAR(50) NOT NULL DEFAULT '',
  `icon_id` INT NOT NULL DEFAULT 0,
  `hidden` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_forum_boards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(255) NOT NULL DEFAULT '',
  `ordering` INT NOT NULL DEFAULT 0,
  `guild` INT NOT NULL DEFAULT 0,
  `access` INT NOT NULL DEFAULT 0,
  `closed` TINYINT(1) NOT NULL DEFAULT 0,
  `hidden` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_forum` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_post` INT NOT NULL DEFAULT 0,
  `last_post` INT NOT NULL DEFAULT 0,
  `section` INT NOT NULL DEFAULT 0,
  `replies` INT NOT NULL DEFAULT 0,
  `views` INT NOT NULL DEFAULT 0,
  `author_aid` INT NOT NULL DEFAULT 0,
  `author_guid` INT NOT NULL DEFAULT 0,
  `post_text` TEXT NOT NULL,
  `post_topic` VARCHAR(255) NOT NULL DEFAULT '',
  `post_smile` TINYINT(1) NOT NULL DEFAULT 1,
  `post_html` TINYINT(1) NOT NULL DEFAULT 0,
  `post_date` INT NOT NULL DEFAULT 0,
  `last_edit_aid` INT NOT NULL DEFAULT 0,
  `edit_date` INT NOT NULL DEFAULT 0,
  `post_ip` VARCHAR(32) NOT NULL DEFAULT '0.0.0.0',
  `sticked` TINYINT(1) NOT NULL DEFAULT 0,
  `closed` TINYINT(1) NOT NULL DEFAULT 0,
  INDEX `idx_section` (`section`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_faq` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(255) NOT NULL DEFAULT '',
  `answer` VARCHAR(1020) NOT NULL DEFAULT '',
  `ordering` INT NOT NULL DEFAULT 0,
  `hidden` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_spells` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `spell` VARCHAR(255) NOT NULL DEFAULT '',
  `name` VARCHAR(255) NOT NULL,
  `words` VARCHAR(255) NOT NULL DEFAULT '',
  `category` INT NOT NULL DEFAULT 0,
  `type` INT NOT NULL DEFAULT 0,
  `level` INT NOT NULL DEFAULT 0,
  `maglevel` INT NOT NULL DEFAULT 0,
  `mana` INT NOT NULL DEFAULT 0,
  `soul` INT NOT NULL DEFAULT 0,
  `conjure_id` INT NOT NULL DEFAULT 0,
  `conjure_count` INT NOT NULL DEFAULT 0,
  `reagent` INT NOT NULL DEFAULT 0,
  `item_id` INT NOT NULL DEFAULT 0,
  `premium` TINYINT(1) NOT NULL DEFAULT 0,
  `vocations` VARCHAR(100) NOT NULL DEFAULT '',
  `hidden` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_monsters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hidden` TINYINT(1) NOT NULL DEFAULT 0,
  `name` VARCHAR(255) NOT NULL,
  `mana` INT NOT NULL DEFAULT 0,
  `exp` INT NOT NULL DEFAULT 0,
  `health` INT NOT NULL DEFAULT 0,
  `speed_lvl` INT NOT NULL DEFAULT 1,
  `use_haste` TINYINT(1) NOT NULL DEFAULT 0,
  `voices` TEXT,
  `immunities` VARCHAR(255) NOT NULL DEFAULT '',
  `elements` TEXT,
  `summonable` TINYINT(1) NOT NULL DEFAULT 0,
  `convinceable` TINYINT(1) NOT NULL DEFAULT 0,
  `pushable` TINYINT(1) NOT NULL DEFAULT 0,
  `canpushitems` TINYINT(1) NOT NULL DEFAULT 0,
  `canwalkonenergy` TINYINT(1) NOT NULL DEFAULT 0,
  `canwalkonpoison` TINYINT(1) NOT NULL DEFAULT 0,
  `canwalkonfire` TINYINT(1) NOT NULL DEFAULT 0,
  `runonhealth` INT NOT NULL DEFAULT 0,
  `hostile` TINYINT(1) NOT NULL DEFAULT 0,
  `attackable` TINYINT(1) NOT NULL DEFAULT 0,
  `rewardboss` TINYINT(1) NOT NULL DEFAULT 0,
  `defense` INT NOT NULL DEFAULT 0,
  `armor` INT NOT NULL DEFAULT 0,
  `canpushcreatures` TINYINT(1) NOT NULL DEFAULT 0,
  `race` VARCHAR(255) NOT NULL DEFAULT '',
  `loot` TEXT,
  `summons` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_polls` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NOT NULL DEFAULT '',
  `end` INT NOT NULL DEFAULT 0,
  `start` INT NOT NULL DEFAULT 0,
  `answers` INT NOT NULL DEFAULT 0,
  `votes_all` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_polls_answers` (
  `poll_id` INT NOT NULL,
  `answer_id` INT NOT NULL,
  `answer` VARCHAR(255) NOT NULL,
  `votes` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`poll_id`, `answer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `comment` VARCHAR(255) NOT NULL DEFAULT '',
  `image` VARCHAR(255) NOT NULL DEFAULT '',
  `thumb` VARCHAR(255) NOT NULL DEFAULT '',
  `author` VARCHAR(50) NOT NULL DEFAULT '',
  `ordering` INT NOT NULL DEFAULT 0,
  `hidden` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_changelog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `body` VARCHAR(500) NOT NULL DEFAULT '',
  `type` INT NOT NULL DEFAULT 0,
  `where` INT NOT NULL DEFAULT 0,
  `date` INT NOT NULL DEFAULT 0,
  `player_id` INT NOT NULL DEFAULT 0,
  `hidden` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_bugtracker` (
  `uid` INT AUTO_INCREMENT PRIMARY KEY,
  `account` VARCHAR(255) NOT NULL DEFAULT '',
  `type` INT NOT NULL DEFAULT 0,
  `status` INT NOT NULL DEFAULT 0,
  `text` TEXT NOT NULL,
  `subject` VARCHAR(255) NOT NULL DEFAULT '',
  `reply` INT NOT NULL DEFAULT 0,
  `who` INT NOT NULL DEFAULT 0,
  `tag` INT NOT NULL DEFAULT 0,
  `date` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(30) NOT NULL,
  `value` VARCHAR(1000) NOT NULL,
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `myaac_pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(30) NOT NULL,
  `title` VARCHAR(30) NOT NULL,
  `body` TEXT NOT NULL,
  `date` INT NOT NULL DEFAULT 0,
  `player_id` INT NOT NULL DEFAULT 0,
  `php` TINYINT(1) NOT NULL DEFAULT 0,
  `enable_tinymce` TINYINT(1) NOT NULL DEFAULT 1,
  `access` INT NOT NULL DEFAULT 0,
  `hidden` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====== INSERT DEFAULT DATA ======

INSERT IGNORE INTO `myaac_config` (`name`, `value`) VALUES
('server_name', 'JO Server OT'),
('layout', 'tibiacom'),
('language', 'en'),
('visited', '1000'),
('players_count', '0');

INSERT IGNORE INTO `myaac_forum_boards` (`id`, `name`, `description`, `ordering`, `guild`, `access`) VALUES
(1, 'Community Board', 'General discussion about the server', 1, 0, 0),
(2, 'Staff Board', 'Staff announcements and news', 2, 0, 2),
(3, 'Bug Reports', 'Report bugs found in the game', 3, 0, 0),
(4, 'Trade Board', 'Trade items and characters', 4, 0, 0);

INSERT IGNORE INTO `myaac_pages` (`name`, `title`, `body`, `date`, `access`) VALUES
('rules', 'Server Rules', '1. Respect all players.\n2. No botting or macroing.\n3. No advertising other servers.\n4. No bug abuse.\n5. Respect the staff decisions.\n6. No offensive language.\n7. No sharing accounts.', UNIX_TIMESTAMP(), 0),
('faq', 'FAQ', 'Q: How do I create an account?\nA: Click "Create Account" in the menu.\n\nQ: How do I create a character?\nA: Login and go to My Account.\n\nQ: How do I join a guild?\nA: Ask a guild leader to invite you.', UNIX_TIMESTAMP(), 0),
('serverinfo', 'Server Info', 'Welcome to JO Server OT!\n\nIP: localhost\nPort: 7171\nClient: 12.x\n\nPvP: Enabled\nRate: Custom\nExperience: Custom', UNIX_TIMESTAMP(), 0),
('commands', 'Commands', 'Available commands:\n!buyup - Buy upgrade\n!sellup - Sell upgrade\n!frags - Show frag list\n!online - Show online players\n/serverinfo - Server info\n/stats - Your statistics', UNIX_TIMESTAMP(), 0),
('team', 'Team', 'Server Team:\n\nGod - Server Administrator\nGameMaster - In-game moderation\nCommunity Manager - Community management\nTutor - Player support', UNIX_TIMESTAMP(), 0),
('houses', 'Houses', 'Houses are available for premium players.\n\nTo buy a house:\n1. Find an empty house in town\n2. Stand in front of the door\n3. Use the command to purchase\n\nRent is deducted automatically from your bank balance.', UNIX_TIMESTAMP(), 0);

-- ====== CLEAN UP ======
DROP PROCEDURE IF EXISTS `add_column_if_missing`;

-- Done!
SELECT 'Migration completed successfully!' AS status;
