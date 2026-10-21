import type { GeneratedStarSystem, GalaxyShape, StarClass, AnomalyType } from "./types";
import { STAR_CLASSES, STAR_TEMPERATURE, ANOMALIES } from "./constants";
import { chance, hashCombine, mulberry32, pick, randomInt } from "./rng";
import { galaxySystemPosition } from "./geometry";
import { systemName } from "./names";
import { generatePlanet } from "./planetGenerator";
export interface SystemOptions { seed:number|string; galaxyIndex:number; systemIndex:number; systemCount:number; shape:GalaxyShape; radius:number; minPlanets:number; maxPlanets:number; anomalyChance:number; stargateChance:number; homeworld:boolean; factionId:string|null; }
export function generateSystem(o:SystemOptions):GeneratedStarSystem{
 const r=mulberry32(hashCombine(o.seed,"system-data",o.galaxyIndex,o.systemIndex));const starClass:StarClass=pick(r,STAR_CLASSES);const count=randomInt(r,o.minPlanets,o.maxPlanets);
 const planets=Array.from({length:count},(_,p)=>generatePlanet(o.seed,o.galaxyIndex,o.systemIndex,p,o.homeworld&&p===0,o.stargateChance));const anomalies:AnomalyType[]=chance(r,o.anomalyChance)?[pick(r,ANOMALIES)]:[];
 return{id:`galaxy-${String(o.galaxyIndex+1).padStart(3,"0")}-system-${String(o.systemIndex+1).padStart(5,"0")}`,index:o.systemIndex+1,name:systemName(o.seed,o.galaxyIndex,o.systemIndex),position:galaxySystemPosition(o.shape,o.radius,r,o.systemIndex,o.systemCount),starClass,starTemperatureKelvin:STAR_TEMPERATURE[starClass],dangerLevel:randomInt(r,0,9),controllingFactionId:o.factionId,planets,anomalies,links:[]};
}
