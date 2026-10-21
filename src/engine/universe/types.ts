export type GalaxyShape = "spiral" | "barred-spiral" | "elliptical" | "ring" | "irregular" | "nebula";
export type StarClass = "O" | "B" | "A" | "F" | "G" | "K" | "M" | "X";
export type PlanetBiome = "terran" | "oceanic" | "desert" | "tundra" | "volcanic" | "jungle" | "toxic" | "barren" | "ice" | "crystalline" | "radiated" | "shattered";
export type ResourceType = "naquadah" | "metal" | "crystal" | "deuterium" | "dark-matter";
export type AnomalyType = "ancient-ruins" | "wormhole" | "derelict-fleet" | "precursor-beacon" | "spatial-rift" | "resource-rich-nebula";
export type FactionArchetype = "industrial" | "scientific" | "military" | "exploration" | "ancient" | "raider";
export type SizeClass = "small" | "standard" | "large" | "super";
export interface Vec3 { x:number; y:number; z:number; }
export interface Bounds3 { min:Vec3; max:Vec3; }
export interface ResourceDeposit { type:ResourceType; abundance:number; richness:"trace"|"low"|"moderate"|"high"|"exceptional"; }
export interface UniverseGenerationConfig { seed:number|string; generatorVersion?:number; universeName?:string; galaxyCount?:number; systemsPerGalaxy?:number; minPlanetsPerSystem?:number; maxPlanetsPerSystem?:number; factionCount?:number; galaxyRadius?:number; galaxySeparation?:number; anomalyChance?:number; stargateChance?:number; homeworldCount?:number; }
export interface GeneratedPlanet { id:string; index:number; name:string; biome:PlanetBiome; habitability:number; sizeClass:SizeClass; orbitalDistance:number; populationCapacity:number; resources:ResourceDeposit[]; hasStargate:boolean; isHomeworld:boolean; }
export interface GeneratedStarSystem { id:string; index:number; name:string; position:Vec3; starClass:StarClass; starTemperatureKelvin:number; dangerLevel:number; controllingFactionId:string|null; planets:GeneratedPlanet[]; anomalies:AnomalyType[]; links:string[]; }
export interface GeneratedGalaxy { id:string; index:number; name:string; shape:GalaxyShape; position:Vec3; radius:number; bounds:Bounds3; systemCount:number; dominantResource:ResourceType; dangerLevel:number; systems:GeneratedStarSystem[]; }
export interface GeneratedFaction { id:string; name:string; archetype:FactionArchetype; color:string; homeSystemId:string; homePlanetId:string; startingResources:Record<ResourceType,number>; expansionBias:number; }
export interface GeneratedUniverse { schemaVersion:number; seed:number; name:string; generatedAt:string; summary:{galaxyCount:number;systemCount:number;planetCount:number;factionCount:number;anomalyCount:number}; galaxies:GeneratedGalaxy[]; factions:GeneratedFaction[]; }
export interface GenerationStats { galaxies:number; systems:number; planets:number; anomalies:number; factions:number; homeworlds:number; stargates:number; resources:Record<ResourceType,number>; }
