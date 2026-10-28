import assert from "node:assert/strict";
import { STARTER_ITEMS } from "../src/rpg/catalog.js";
import { createCraftingUpgradeState } from "../src/rpg/tempering.js";
import { CraftingService } from "../src/rpg/crafting-service.js";
import { MemoryCraftingStateStore } from "../src/rpg/crafting-persistence.js";

const item=STARTER_ITEMS[0];
if(!item)throw new Error("starter item missing");
const state=createCraftingUpgradeState(item);
const store=new MemoryCraftingStateStore();
const service=new CraftingService(store,()=>0);

// A client must not be able to create a fresh item already fully tempered.
await assert.rejects(
  service.upgrade({
    requestId:"forged-state",
    playerId:"player-1",
    item,
    state:{...state,temperLevel:10},
    inventory:{materials:{"tempering-stone":100,"refined-ore":100,"star-metal":100,"astral-core":100,"primordial-ingot":100}},
    currency:1_000_000,
    track:"tempering",
  }),
  /stale or invalid/,
);
assert.equal(await store.load("player-1",item.id),null,"rejected forged state must not be persisted");
assert.equal(store.audit.length,0,"rejected forged state must not create an audit event");

const result=await service.upgrade({requestId:"smoke-1",playerId:"player-1",item,state,inventory:{materials:{"tempering-stone":2}},currency:500,track:"tempering"});
assert.equal(result.result.success,true);
assert.equal(result.state.temperLevel,1);
assert.equal(result.state.version,1);
assert.equal(store.audit.length,1);
assert.equal(store.audit[0]?.track,"tempering");

// A replay with stale client state must be rejected after the authoritative level changes.
await assert.rejects(
  service.upgrade({requestId:"stale-state",playerId:"player-1",item,state,inventory:{materials:{"tempering-stone":2}},currency:500,track:"tempering"}),
  /stale or invalid/,
);
assert.equal((await store.load("player-1",item.id))?.temperLevel,1,"stale request must not change persisted progress");
assert.equal(store.audit.length,1,"stale request must not append audit");

console.log("Crafting service smoke test passed",{temperLevel:result.state.temperLevel,version:result.state.version,auditEvents:store.audit.length});
