import type { ResourceWallet } from "./space-economy.js";

export type BuildingId =
  | "metal-mine" | "crystal-mine" | "deuterium-synthesizer" | "solar-plant" | "fusion-reactor"
  | "metal-storage" | "crystal-storage" | "deuterium-tank" | "robotics-factory" | "shipyard"
  | "research-lab" | "nanite-factory" | "terraformer" | "alliance-depot" | "moon-base"
  | "sensor-phalanx" | "jump-gate";

export interface BuildingDefinition {
  id: BuildingId;
  name: string;
  maxLevel: number;
  baseCost: ResourceWallet;
  costMultiplier: number;
  baseBuildSeconds: number;
  prerequisites: Partial<Record<BuildingId, number>>;
}

export interface PlanetBuildingState { buildingId: BuildingId; level: number; }
export interface ConstructionOrder { id: string; planetId: string; buildingId: BuildingId; targetLevel: number; cost: ResourceWallet; startedAt: number; completesAt: number; }

const r = (metal=0, crystal=0, deuterium=0, naquadah=0): ResourceWallet => ({ metal, crystal, deuterium, naquadah, energy: 0, darkMatter: 0 });

export const PLANET_BUILDINGS: Record<BuildingId, BuildingDefinition> = {
  "metal-mine": { id:"metal-mine", name:"Metal Mine", maxLevel:50, baseCost:r(60,15), costMultiplier:1.5, baseBuildSeconds:60, prerequisites:{} },
  "crystal-mine": { id:"crystal-mine", name:"Crystal Mine", maxLevel:50, baseCost:r(48,24), costMultiplier:1.6, baseBuildSeconds:90, prerequisites:{} },
  "deuterium-synthesizer": { id:"deuterium-synthesizer", name:"Deuterium Synthesizer", maxLevel:50, baseCost:r(225,75), costMultiplier:1.5, baseBuildSeconds:120, prerequisites:{} },
  "solar-plant": { id:"solar-plant", name:"Solar Plant", maxLevel:50, baseCost:r(75,30), costMultiplier:1.5, baseBuildSeconds:90, prerequisites:{} },
  "fusion-reactor": { id:"fusion-reactor", name:"Fusion Reactor", maxLevel:50, baseCost:r(900,360,180), costMultiplier:1.8, baseBuildSeconds:180, prerequisites:{"deuterium-synthesizer":5,"research-lab":3} },
  "metal-storage": { id:"metal-storage", name:"Metal Storage", maxLevel:20, baseCost:r(1000), costMultiplier:2, baseBuildSeconds:120, prerequisites:{} },
  "crystal-storage": { id:"crystal-storage", name:"Crystal Storage", maxLevel:20, baseCost:r(1000,500), costMultiplier:2, baseBuildSeconds:150, prerequisites:{} },
  "deuterium-tank": { id:"deuterium-tank", name:"Deuterium Tank", maxLevel:20, baseCost:r(1000,1000), costMultiplier:2, baseBuildSeconds:180, prerequisites:{} },
  "robotics-factory": { id:"robotics-factory", name:"Robotics Factory", maxLevel:20, baseCost:r(400,120,200), costMultiplier:2, baseBuildSeconds:180, prerequisites:{} },
  "shipyard": { id:"shipyard", name:"Shipyard", maxLevel:20, baseCost:r(400,200,100), costMultiplier:2, baseBuildSeconds:240, prerequisites:{"robotics-factory":2} },
  "research-lab": { id:"research-lab", name:"Research Laboratory", maxLevel:20, baseCost:r(200,400,200), costMultiplier:2, baseBuildSeconds:240, prerequisites:{} },
  "nanite-factory": { id:"nanite-factory", name:"Nanite Factory", maxLevel:10, baseCost:r(1_000_000,500_000,100_000), costMultiplier:2, baseBuildSeconds:3600, prerequisites:{"robotics-factory":10,"research-lab":10} },
  "terraformer": { id:"terraformer", name:"Terraformer", maxLevel:20, baseCost:r(50_000,100_000,25_000), costMultiplier:2, baseBuildSeconds:7200, prerequisites:{"research-lab":12,"fusion-reactor":12} },
  "alliance-depot": { id:"alliance-depot", name:"Alliance Depot", maxLevel:20, baseCost:r(20_000,40_000), costMultiplier:2, baseBuildSeconds:1800, prerequisites:{"shipyard":2} },
  "moon-base": { id:"moon-base", name:"Moon Base", maxLevel:20, baseCost:r(10_000,20_000,10_000), costMultiplier:2, baseBuildSeconds:1800, prerequisites:{} },
  "sensor-phalanx": { id:"sensor-phalanx", name:"Sensor Phalanx", maxLevel:20, baseCost:r(20_000,40_000,20_000), costMultiplier:2, baseBuildSeconds:2400, prerequisites:{"moon-base":1} },
  "jump-gate": { id:"jump-gate", name:"Jump Gate", maxLevel:1, baseCost:r(2_000_000,4_000_000,2_000_000), costMultiplier:1, baseBuildSeconds:86400, prerequisites:{"moon-base":1,"research-lab":7} }
};

export function getBuildingCost(id: BuildingId, targetLevel: number): ResourceWallet {
  const d=PLANET_BUILDINGS[id]; if(targetLevel<1||targetLevel>d.maxLevel) throw new Error("invalid target level");
  const scale=Math.pow(d.costMultiplier,targetLevel-1);
  return { metal:Math.floor(d.baseCost.metal*scale), crystal:Math.floor(d.baseCost.crystal*scale), deuterium:Math.floor(d.baseCost.deuterium*scale), naquadah:Math.floor(d.baseCost.naquadah*scale), energy:0, darkMatter:0 };
}

export function hasPrerequisites(buildings: PlanetBuildingState[], id: BuildingId): boolean {
  const levels=new Map(buildings.map(b=>[b.buildingId,b.level]));
  return Object.entries(PLANET_BUILDINGS[id].prerequisites).every(([required,level]) => (levels.get(required as BuildingId) ?? 0) >= (level ?? 0));
}

export function constructionTime(id: BuildingId, targetLevel: number, roboticsLevel=0, naniteLevel=0): number {
  const base=PLANET_BUILDINGS[id].baseBuildSeconds*Math.pow(0.5,roboticsLevel)*Math.pow(0.5,naniteLevel);
  return Math.max(1,Math.floor(base*Math.pow(0.95,targetLevel-1)));
}

export function createConstructionOrder(planetId:string, id:BuildingId, currentLevel:number, now:number, roboticsLevel=0, naniteLevel=0):ConstructionOrder {
  const target=currentLevel+1; const cost=getBuildingCost(id,target); const duration=constructionTime(id,target,roboticsLevel,naniteLevel);
  return { id:`build-${planetId}-${id}-${target}-${now}`, planetId, buildingId:id, targetLevel:target, cost, startedAt:now, completesAt:now+duration*1000 };
}
