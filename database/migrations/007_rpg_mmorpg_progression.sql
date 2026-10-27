CREATE TABLE IF NOT EXISTS rpg_character_progression (
  character_id VARCHAR(64) PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL,
  class_id VARCHAR(32) NOT NULL,
  level INT NOT NULL DEFAULT 1,
  xp BIGINT NOT NULL DEFAULT 0,
  skill_points INT NOT NULL DEFAULT 0,
  talent_points INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_rpg_level CHECK (level >= 1),
  CONSTRAINT chk_rpg_xp CHECK (xp >= 0),
  CONSTRAINT chk_rpg_skill_points CHECK (skill_points >= 0),
  CONSTRAINT chk_rpg_talent_points CHECK (talent_points >= 0),
  INDEX idx_rpg_progression_player (player_id)
);

CREATE TABLE IF NOT EXISTS rpg_inventory_items (
  character_id VARCHAR(64) NOT NULL,
  item_id VARCHAR(128) NOT NULL,
  quantity INT NOT NULL,
  max_stack INT NOT NULL DEFAULT 99,
  PRIMARY KEY (character_id, item_id),
  CONSTRAINT chk_rpg_inventory_quantity CHECK (quantity > 0),
  CONSTRAINT chk_rpg_inventory_stack CHECK (max_stack > 0)
);

CREATE TABLE IF NOT EXISTS rpg_equipment_loadout (
  character_id VARCHAR(64) NOT NULL,
  slot_id VARCHAR(32) NOT NULL,
  instance_id VARCHAR(128) NOT NULL,
  item_id VARCHAR(128) NOT NULL,
  required_level INT NOT NULL DEFAULT 1,
  PRIMARY KEY (character_id, slot_id),
  INDEX idx_rpg_equipment_instance (instance_id)
);

CREATE TABLE IF NOT EXISTS rpg_quest_progress (
  character_id VARCHAR(64) NOT NULL,
  quest_id VARCHAR(128) NOT NULL,
  objective_state JSON NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (character_id, quest_id)
);

CREATE TABLE IF NOT EXISTS rpg_pvp_profiles (
  player_id VARCHAR(64) PRIMARY KEY,
  rating INT NOT NULL DEFAULT 1000,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  honor INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
