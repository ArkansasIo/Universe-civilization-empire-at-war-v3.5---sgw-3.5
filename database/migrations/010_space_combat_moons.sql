CREATE TABLE IF NOT EXISTS fleet_build_queue (
  id VARCHAR(96) PRIMARY KEY,
  planet_id VARCHAR(96) NOT NULL,
  ship_id VARCHAR(64) NOT NULL,
  quantity INT NOT NULL,
  queued_at BIGINT NOT NULL,
  completes_at BIGINT NOT NULL,
  cost_json JSON NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'queued',
  INDEX idx_fleet_build_planet_status (planet_id,status,completes_at)
);

CREATE TABLE IF NOT EXISTS debris_fields (
  id VARCHAR(96) PRIMARY KEY,
  galaxy INT NOT NULL,
  system INT NOT NULL,
  position INT NOT NULL,
  metal BIGINT NOT NULL DEFAULT 0,
  crystal BIGINT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  INDEX idx_debris_coordinate (galaxy,system,position),
  INDEX idx_debris_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS moons (
  id VARCHAR(96) PRIMARY KEY,
  planet_id VARCHAR(96) NOT NULL UNIQUE,
  size_fields INT NOT NULL,
  used_fields INT NOT NULL DEFAULT 1,
  buildings_json JSON NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS espionage_reports (
  id VARCHAR(96) PRIMARY KEY,
  attacker_id VARCHAR(96) NOT NULL,
  defender_id VARCHAR(96) NOT NULL,
  success BOOLEAN NOT NULL,
  detected BOOLEAN NOT NULL,
  report_json JSON NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_espionage_defender (defender_id,created_at)
);
