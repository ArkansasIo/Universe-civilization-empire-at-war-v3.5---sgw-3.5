import type { LootTable } from "./types.js";

export { STARTER_LOOT_TABLES } from "./catalog.js";

export interface LootRollOptions { luck?: number; difficultyMultiplier?: number; noDeathBonus?: number; random?: () => number; alreadyUnique?: Set<string>; pityCount?: number; }
export interface LootDrop { itemId: string; quantity: number; }
const safeRoll = (random: () => number) => Math.min(.999999999, Math.max(0, random()));
export function rollLoot(table: LootTable, options: LootRollOptions = {}): LootDrop[] {
  const random = options.random ?? Math.random, luck = Math.min(100, Math.max(0, options.luck ?? 0));
  if (table.pity && (options.pityCount ?? 0) >= table.pity.threshold) return [{ itemId: table.pity.guaranteedItemId, quantity: 1 }];
  const entries = table.entries.filter(e => e.weight > 0 && Number.isFinite(e.weight) && !(e.uniquePerReset && options.alreadyUnique?.has(e.itemId)));
  if (entries.length === 0) return [];
  const luckFactor = 1 + luck / 500, diff = Math.max(.1, options.difficultyMultiplier ?? 1), noDeath = Math.max(0, options.noDeathBonus ?? 0);
  const weights = entries.map(e => e.weight * luckFactor * diff * (1 + noDeath));
  const total = weights.reduce((a, b) => a + b, 0);
  let cursor = safeRoll(random) * total;
  for (let i = 0; i < entries.length; i++) {
    cursor -= weights[i];
    if (cursor <= 0) {
      const e = entries[i], min = Math.max(1, Math.floor(e.minQuantity ?? 1)), max = Math.max(min, Math.floor(e.maxQuantity ?? min));
      const quantity = min + Math.floor(safeRoll(random) * (max - min + 1));
      return [{ itemId: e.itemId, quantity }];
    }
  }
  const fallback = entries[entries.length - 1];
  return [{ itemId: fallback.itemId, quantity: Math.max(1, Math.floor(fallback.minQuantity ?? 1)) }];
}
