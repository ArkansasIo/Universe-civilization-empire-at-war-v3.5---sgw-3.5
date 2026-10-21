import { strict as assert } from "node:assert";
import { generateProceduralUniverse, generationStats } from "./generator";
import { serializeUniverse, universeDigest } from "./serialization";
import { shortestPath, topologyIsConnected } from "./topology";
import { validateUniverse } from "./validator";
const config={seed:"SGW-UNIVERSE-TEST",galaxyCount:3,systemsPerGalaxy:18,minPlanetsPerSystem:2,maxPlanetsPerSystem:7,factionCount:5};
const a=generateProceduralUniverse(config);const b=generateProceduralUniverse(config);
assert.equal(serializeUniverse(a),serializeUniverse(b));assert.equal(universeDigest(a),universeDigest(b));assert.deepEqual(validateUniverse(a),[]);assert.equal(a.summary.galaxyCount,3);assert.equal(a.summary.systemCount,54);assert.equal(a.factions.length,5);
const systems=a.galaxies[0]!.systems;assert.equal(topologyIsConnected(systems),true);assert.ok(shortestPath(systems,systems[0]!.id,systems[systems.length-1]!.id).length>=2);
for(const faction of a.factions){const s=a.galaxies.flatMap(g=>g.systems).find(x=>x.id===faction.homeSystemId)!;const p=s.planets.find(x=>x.id===faction.homePlanetId)!;assert.equal(p.isHomeworld,true);assert.equal(p.hasStargate,true);assert.equal(p.biome,"terran");}
const c=generateProceduralUniverse({...config,seed:"SGW-DIFFERENT"});assert.notEqual(universeDigest(a),universeDigest(c));
const stats=generationStats(a);assert.equal(stats.galaxies,3);assert.equal(stats.systems,54);assert.equal(stats.factions,5);assert.ok(stats.planets>=108);
assert.throws(()=>generateProceduralUniverse({seed:1,galaxyCount:0}),RangeError);assert.throws(()=>generateProceduralUniverse({seed:1,maxPlanetsPerSystem:21}),RangeError);assert.throws(()=>generateProceduralUniverse({seed:1,minPlanetsPerSystem:8,maxPlanetsPerSystem:2}),RangeError);assert.throws(()=>generateProceduralUniverse({seed:1,anomalyChance:2}),RangeError);
console.log("procedural universe tests passed");
