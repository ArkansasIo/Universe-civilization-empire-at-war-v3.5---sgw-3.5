import { strict as assert } from "node:assert";
import { generateProceduralUniverse, validateGeneratedUniverse } from "./proceduralUniverse";

const config = { seed: "sgw-regression-seed", galaxyCount: 3, systemsPerGalaxy: 12, factionCount: 4 };
const first = generateProceduralUniverse(config);
const second = generateProceduralUniverse(config);

assert.equal(JSON.stringify(first), JSON.stringify(second), "Identical seed/config must generate identical output.");
assert.equal(first.summary.galaxyCount, 3);
assert.equal(first.summary.systemCount, 36);
assert.equal(first.factions.length, 4);
assert.deepEqual(validateGeneratedUniverse(first), []);

const different = generateProceduralUniverse({ ...config, seed: "different-seed" });
assert.notEqual(JSON.stringify(first.galaxies.map((g) => g.position)), JSON.stringify(different.galaxies.map((g) => g.position)));

assert.throws(() => generateProceduralUniverse({ seed: 1, galaxyCount: 0 }), RangeError);
assert.throws(() => generateProceduralUniverse({ seed: 1, galaxyCount: 251 }), RangeError);
assert.throws(() => generateProceduralUniverse({ seed: 1, minPlanetsPerSystem: 9, maxPlanetsPerSystem: 2 }), RangeError);

const homeworlds = first.factions.map((faction) => {
  const system = first.galaxies.flatMap((g) => g.systems).find((s) => s.id === faction.homeSystemId)!;
  return system.planets.find((p) => p.id === faction.homePlanetId)!;
});
assert.equal(homeworlds.length, 4);
assert.ok(homeworlds.every((planet) => planet.isHomeworld && planet.hasStargate && planet.biome === "terran"));

console.log("procedural universe generation: all tests passed");
