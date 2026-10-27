CREATE TABLE IF NOT EXISTS space_planets (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64), galaxy INT NOT NULL, system INT NOT NULL, position INT NOT NULL,
  name VARCHAR(128) NOT NULL, fields INT NOT NULL, temperature INT NOT NULL,
  metal DECIMAL(30,4) NOT NULL DEFAULT 0, crystal DECIMAL(30,4) NOT NULL DEFAULT 0,
  deuterium DECIMAL(30,4) NOT NULL DEFAULT 0, naquadah DECIMAL(30,4) NOT NULL DEFAULT 0,
  last_tick_at BIGINT NOT NULL, UNIQUE KEY uq_space_coordinates(galaxy,system,position)
);
CREATE TABLE IF NOT EXISTS space_research (
  player_id VARCHAR(64) NOT NULL, research_id VARCHAR(64) NOT NULL, level INT NOT NULL DEFAULT 0,
  PRIMARY KEY(player_id,research_id), CONSTRAINT chk_space_research_level CHECK(level>=0)
);
CREATE TABLE IF NOT EXISTS space_fleets (
  id VARCHAR(64) PRIMARY KEY, owner_id VARCHAR(64) NOT NULL, mission_id VARCHAR(64), cargo DECIMAL(30,4) NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS space_fleet_ships (
  fleet_id VARCHAR(64) NOT NULL, ship_id VARCHAR(64) NOT NULL, quantity BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY(fleet_id,ship_id), CONSTRAINT chk_space_ship_quantity CHECK(quantity>=0)
);
CREATE TABLE IF NOT EXISTS space_missions (
  id VARCHAR(64) PRIMARY KEY, owner_id VARCHAR(64) NOT NULL, fleet_id VARCHAR(64) NOT NULL,
  mission_type VARCHAR(32) NOT NULL, from_galaxy INT NOT NULL, from_system INT NOT NULL, from_position INT NOT NULL,
  to_galaxy INT NOT NULL, to_system INT NOT NULL, to_position INT NOT NULL,
  departure_at BIGINT NOT NULL, arrival_at BIGINT NOT NULL, return_at BIGINT,
  status VARCHAR(24) NOT NULL
);
CREATE TABLE IF NOT EXISTS alliances (
  id VARCHAR(64) PRIMARY KEY, name VARCHAR(128) NOT NULL, tag VARCHAR(8) NOT NULL UNIQUE,
  leader_id VARCHAR(64) NOT NULL, level INT NOT NULL DEFAULT 1, experience BIGINT NOT NULL DEFAULT 0, treasury DECIMAL(30,4) NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS alliance_members (
  alliance_id VARCHAR(64) NOT NULL, player_id VARCHAR(64) NOT NULL, joined_at BIGINT NOT NULL,
  PRIMARY KEY(alliance_id,player_id)
);
CREATE TABLE IF NOT EXISTS alliance_wars (
  id VARCHAR(64) PRIMARY KEY, attacker_alliance_id VARCHAR(64) NOT NULL, defender_alliance_id VARCHAR(64) NOT NULL,
  started_at BIGINT NOT NULL, ends_at BIGINT NOT NULL, attacker_score BIGINT NOT NULL DEFAULT 0, defender_score BIGINT NOT NULL DEFAULT 0, status VARCHAR(16) NOT NULL
);
