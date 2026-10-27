export type ID = string;
export type Race = 'asgard' | 'goauld' | 'replicator' | 'tauri' | 'tollan';
export type ResourceType = 'naquadah' | 'metal' | 'crystal' | 'deuterium' | 'energy' | 'darkMatter';
export type FleetOrderType = 'move' | 'attack' | 'defend' | 'colonize' | 'recall' | 'gateTravel';
export interface Resources { naquadah:number; metal:number; crystal:number; deuterium:number; energy:number; darkMatter:number; }
export interface Coordinates { galaxy:number; system:number; planet:number; }
export interface PlayerState { id:ID; commanderName:string; race:Race; turns:number; maxTurns:number; resources:Resources; bankedNaquadah:number; researchPoints:number; }
export interface PlanetState { id:ID; ownerId:ID|null; name:string; coordinates:Coordinates; population:number; maxPopulation:number; fields:number; buildings:Record<string,number>; resources:Resources; }
export interface FleetState { id:ID; ownerId:ID; name:string; ships:Record<string,number>; location:Coordinates; destination?:Coordinates; order:FleetOrderType; departureAt?:number; arrivalAt?:number; }
export interface GameState { version:number; turn:number; serverTime:number; seed:string; generationVersion:number; players:Record<ID,PlayerState>; planets:Record<ID,PlanetState>; fleets:Record<ID,FleetState>; }
