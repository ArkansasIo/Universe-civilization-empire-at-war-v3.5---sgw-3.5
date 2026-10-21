import { generateProceduralUniverse, validateGeneratedUniverse } from "../src/engine/proceduralUniverse";

const universe = generateProceduralUniverse({
  seed: process.env.UNIVERSE_SEED ?? "sgw-local-development",
  universeName: "Empire at War — Local Sandbox",
  galaxyCount: 4,
  systemsPerGalaxy: 16,
  factionCount: 6,
});
const errors = validateGeneratedUniverse(universe);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    name: universe.name,
    seed: universe.seed,
    ...universe.summary,
    factions: universe.factions.map(({ id, name, homeSystemId, homePlanetId }) => ({ id, name, homeSystemId, homePlanetId })),
  }, null, 2));
}
