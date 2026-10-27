INSERT INTO game_config (config_key, config_value, category, description) VALUES
('turn_interval_seconds','1800','gameplay','Authoritative 30-minute turn interval'),
('max_turns_stored','10000','gameplay','Maximum stored turns'),
('turn_regen_threshold','4000','gameplay','Generate new turns only below this balance'),
('mothership_purchase_cost','450000000','economy','Base mothership purchase cost'),
('unit_production_base_cost','10000','economy','Base Unit Production purchase cost'),
('unit_production_increment','5000','economy','UP cost multiplier increment'),
('galaxy_generation_version','1','galaxy','Deterministic generation schema version')
ON DUPLICATE KEY UPDATE config_value=VALUES(config_value), updated_at=CURRENT_TIMESTAMP;
