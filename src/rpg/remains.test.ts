import assert from "node:assert/strict";
import { STARTER_ITEMS } from "./catalog.js";
import { createCraftingUpgradeState, attemptUpgrade, DEFAULT_TEMPERING_CONFIG } from "./tempering.js";
import { computeRemains, breakDownItem, reforge, REFORGE_RECIPES, REMAINS_TIERS } from "./remains.js";

const item = STARTER_ITEMS[0];
const base = createCraftingUpgradeState(item);
const wallet = { currency: 1_000_000, materials: { "tempering-stone": 999, "refined-ore": 99, "warding-rune": 99, "masterwork-seal": 99, "repair-kit": 5 } };

// Upgrade to temper 4 (protection used at 4) — invested: 2+3+4+5 stones + ore + rune
let state = base;
for (const level of [1, 2, 3, 4]) {
  const rule = DEFAULT_TEMPERING_CONFIG.levels.find((l) => l.level === level)!;
  const result = attemptUpgrade({ item, state, wallet, playerId: "t", track: "tempering", rules: rule, roll: 0.01, useProtection: level >= 4, timestamp: level });
  state = result.state;
}
assert.equal(state.temperLevel, 4);

const preview = computeRemains(item, state);
assert.ok(preview.materials.some((m) => m.itemId === "tempering-stone" && m.quantity >= 6), "stones refunded");
assert.ok(preview.materials.some((m) => m.itemId === "refined-ore"), "mid-tier materials refunded");
assert.ok(preview.remains.some((r) => r.itemId === "forge-dust"), "forge dust produced");
assert.ok(!preview.remains.some((r) => r.itemId === "masterwork-remnant"), "level 4 too low for masterwork remnants");
assert.equal(preview.levelsConsumed, 4);

// Undamaged items refund more than damaged ones
const damaged = computeRemains(item, { ...state, damaged: true });
const intact = computeRemains(item, state);
const damagedStones = damaged.materials.find((m) => m.itemId === "tempering-stone")!.quantity;
const intactStones = intact.materials.find((m) => m.itemId === "tempering-stone")!.quantity;
assert.ok(intactStones > damagedStones, "intact bonus applies");

// Breakdown resets the state and logs history
const broken = breakDownItem(item, state);
assert.equal(broken.state.temperLevel, 0);
assert.equal(broken.state.masterworkRank, 0);
assert.equal(broken.state.damaged, false);
assert.equal(broken.state.history[broken.state.history.length - 1].track, "remains");
assert.ok(broken.breakdown.materials.length > 0);

// High-level item unlocks every remains tier
let deep = createCraftingUpgradeState(item);
for (const level of [1, 2, 3]) {
  const rule = DEFAULT_TEMPERING_CONFIG.levels.find((l) => l.level === level)!;
  deep = attemptUpgrade({ item, state: deep, wallet, playerId: "t", track: "tempering", rules: rule, roll: 0.01, timestamp: level }).state;
}
const deepRemains = computeRemains(item, { ...deep, temperLevel: 50, masterworkRank: 20 });
const tierIds = new Set(deepRemains.remains.map((r) => r.itemId));
assert.ok(tierIds.has("relic-heart-fragment"), "tier 50 fragment drops");
assert.ok(!tierIds.has("void-etched-remains"), "tier 75 fragment gated");

// Reforge
const recipe = REFORGE_RECIPES[0];
assert.deepEqual(reforge(recipe, 10), recipe.outputs);
assert.throws(() => reforge(recipe, 9), /INSUFFICIENT_REMAINS/);
assert.equal(REMAINS_TIERS.length, 5);

console.log("Remains system tests passed");
