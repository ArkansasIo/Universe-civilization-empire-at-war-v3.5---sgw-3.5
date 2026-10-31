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
const result=await service.upgrade({requestId:"smoke-1",playerId:"player-1",item,state,inventory:{materials:{"tempering-stone":2}},currency:500,track:"tempering"});
assert.equal(result.result.success,true);
assert.equal(result.state.temperLevel,1);
assert.equal(store.audit.length,1);
assert.equal(store.audit[0]?.track,"tempering");

// A never-upgraded item cannot skip levels by claiming a higher starting state.
const forged={...createCraftingUpgradeState(item),temperLevel:9};
await assert.rejects(()=>new CraftingService(new MemoryCraftingStateStore(),()=>0).upgrade({requestId:"smoke-forged",playerId:"player-2",item,state:forged,inventory:{materials:{"tempering-stone":99}},currency:1_000_000,track:"tempering"}),/stale/);
console.log("Crafting service smoke test passed",{temperLevel:result.state.temperLevel,version:result.state.version,auditEvents:store.audit.length});
