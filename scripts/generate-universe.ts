import { writeFileSync } from "node:fs";
import { generateProceduralUniverse, generationStats, serializeUniverse } from "../src/engine/universe";
const seed=process.argv[2]??process.env.UNIVERSE_SEED??"SGW-LOCAL-001";
const out=process.argv[3]??"generated/universe.json";
const universe=generateProceduralUniverse({seed,universeName:"Empire at War Procedural Sandbox",galaxyCount:6,systemsPerGalaxy:24,factionCount:6,minPlanetsPerSystem:2,maxPlanetsPerSystem:8});
writeFileSync(out,serializeUniverse(universe,true));
console.log(JSON.stringify({output:out,seed,stats:generationStats(universe)},null,2));
