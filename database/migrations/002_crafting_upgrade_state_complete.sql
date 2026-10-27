-- Upgrade an installation that already ran 001_crafting_upgrade.sql.
-- Run once before deploying the complete MySQL crafting adapter.

ALTER TABLE rpg_item_upgrade_state
  ADD COLUMN IF NOT EXISTS temper_xp INT UNSIGNED NOT NULL DEFAULT 0 AFTER masterwork_rank,
  ADD COLUMN IF NOT EXISTS masterwork_xp INT UNSIGNED NOT NULL DEFAULT 0 AFTER temper_xp,
  ADD COLUMN IF NOT EXISTS max_temper_level TINYINT UNSIGNED NOT NULL DEFAULT 10 AFTER masterwork_xp,
  ADD COLUMN IF NOT EXISTS max_masterwork_rank TINYINT UNSIGNED NOT NULL DEFAULT 5 AFTER max_temper_level,
  ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE AFTER damaged,
  ADD COLUMN IF NOT EXISTS history JSON NOT NULL AFTER locked;
