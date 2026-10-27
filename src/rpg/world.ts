export type Biome = "void" | "desert" | "forest" | "ice" | "ocean" | "volcanic" | "urban";

export interface WorldZone { id: string; name: string; biome: Biome; minLevel: number; maxLevel: number; dungeonIds: string[]; bossIds: string[]; }
export interface WorldBossState { bossId: string; zoneId: string; maxHp: number; currentHp: number; spawnedAt: number; despawnAt: number; }

export const STARTER_ZONES: WorldZone[] = [
  { id: "tauri-frontier", name: "Tau'ri Frontier", biome: "urban", minLevel: 1, maxLevel: 10, dungeonIds: ["rift-catacombs"], bossIds: [] },
  { id: "riftlands", name: "Riftlands", biome: "void", minLevel: 5, maxLevel: 25, dungeonIds: ["rift-catacombs"], bossIds: ["void-warden"] },
  { id: "devouring-reach", name: "Devouring Reach", biome: "volcanic", minLevel: 25, maxLevel: 50, dungeonIds: ["star-devourer-lair"], bossIds: ["star-devourer"] }
];

export function spawnWorldBoss(bossId: string, zoneId: string, maxHp: number, ttlMs = 30 * 60_000, now = Date.now()): WorldBossState {
  if (maxHp <= 0) throw new Error("maxHp must be positive");
  return { bossId, zoneId, maxHp, currentHp: maxHp, spawnedAt: now, despawnAt: now + ttlMs };
}

export function damageWorldBoss(state: WorldBossState, damage: number): WorldBossState {
  if (damage < 0) throw new Error("damage must be non-negative");
  return { ...state, currentHp: Math.max(0, state.currentHp - damage) };
}
