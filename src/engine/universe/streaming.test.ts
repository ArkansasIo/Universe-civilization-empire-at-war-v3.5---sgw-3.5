import { strict as assert } from "node:assert";
import { generateChunk } from "./chunkGenerator";
import { MemoryChunkStore, ExplorationState, UniverseChunkStreamer } from "./streaming";

const store=new MemoryChunkStore<ReturnType<typeof generateChunk>>();
const streamer=new UniverseChunkStreamer({generate:coord=>generateChunk("STREAMING",coord)},{chunkSize:400,sectorSizeInChunks:8,loadRadius:1,unloadRadius:2,generatorVersion:1,maxCachedChunks:64},store);
const first=streamer.update({galaxy:0,x:0,y:0,z:0});
assert.equal(first.loaded.length,27);
assert.equal(streamer.size(),27);
const repeat=streamer.update({galaxy:0,x:0,y:0,z:0});
assert.equal(repeat.loaded.length,0);
assert.ok(streamer.stats().cacheHits>0);
const moved=streamer.update({galaxy:0,x:5,y:0,z:0});
assert.ok(moved.loaded.length>0);
assert.ok(moved.unloaded.length>0);
assert.equal(streamer.stats().cacheMisses>0,true);
await streamer.persistAll();
const restored=new UniverseChunkStreamer({generate:coord=>generateChunk("STREAMING",coord)},{chunkSize:400,sectorSizeInChunks:8,loadRadius:1,unloadRadius:2,generatorVersion:1,maxCachedChunks:64},store);
assert.equal(await restored.restore({galaxy:0,x:0,y:0,z:0}),true);
assert.deepEqual(restored.get({galaxy:0,x:0,y:0,z:0}),generateChunk("STREAMING",{galaxy:0,x:0,y:0,z:0}));

const fog=new ExplorationState();
fog.discover("tau-ri",{galaxy:0,x:1,y:2,z:3},100);
assert.equal(fog.isDiscovered("tau-ri",{galaxy:0,x:1,y:2,z:3}),true);
assert.equal(fog.isDiscovered("goauld",{galaxy:0,x:1,y:2,z:3}),false);
assert.equal(fog.recordsFor("tau-ri")[0]?.discoveredTick,100);
console.log("universe streaming tests passed");
