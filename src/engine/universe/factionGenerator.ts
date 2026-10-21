import type { GeneratedFaction, FactionArchetype, ResourceType } from "./types";
import { ARCHETYPES, FACTION_COLORS, FACTION_NAMES } from "./constants";
import { hashCombine, mulberry32, randomFloat } from "./rng";
const START={naquadah:50_000,metal:125_000,crystal:80_000,deuterium:65_000,"dark-matter":250} satisfies Record<ResourceType,number>;
export function generateFactions(seed:number|string,count:number):Omit<GeneratedFaction,"homeSystemId"|"homePlanetId">[]{return Array.from({length:count},(_,i)=>{const r=mulberry32(hashCombine(seed,"faction",i));const archetype:FactionArchetype=ARCHETYPES[i%ARCHETYPES.length]!;return{id:`faction-${String(i+1).padStart(3,"0")}`,name:FACTION_NAMES[i%FACTION_NAMES.length]!,archetype,color:FACTION_COLORS[i%FACTION_COLORS.length]!,startingResources:{...START},expansionBias:Math.round(randomFloat(r,.75,1.25)*1000)/1000};});}
