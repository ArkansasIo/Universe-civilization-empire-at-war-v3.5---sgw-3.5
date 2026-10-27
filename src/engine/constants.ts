export const TURN_INTERVAL_SECONDS = 30 * 60;
export const MAX_TURNS = 10_000;
export const TURN_REGEN_THRESHOLD = 4_000;
export const MOTHERSHIP_COST = 450_000_000;
export const RACES = ['asgard','goauld','replicator','tauri','tollan'] as const;
export const RACE_BONUSES = { asgard:1.25, goauld:1.25, replicator:1.30, tauri:1.20, tollan:1.25 } as const;
