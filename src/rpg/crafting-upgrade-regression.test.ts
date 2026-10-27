import assert from "node:assert/strict";
import { STARTER_ITEMS } from "./catalog.js";
import { calculateUpgradeCost, executeServerUpgrade, previewUpgrade } from "./crafting.js";
import { createCraftingUpgradeState, DEFAULT_TEMPERING_CONFIG, attemptUpgrade, type CraftingWallet } from "./tempering.js";
import { previewMasterwork } from "./masterworking.js";

const item = STARTER_ITEMS[0];
if (!item) throw new Error("Starter item missing");

const initialState = createCraftingUpgradeState(item);
const wallet: CraftingWallet = {
  currency: 1_000_000,
  materials: {
    "tempering-stone": 100,
    "refined-ore": 20,
    "star-metal": 20,
    "astral-core": 20,
    "primordial-ingot": 20,
    "masterwork-core": 20,
    "void-crystal": 20,
    "world-boss-heart": 5,
    "warding-rune": 20,
    "greater-warding-rune": 20,
    "masterwork-seal": 20,
  },
};

function test(name: string, run: () => void): void {
  run();
  console.log(`✓ ${name}`);
}

test("preview exposes the next temper level and material cost", () => {
  const preview = previewUpgrade(item, initialState, "tempering");
  assert.equal(preview.currentLevel, 0);
  assert.equal(preview.nextLevel, 1);
  assert.equal(preview.successChance, 1);
  assert.equal(preview.materials[0]?.itemId, "tempering-stone");
});

test("successful tempering increments state and consumes exact materials", () => {
  const result = executeServerUpgrade({
    item, state: initialState, wallet, playerId: "crafting-test",
    track: "tempering", roll: 0.01, timestamp: 1,
  });
  assert.equal(result.success, true);
  assert.equal(result.state.temperLevel, 1);
  assert.equal(result.wallet.currency, 999_500);
  assert.equal(result.wallet.materials["tempering-stone"], 98);
  assert.equal(result.state.history.length, 1);
});

test("failed protected tempering consumes protection but preserves the level", () => {
  const state = { ...initialState, temperLevel: 5 };
  const result = attemptUpgrade({
    item, state, wallet, playerId: "crafting-test", track: "tempering",
    rules: DEFAULT_TEMPERING_CONFIG.levels[5]!, roll: 0.99,
    useProtection: true, timestamp: 2,
  });
  assert.equal(result.success, false);
  assert.equal(result.state.temperLevel, 5);
  assert.equal(result.wallet.materials["warding-rune"], 20);
  assert.equal(result.wallet.materials["greater-warding-rune"], 19);
  assert.ok(result.state.history[0]?.message.includes("preserved"));
});

test("failed unprotected tempering applies configured downgrade", () => {
  const state = { ...initialState, temperLevel: 6 };
  const result = attemptUpgrade({
    item, state, wallet, playerId: "crafting-test", track: "tempering",
    rules: DEFAULT_TEMPERING_CONFIG.levels[6]!, roll: 0.99,
    timestamp: 3,
  });
  assert.equal(result.success, false);
  assert.equal(result.state.temperLevel, 4);
});

test("upgrade attempts reject mismatched item state, locked items, damaged items and invalid rolls", () => {
  assert.throws(() => attemptUpgrade({
    item, state: { ...initialState, itemId: "another-item" }, wallet, playerId: "p",
    track: "tempering", rules: DEFAULT_TEMPERING_CONFIG.levels[0]!, roll: 0,
  }), /does not match item/);
  assert.throws(() => attemptUpgrade({
    item, state: { ...initialState, locked: true }, wallet, playerId: "p",
    track: "tempering", rules: DEFAULT_TEMPERING_CONFIG.levels[0]!, roll: 0,
  }), /locked/);
  assert.throws(() => attemptUpgrade({
    item, state: { ...initialState, damaged: true }, wallet, playerId: "p",
    track: "tempering", rules: DEFAULT_TEMPERING_CONFIG.levels[0]!, roll: 0,
  }), /damaged/);
  assert.throws(() => attemptUpgrade({
    item, state: initialState, wallet, playerId: "p",
    track: "tempering", rules: DEFAULT_TEMPERING_CONFIG.levels[0]!, roll: 1,
  }), /roll must be/);
});

test("insufficient material or currency rejects without mutating caller inputs", () => {
  const poorWallet: CraftingWallet = { currency: 0, materials: { "tempering-stone": 0 } };
  const before = structuredClone(poorWallet);
  assert.throws(() => executeServerUpgrade({
    item, state: initialState, wallet: poorWallet, playerId: "p",
    track: "tempering", roll: 0,
  }), /Insufficient/);
  assert.deepEqual(poorWallet, before);
  assert.equal(initialState.temperLevel, 0);
});

test("masterworking enforces item level gate and consumes configured materials on success", () => {
  const temper10 = { ...initialState, temperLevel: 10 };
  const preview = previewMasterwork(item, temper10, true);
  assert.equal(preview.nextRank, 1);
  assert.equal(preview.eligible, true);
  assert.equal(preview.protectedMaterials[0]?.itemId, "masterwork-seal");
  const result = executeServerUpgrade({
    item, state: temper10, wallet, playerId: "crafting-test",
    track: "masterworking", roll: 0.01, timestamp: 4,
  });
  assert.equal(result.success, true);
  assert.equal(result.state.masterworkRank, 1);
  assert.equal(result.wallet.materials["masterwork-core"], 19);
});

test("cost estimation returns cumulative material and currency totals", () => {
  const cost = calculateUpgradeCost("tempering", 10);
  assert.ok(cost.currency > 0);
  assert.ok(cost.materials.some((material) => material.itemId === "primordial-ingot"));
});

test("default crafting configuration remains complete", () => {
  assert.equal(DEFAULT_TEMPERING_CONFIG.levels.length, 10);
  assert.equal(DEFAULT_TEMPERING_CONFIG.masterworkRanks.length, 5);
});

console.log("Crafting tempering/masterworking regression tests passed.");
