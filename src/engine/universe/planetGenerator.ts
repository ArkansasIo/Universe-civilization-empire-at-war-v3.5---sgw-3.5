import type { GeneratedPlanet, ResourceDeposit, PlanetBiome, SizeClass } from "./types";
import { BIOMES, HABITABILITY, RESOURCES } from "./constants";
import { hashCombine, mulberry32, pick, randomInt } from "./rng";
import { planetName } from "./names";
const sizes:readonly SizeClass[]=["small","standard","large","super"];
const capacity:Record<SizeClass,number>={small:4_000_000_000,standard:12_000_000_000,large:30_000_000_000,super:90_000_000_000};
function deposits(r:()=>number):ResourceDeposit[]{const values=[...RESOURCES];for(let i=values.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[values[i],values[j]]=[values[j]!,values[i]!];}return values.slice(0,randomInt(r,1,4)).map(type=>{const abundance=randomInt(r,5,100);return{type,abundance,richness:abundance>=90?"exceptional":abundance>=70?"high":abundance>=45?"moderate":abundance>=20?"low":"trace"};});}
export function generatePlanet(seed:number|string,g:number,s:number,p:number,homeworld:boolean,stargateChance:number):GeneratedPlanet{
 const r=mulberry32(hashCombine(seed,"planet",g,s,p));const biome:PlanetBiome=homeworld?"terran":pick(r,BIOMES);const sizeClass:SizeClass=homeworld?"large":pick(r,sizes);const habitability=homeworld?95:Math.max(0,Math.min(100,HABITABILITY[biome]+randomInt(r,-15,15)));
 return{id:`planet-g${g+1}-s${s+1}-p${p+1}`,index:p+1,name:planetName(seed,g,s,p),biome,habitability,sizeClass,orbitalDistance:Math.round((.4+(p+1)*(.35+r()*.3))*1000)/1000,populationCapacity:capacity[sizeClass],resources:deposits(r),hasStargate:homeworld||r()<stargateChance,isHomeworld:homeworld};
}
