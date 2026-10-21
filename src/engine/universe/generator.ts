import type { GeneratedGalaxy, GeneratedUniverse, UniverseGenerationConfig, GenerationStats } from "./types";
import { GALAXY_SHAPES, RESOURCES } from "./constants";
import { normalizeConfig } from "./config";
import { hashCombine, mulberry32, pick, randomInt } from "./rng";
import { galaxyName } from "./names";
import { boundsOf } from "./geometry";
import { generateSystem } from "./systemGenerator";
import { connectNearestSystems } from "./topology";
import { generateFactions } from "./factionGenerator";
import { assertValidUniverse } from "./validator";
export function generateProceduralUniverse(input:UniverseGenerationConfig):GeneratedUniverse{
 const c=normalizeConfig(input);const seed=typeof c.seed==="number"?c.seed>>>0:hashCombine(c.seed);const r=mulberry32(seed);const factions=generateFactions(seed,Math.min(c.factionCount!,c.galaxyCount!*c.systemsPerGalaxy!));let cursor=0;let planetTotal=0;let anomalyTotal=0;const galaxies:GeneratedGalaxy[]=[];
 for(let g=0;g<c.galaxyCount!;g++){const shape=pick(r,GALAXY_SHAPES);const dominantResource=pick(r,RESOURCES);const position={x:Math.round((r()-.5)*12000*1000)/1000,y:Math.round((r()-.5)*3000*1000)/1000,z:Math.round((r()-.5)*12000*1000)/1000};const systems=[];
  for(let s=0;s<c.systemsPerGalaxy!;s++){const factionIndex=cursor<factions.length?cursor:-1;const system=generateSystem({seed,galleryIndex:g,galaxyIndex:g,systemIndex:s,systemCount:c.systemsPerGalaxy!,shape,radius:c.galaxyRadius!,minPlanets:c.minPlanetsPerSystem!,maxPlanets:c.maxPlanetsPerSystem!,anomalyChance:c.anomalyChance!,stargateChance:c.stargateChance!,homeworld:factionIndex>=0,factionId:factionIndex>=0?factions[factionIndex]!.id:null});systems.push(system);planetTotal+=system.planets.length;anomalyTotal+=system.anomalies.length;cursor++;}
  connectNearestSystems(systems,3);galaxies.push({id:`galaxy-${String(g+1).padStart(3,"0")}`,index:g+1,name:galaxyName(g),shape,position,radius:c.galaxyRadius!,bounds:boundsOf(systems.map(s=>s.position)),systemCount:systems.length,dominantResource,dangerLevel:randomInt(r,0,9),systems});
 }
 const allSystems=galaxies.flatMap(g=>g.systems);const completedFactions=factions.map((f,i)=>{const home=allSystems[i]!;const planet=home.planets[0]!;return{...f,homeSystemId:home.id,homePlanetId:planet.id};});const universe:GeneratedUniverse={schemaVersion:c.generatorVersion??2,seed,name:c.universeName?.trim()||"The Aetherion Expanse",generatedAt:new Date(0).toISOString(),summary:{galaxyCount:galaxies.length,systemCount:allSystems.length,planetCount:planetTotal,factionCount:completedFactions.length,anomalyCount:anomalyTotal},galaxies,factions:completedFactions};assertValidUniverse(universe);return universe;
}
export function generationStats(u:GeneratedUniverse):GenerationStats{const systems=u.galaxies.flatMap(g=>g.systems);const planets=systems.flatMap(s=>s.planets);const resources={naquadah:0,metal:0,crystal:0,deuterium:0,"dark-matter":0};let stargates=0;for(const p of planets){if(p.hasStargate)stargates++;for(const d of p.resources)resources[d.type]+=d.abundance;}return{galaxies:u.galaxies.length,systems:systems.length,planets:planets.length,anomalies:systems.reduce((n,s)=>n+s.anomalies.length,0),factions:u.factions.length,homeworlds:u.factions.length,stargates,resources};}
