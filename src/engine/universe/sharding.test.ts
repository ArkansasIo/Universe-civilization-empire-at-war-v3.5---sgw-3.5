import { strict as assert } from "node:assert";
import { chunkAuthority, shardForChunk } from "./sharding";
import { neighboringGateways } from "./gatewayTopology";

const coord={galaxy:0,x:12,y:-3,z:8};
assert.equal(shardForChunk("SGW",coord,16),shardForChunk("SGW",coord,16));
assert.equal(chunkAuthority("SGW",coord,{universeId:"u1",shardCount:4}).shardId<4,true);
assert.equal(chunkAuthority("SGW",coord,{universeId:"u1",shardCount:4}).chunkId,"g0:c12,-3,8");

const gateways=neighboringGateways("SGW",coord,1);
for(const gateway of gateways){assert.notEqual(gateway.from,gateway.to);assert.ok(gateway.id.includes("gateway:"));}
console.log("universe sharding/gateway tests passed");
