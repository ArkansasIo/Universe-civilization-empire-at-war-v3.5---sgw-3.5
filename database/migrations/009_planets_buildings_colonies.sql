CREATE TABLE IF NOT EXISTS space_planet_buildings (
  planet_id BIGINT NOT NULL,
  building_id VARCHAR(64) NOT NULL,
  level INT NOT NULL DEFAULT 0,
  PRIMARY KEY (planet_id, building_id),
  CONSTRAINT fk_space_building_planet FOREIGN KEY (planet_id) REFERENCES space_planets(id) ON DELETE CASCADE,
  CONSTRAINT chk_space_building_level CHECK (level >= 0)
);

CREATE TABLE IF NOT EXISTS space_construction_queue (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  planet_id BIGINT NOT NULL,
  building_id VARCHAR(64) NOT NULL,
  target_level INT NOT NULL,
  metal_cost BIGINT NOT NULL DEFAULT 0,
  crystal_cost BIGINT NOT NULL DEFAULT 0,
  deuterium_cost BIGINT NOT NULL DEFAULT 0,
  naquadah_cost BIGINT NOT NULL DEFAULT 0,
  started_at DATETIME(3) NOT NULL,
  completes_at DATETIME(3) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'queued',
  INDEX idx_space_construction_planet_time (planet_id, status, completes_at),
  CONSTRAINT fk_space_construction_planet FOREIGN KEY (planet_id) REFERENCES space_planets(id) ON DELETE CASCADE,
  CONSTRAINT chk_space_construction_level CHECK (target_level > 0)
);

CREATE TABLE IF NOT EXISTS space_colonies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT NOT NULL,
  name VARCHAR(80) NOT NULL,
  galaxy INT NOT NULL,
  system INT NOT NULL,
  position INT NOT NULL,
  fields INT NOT NULL DEFAULT 163,
  used_fields INT NOT NULL DEFAULT 1,
  population DECIMAL(20,2) NOT NULL DEFAULT 100,
  is_capital BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uq_space_colony_coordinate (galaxy, system, position),
  INDEX idx_space_colony_owner (owner_id)
);
