import { strict as assert } from "node:assert";
import { generateChunk } from "./chunkGenerator";
import { deriveChunkSeed } from "./chunkSeed";
import { UniverseChunkStreamer } from "./streaming";

const coord={galaxy:2,x:-4,y:7,z:1};
assert.equal(deriveChunkSeed("A",coord),deriveChunkSeed("A",coord));
assert.notEqual(deriveChunkSeed("A",coord),deriveChunkSeed("B",coord));
assert.deepEqual(generateChunk("A",coord),generateChunk("A",coord));

const streamer=new UniverseChunkStreamer({generate:c=>generateChunk("STREAM-TEST",c)});
const initial=streamer.update({galaxy:0,x:0,y:0,z:0});
assert.equal(initial.loaded.length,125);
const moved=streamer.update({galaxy:0,x:6,y:0,z:0});
assert.ok(moved.loaded.length>0);
assert.ok(moved.unloaded.length>0);
assert.equal(streamer.has({galaxy:0,x:0,y:0,z:0}),false);
console.log("chunk streaming tests passed");
