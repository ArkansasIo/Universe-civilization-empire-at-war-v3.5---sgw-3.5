CREATE TABLE IF NOT EXISTS research_projects (
  id VARCHAR(64) PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL,
  technology_id VARCHAR(64) NOT NULL,
  level INT NOT NULL DEFAULT 1,
  status VARCHAR(24) NOT NULL DEFAULT 'queued',
  started_at TIMESTAMP(3) NULL,
  completes_at TIMESTAMP(3) NULL,
  state_version BIGINT NOT NULL DEFAULT 0,
  INDEX idx_research_player (player_id),
  INDEX idx_research_completion (completes_at)
);

CREATE TABLE IF NOT EXISTS battles (
  id VARCHAR(64) PRIMARY KEY,
  attacker_id VARCHAR(64) NOT NULL,
  defender_id VARCHAR(64) NULL,
  location_planet_id VARCHAR(64) NOT NULL,
  seed VARCHAR(255) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  resolved_at TIMESTAMP(3) NULL,
  result_json JSON NULL,
  INDEX idx_battles_attacker (attacker_id),
  INDEX idx_battles_defender (defender_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id VARCHAR(64) NULL,
  event_type VARCHAR(80) NOT NULL,
  idempotency_key VARCHAR(128) NULL,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_audit_idempotency (idempotency_key),
  INDEX idx_audit_actor_time (actor_id, created_at),
  INDEX idx_audit_type_time (event_type, created_at)
);
