-- Durable command/event persistence for the authoritative TypeScript game server.
-- MySQL 8 / MariaDB 10.5+.
-- This migration is additive and does not replace the legacy Stargate Universe tables.

ALTER TABLE game_players
  ADD COLUMN state_version BIGINT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS game_command_idempotency (
  player_id VARCHAR(64) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  command_id VARCHAR(128) NOT NULL,
  command_name VARCHAR(64) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  event_id VARCHAR(128) NULL,
  response_json JSON NULL,
  state_version BIGINT NULL,
  created_at BIGINT NOT NULL,
  completed_at BIGINT NULL,
  PRIMARY KEY (player_id, idempotency_key),
  UNIQUE KEY uq_game_command_player_command (player_id, command_id),
  KEY idx_game_command_idempotency_expiry (created_at),
  CONSTRAINT fk_game_command_idempotency_player FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE CASCADE,
  CHECK (status IN ('pending', 'completed', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_command_events (
  event_id VARCHAR(128) NOT NULL,
  player_id VARCHAR(64) NOT NULL,
  command_id VARCHAR(128) NOT NULL,
  command_name VARCHAR(64) NOT NULL,
  state_version_before BIGINT NOT NULL,
  state_version_after BIGINT NOT NULL,
  payload_json JSON NOT NULL,
  result_json JSON NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (event_id),
  UNIQUE KEY uq_game_command_event_player_command (player_id, command_id),
  KEY idx_game_command_event_player_time (player_id, created_at),
  CONSTRAINT fk_game_command_event_player FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_game_players_state_version ON game_players(id, state_version);
