import type { RaceId } from "./types";
export interface FactionDefinition { id: RaceId; name: string; bonus: string; multiplier: number; }
export const FACTIONS: Record<RaceId, FactionDefinition> = {
  asgard: { id: "asgard", name: "Asgard", bonus: "technology", multiplier: 1.25 },
  goauld: { id: "goauld", name: "Goa'uld", bonus: "military", multiplier: 1.25 },
  replicator: { id: "replicator", name: "Replicator", bonus: "unitProduction", multiplier: 1.3 },
  tauri: { id: "tauri", name: "Tau'ri", bonus: "espionage", multiplier: 1.2 },
  tollan: { id: "tollan", name: "Tollan", bonus: "naturalIncome", multiplier: 1.25 }
};
export function getFaction(id: RaceId): FactionDefinition { return FACTIONS[id]; }
export function applyFactionBonus(base: number, race: RaceId, bonus: string): number {
  if (!Number.isFinite(base) || base < 0) throw new RangeError("base must be non-negative");
  const faction = FACTIONS[race];
  return faction.bonus === bonus ? base * faction.multiplier : base;
}
