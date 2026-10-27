-- Authoritative persistence layer for the TypeScript server.
-- MySQL 8 / MariaDB 10.5+.

CREATE TABLE IF NOT EXISTS game_players (
  id VARCHAR(64) NOT NULL,
  commander_name VARCHAR(64) NOT NULL,
  race VARCHAR(32) NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_game_players_commander (commander_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_resources (
  player_id VARCHAR(64) NOT NULL,
  naquadah BIGINT NOT NULL DEFAULT 0,
  metal BIGINT NOT NULL DEFAULT 0,
  crystal BIGINT NOT NULL DEFAULT 0,
  deuterium BIGINT NOT NULL DEFAULT 0,
  energy BIGINT NOT NULL DEFAULT 0,
  dark_matter BIGINT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (player_id),
  CONSTRAINT fk_game_resources_player FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_sessions (
  id VARCHAR(64) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  player_id VARCHAR(64) NOT NULL,
  username VARCHAR(64) NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  revoked_at BIGINT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_game_sessions_token (token_hash),
  KEY idx_game_sessions_player (player_id),
  KEY idx_game_sessions_expiry (expires_at),
  CONSTRAINT fk_game_sessions_player FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_planets (
  id VARCHAR(64) NOT NULL,
  owner_id VARCHAR(64) NOT NULL,
  name VARCHAR(80) NOT NULL,
  system_id VARCHAR(64) NOT NULL,
  population BIGINT NOT NULL DEFAULT 0,
  max_population BIGINT NOT NULL DEFAULT 1000000,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_game_planets_owner (owner_id),
  KEY idx_game_planets_system (system_id),
  CONSTRAINT fk_game_planets_owner FOREIGN KEY (owner_id) REFERENCES game_players(id) ON DELETE CASCADE,
  CHECK (population >= 0),
  CHECK (max_population > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_research (
  player_id VARCHAR(64) NOT NULL,
  technology_id VARCHAR(64) NOT NULL,
  level INT NOT NULL DEFAULT 0,
  started_at BIGINT NULL,
  completed_at BIGINT NULL,
  PRIMARY KEY (player_id, technology_id),
  CONSTRAINT fk_game_research_player FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE CASCADE,
  CHECK (level >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_fleets (
  id VARCHAR(64) NOT NULL,
  owner_id VARCHAR(64) NOT NULL,
  name VARCHAR(80) NOT NULL,
  location_id VARCHAR(64) NOT NULL,
  destination_id VARCHAR(64) NULL,
  departure_at BIGINT NULL,
  arrival_at BIGINT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'docked',
  PRIMARY KEY (id),
  KEY idx_game_fleets_owner (owner_id),
  KEY idx_game_fleets_arrival (arrival_at),
  CONSTRAINT fk_game_fleets_owner FOREIGN KEY (owner_id) REFERENCES game_players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_battles (
  id VARCHAR(64) NOT NULL,
  attacker_id VARCHAR(64) NOT NULL,
  defender_id VARCHAR(64) NOT NULL,
  seed BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL,
  attacker_power DOUBLE NOT NULL,
  defender_power DOUBLE NOT NULL,
  winner_id VARCHAR(64) NULL,
  resolved_at BIGINT NULL,
  PRIMARY KEY (id),
  KEY idx_game_battles_attacker (attacker_id),
  KEY idx_game_battles_defender (defender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_audit_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_id VARCHAR(64) NULL,
  event_type VARCHAR(80) NOT NULL,
  event_payload JSON NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_game_audit_player_time (player_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
