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
  if (
    typeof request.requestId !== "string" ||
    request.requestId.length === 0 ||
    typeof request.playerId !== "string" ||
    request.playerId.length === 0 ||
    !request.item ||
    typeof request.item.id !== "string" ||
    request.item.id.length === 0 ||
    !request.state ||
    request.state.itemId !== request.item.id ||
    !Number.isSafeInteger(request.state.temperLevel) ||
    request.state.temperLevel < 0 ||
    !Number.isSafeInteger(request.state.masterworkRank) ||
    request.state.masterworkRank < 0 ||
    typeof request.state.damaged !== "boolean" ||
    !request.inventory ||
    !request.inventory.materials ||
    typeof request.inventory.materials !== "object" ||
    Array.isArray(request.inventory.materials) ||
    typeof request.currency !== "number" ||
    !Number.isFinite(request.currency) ||
    request.currency < 0 ||
    (request.track !== "tempering" && request.track !== "masterworking")
  ) {
    return false;
  }
  return Object.values(request.inventory.materials).every(
    (quantity) => typeof quantity === "number" && Number.isFinite(quantity) && quantity >= 0,
  );
}
