import assert from "node:assert/strict";
import { MemoryCraftingStateStore } from "./crafting-persistence.js";
import { CraftingService } from "./crafting-service.js";
import { createCraftingUpgradeState } from "./tempering.js";
import { STARTER_ITEMS } from "./catalog.js";

const item = STARTER_ITEMS[0];
if (!item) throw new Error("Starter item missing");

const state = createCraftingUpgradeState(item);
const store = new MemoryCraftingStateStore();
const service = new CraftingService(store, () => 0.01);

const first = await service.upgrade({
  requestId: "test-temper-1",
  playerId: "player-1",
  item,
  state,
  inventory: { materials: { "tempering-stone": 10 } },
  currency: 5000,
  track: "tempering",
  timestamp: 1000,
});

assert.equal(first.result.success, true);
assert.equal(first.state.temperLevel, 1);
assert.equal(first.state.ownerId, "player-1");
assert.equal(first.state.version, 1);
assert.equal(first.result.wallet.currency, 4500);
assert.equal(first.result.wallet.materials["tempering-stone"], 8);
assert.equal(store.getAuditEvents().length, 1);

await assert.rejects(
  () => service.upgrade({
    requestId: "test-stale",
    playerId: "player-1",
    item,
    state,
    inventory: { materials: { "tempering-stone": 10 } },
    currency: 5000,
    track: "tempering",
  }),
  /stale/,
);

console.log("crafting-service smoke test passed");
