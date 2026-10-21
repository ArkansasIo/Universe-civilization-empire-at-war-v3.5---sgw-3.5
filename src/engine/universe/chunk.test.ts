import { strict as assert } from "node:assert";
import { chunkId, neighboringChunks, worldToChunk } from "./chunk";
import { generateChunk } from "./chunkGenerator";
import { UniverseChunkStreamer } from "./streaming";

const a=generateChunk("SGW-CHUNK-TEST",{galaxy:0,x:2,y:-1,z:4});
const b=generateChunk("SGW-CHUNK-TEST",{galaxy:0,x:2,y:-1,z:4});
assert.deepEqual(a,b);
assert.equal(a.id,chunkId(a.coord));
assert.equal(worldToChunk({x:801,y:-1,z:1600},0,400).x,2);
assert.equal(neighboringChunks({galaxy:0,x:0,y:0,z:0},1).length,27);

const streamer=new UniverseChunkStreamer({generate:(coord)=>generateChunk("STREAM",coord)});
const first=streamer.update({galaxy:0,x:0,y:0,z:0});
assert.equal(first.loaded.length,125);
assert.equal(streamer.size(),125);
const second=streamer.update({galaxy:0,x:10,y:0,z:0});
assert.ok(second.unloaded.length>0);
assert.ok(streamer.size()>0);
console.log("universe chunk tests passed");
