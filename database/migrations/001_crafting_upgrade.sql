-- RPG crafting / tempering / masterworking persistence.
-- MySQL 8.0+ / InnoDB.

CREATE TABLE IF NOT EXISTS rpg_item_upgrade_state (
  owner_id VARCHAR(128) NOT NULL,
  item_id VARCHAR(128) NOT NULL,
  temper_level TINYINT UNSIGNED NOT NULL DEFAULT 0,
  masterwork_rank TINYINT UNSIGNED NOT NULL DEFAULT 0,
  temper_xp INT UNSIGNED NOT NULL DEFAULT 0,
  masterwork_xp INT UNSIGNED NOT NULL DEFAULT 0,
  max_temper_level TINYINT UNSIGNED NOT NULL DEFAULT 10,
  max_masterwork_rank TINYINT UNSIGNED NOT NULL DEFAULT 5,
  damaged BOOLEAN NOT NULL DEFAULT FALSE,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  history JSON NOT NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (owner_id, item_id),
  KEY idx_rpg_upgrade_item (item_id),
  CONSTRAINT chk_rpg_temper_level CHECK (temper_level BETWEEN 0 AND 10),
  CONSTRAINT chk_rpg_masterwork_rank CHECK (masterwork_rank BETWEEN 0 AND 5)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS crafting_upgrade_audit (
  event_id VARCHAR(192) NOT NULL,
  request_id VARCHAR(192) NOT NULL,
  owner_id VARCHAR(128) NOT NULL,
  item_id VARCHAR(128) NOT NULL,
  track ENUM('tempering','masterwork','repair') NOT NULL,
  from_level SMALLINT UNSIGNED NOT NULL,
  to_level SMALLINT UNSIGNED NOT NULL,
  success BOOLEAN NULL,
  roll DECIMAL(18,17) NULL,
  currency_spent BIGINT UNSIGNED NOT NULL DEFAULT 0,
  materials_spent JSON NOT NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (event_id),
  UNIQUE KEY uq_crafting_request (request_id),
  KEY idx_crafting_owner_item_time (owner_id, item_id, created_at),
  KEY idx_crafting_owner_time (owner_id, created_at)
) ENGINE=InnoDB;
