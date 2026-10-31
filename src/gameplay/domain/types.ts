/** Shared domain contracts for the gameplay foundation. */
export type Id = string;
export type ResourceType = "naquadah" | "metal" | "crystal" | "deuterium" | "energy" | "darkMatter";
export type ResourceWallet = Record<ResourceType, number>;
export type RaceId = "asgard" | "goauld" | "replicator" | "tauri" | "tollan";
export interface Commander { id: Id; name: string; race: RaceId; level: number; experience: number; }
export interface Planet { id: Id; name: string; ownerId: Id | null; galaxy: number; system: number; slot: number; level: number; }
export interface FleetUnit { unitId: string; quantity: number; attack: number; hull: number; }
export interface CombatResult { winner: "attacker" | "defender" | "draw"; attackerRemaining: number; defenderRemaining: number; rounds: number; }
export const EMPTY_WALLET: ResourceWallet = { naquadah: 0, metal: 0, crystal: 0, deuterium: 0, energy: 0, darkMatter: 0 };
export function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(label + " must be a finite non-negative number");
}
