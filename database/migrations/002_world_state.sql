CREATE TABLE IF NOT EXISTS galaxy_systems (
  id VARCHAR(64) PRIMARY KEY,
  generation_version INT NOT NULL,
  seed VARCHAR(255) NOT NULL,
  galaxy INT NOT NULL,
  system_no INT NOT NULL,
  star_class CHAR(1) NOT NULL,
  planet_count INT NOT NULL,
  UNIQUE KEY uq_galaxy_system (galaxy, system_no),
  INDEX idx_galaxy_generation (generation_version)
);

CREATE TABLE IF NOT EXISTS planets (
  id VARCHAR(64) PRIMARY KEY,
  system_id VARCHAR(64) NOT NULL,
  orbit_no INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  owner_id VARCHAR(64) NULL,
  population BIGINT NOT NULL DEFAULT 0,
  max_population BIGINT NOT NULL DEFAULT 100000,
  fields INT NOT NULL DEFAULT 50,
  UNIQUE KEY uq_planet_orbit (system_id, orbit_no),
  INDEX idx_planet_owner (owner_id)
);

CREATE TABLE IF NOT EXISTS stargates (
  id VARCHAR(64) PRIMARY KEY,
  planet_id VARCHAR(64) NOT NULL,
  address VARCHAR(64) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 0,
  cooldown_until TIMESTAMP(3) NULL,
  UNIQUE KEY uq_gate_address (address),
  INDEX idx_gate_planet (planet_id)
);
