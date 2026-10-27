-- Durable authoritative state snapshot used by the TypeScript command engine.
-- This is additive and does not replace the legacy Stargate Universe schema.

CREATE TABLE IF NOT EXISTS game_authoritative_state (
  player_id VARCHAR(64) NOT NULL,
  state_version BIGINT NOT NULL DEFAULT 0,
  state_json JSON NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (player_id),
  CONSTRAINT fk_game_authoritative_state_player
    FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_game_authoritative_state_version
  ON game_authoritative_state(player_id, state_version);
