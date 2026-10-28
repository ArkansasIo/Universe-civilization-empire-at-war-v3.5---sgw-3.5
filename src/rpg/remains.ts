import type { ItemDefinition } from "./types.js";
import type { CraftingUpgradeState, MaterialCost } from "./tempering.js";
import { estimateUpgradeCost } from "./tempering.js";

/** Remains System — breaking down tempered/masterworked relics yields salvage
 *  remains: a percentage refund of every material ever invested, plus tier-band
 *  relic fragments used by vendors and re-forging recipes. */

export interface RemainsTier {
  id: string;
  name: string;
  /** Minimum combined forge level (temper + masterwork) to drop this fragment. */
  minForgeLevel: number;
  itemId: string;
  perLevel: number;
}

export const REMAINS_TIERS: RemainsTier[] = [
  { id: "dust", name: "Forge Dust", minForgeLevel: 1, itemId: "forge-dust", perLevel: 3 },
  { id: "shards", name: "Tempered Shards", minForgeLevel: 10, itemId: "tempered-shards", perLevel: 2 },
  { id: "cores", name: "Masterwork Cores", minForgeLevel: 25, itemId: "masterwork-remnant", perLevel: 1 },
  { id: "heart", name: "Relic Heart Fragment", minForgeLevel: 50, itemId: "relic-heart-fragment", perLevel: 0.2 },
  { id: "void", name: "Void-Etched Remains", minForgeLevel: 75, itemId: "void-etched-remains", perLevel: 0.1 },
];

export interface RemainsRefundOptions {
  /** Portion of invested materials recovered. Upgraded items retain forge memory. */
  refundPercent?: number;
  /** Bonus refund for undamaged items (intact metal returns cleanly). */
  intactBonus?: number;
}

export interface BreakdownResult {
  itemId: string;
  itemName: string;
  /** Materials refunded (rounded down, minimum 1 per invested line at any level). */
  materials: MaterialCost[];
  /** Tier-band remains fragments produced. */
  remains: MaterialCost[];
  /** Forge levels consumed — the item resets to level 0/0. */
  levelsConsumed: number;
  wasDamaged: boolean;
}

export function combinedForgeLevel(state: CraftingUpgradeState): number {
  return state.temperLevel + state.masterworkRank;
}

/** Compute the salvage remains for breaking down an upgraded item. Pure function. */
export function computeRemains(
  item: ItemDefinition,
  state: CraftingUpgradeState,
  options: RemainsRefundOptions = {}
): BreakdownResult {
  const forgeLevel = combinedForgeLevel(state);
  const refundPercent = Math.min(100, Math.max(0, options.refundPercent ?? 45));
  const intactBonus = state.damaged ? 0 : Math.min(25, Math.max(0, options.intactBonus ?? 10));
  const factor = (refundPercent + intactBonus) / 100;

  const invested: MaterialCost[] = forgeLevel > 0
    ? [
      ...estimateUpgradeCost("tempering", state.temperLevel).materials,
      ...estimateUpgradeCost("masterworking", state.masterworkRank).materials,
    ]
    : [];

  const totals = new Map<string, number>();
  for (const m of invested) totals.set(m.itemId, (totals.get(m.itemId) ?? 0) + m.quantity);
  const materials: MaterialCost[] = [...totals]
    .map(([itemId, quantity]) => ({ itemId, quantity: Math.max(forgeLevel > 0 ? 1 : 0, Math.floor(quantity * factor)) }))
    .filter((m) => m.quantity > 0);

  const remains: MaterialCost[] = REMAINS_TIERS
    .filter((tier) => forgeLevel >= tier.minForgeLevel)
    .map((tier) => ({ itemId: tier.itemId, quantity: Math.max(1, Math.floor(forgeLevel * tier.perLevel) || 1) }));

  return {
    itemId: item.id,
    itemName: item.name,
    materials,
    remains,
    levelsConsumed: forgeLevel,
    wasDamaged: state.damaged,
  };
}

/** Mutating convenience wrapper: returns the reset state plus the breakdown. */
export function breakDownItem(
  item: ItemDefinition,
  state: CraftingUpgradeState,
  options: RemainsRefundOptions = {}
): { state: CraftingUpgradeState; breakdown: BreakdownResult } {
  const breakdown = computeRemains(item, state, options);
  const reset: CraftingUpgradeState = {
    ...structuredClone(state),
    temperLevel: 0,
    masterworkRank: 0,
    temperXp: 0,
    masterworkXp: 0,
    damaged: false,
  };
  reset.history.push({
    id: `remains-${Date.now()}-${reset.history.length + 1}`,
    track: "remains" as never,
    fromLevel: breakdown.levelsConsumed,
    toLevel: 0,
    success: true,
    timestamp: Date.now(),
    playerId: "salvage",
    materialsSpent: [],
    currencySpent: 0,
    message: `Broken down into ${breakdown.materials.length} material types and ${breakdown.remains.length} remains`,
  });
  return { state: reset, breakdown };
}

/** Re-forge remains: exchange fragments for fresh crafting materials. */
export interface ReforgeRecipe {
  inputItemId: string;
  inputQuantity: number;
  outputs: MaterialCost[];
}

export const REFORGE_RECIPES: ReforgeRecipe[] = [
  { inputItemId: "forge-dust", inputQuantity: 10, outputs: [{ itemId: "tempering-stone", quantity: 5 }] },
  { inputItemId: "tempered-shards", inputQuantity: 8, outputs: [{ itemId: "refined-ore", quantity: 3 }, { itemId: "star-metal", quantity: 1 }] },
  { inputItemId: "masterwork-remnant", inputQuantity: 5, outputs: [{ itemId: "masterwork-core", quantity: 1 }, { itemId: "astral-core", quantity: 1 }] },
  { inputItemId: "relic-heart-fragment", inputQuantity: 5, outputs: [{ itemId: "primordial-ingot", quantity: 1 }, { itemId: "void-crystal", quantity: 1 }] },
  { inputItemId: "void-etched-remains", inputQuantity: 4, outputs: [{ itemId: "world-boss-heart", quantity: 1 }] },
];

export function reforge(recipe: ReforgeRecipe, heldQuantity: number): MaterialCost[] {
  if (heldQuantity < recipe.inputQuantity) throw new Error("INSUFFICIENT_REMAINS");
  return recipe.outputs.map((o) => ({ ...o }));
}
