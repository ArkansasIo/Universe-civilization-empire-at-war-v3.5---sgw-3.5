import type { ItemDefinition } from "./types.js";
import type { CraftingTrack, CraftingUpgradeState, MaterialCost, RepairRule, UpgradeResult } from "./tempering.js";
import type { CraftingInventory } from "./crafting.js";

export interface CraftingUpgradeRequest {
  requestId: string;
  playerId: string;
  item: ItemDefinition;
  state: CraftingUpgradeState;
  inventory: CraftingInventory;
  currency: number;
  track: CraftingTrack;
  useProtection?: boolean;
}

export interface CraftingUpgradeResponse {
  ok: true;
  requestId: string;
  result: UpgradeResult;
}

export interface CraftingErrorResponse {
  ok: false;
  requestId?: string;
  error: string;
  code: "INVALID_REQUEST" | "STALE_STATE" | "INSUFFICIENT_MATERIALS" | "CRAFTING_FAILED" | "CONFLICT";
}

export interface CraftingRepairRequest {
  requestId: string;
  playerId: string;
  itemId: string;
  state: CraftingUpgradeState;
  currency: number;
  materials: Record<string, number>;
  rule: RepairRule;
}

export interface CraftingPreviewResponse {
  ok: true;
  requestId: string;
  track: CraftingTrack;
  currentLevel: number;
  nextLevel: number;
  currencyCost: number;
  materials: MaterialCost[];
  successChance: number;
  protectedMaterials: MaterialCost[];
}

export function isCraftingUpgradeRequest(value: unknown): value is CraftingUpgradeRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<CraftingUpgradeRequest>;
  return typeof request.requestId === "string" && typeof request.playerId === "string" &&
    !!request.item && !!request.state && !!request.inventory &&
    typeof request.currency === "number" &&
    (request.track === "tempering" || request.track === "masterworking");
}
