import type { ResourceWallet } from "./space-economy.js";
import { canAfford, spend, tickEconomy } from "./space-economy.js";
import type { Fleet } from "./fleet.js";
import { fleetPower } from "./fleet.js";
import type { ResearchState, ResearchId } from "./research.js";
import { canResearch, researchCost, completeResearch } from "./research.js";
export interface SpacePlayer { id:string; resources:ResourceWallet; research:ResearchState; fleetPower:number; }
export interface UpgradeResult { player:SpacePlayer; cost:Record<string,number>; }
export function applyResearch(player:SpacePlayer,id:ResearchId):UpgradeResult { if(!canResearch(player.research,id))throw new Error("research unavailable"); const cost=researchCost(id,(player.research[id]??0)+1); if(!canAfford(player.resources,cost))throw new Error("insufficient resources"); return {player:{...player,resources:spend(player.resources,cost),research:completeResearch(player.research,id)},cost}; }
export function refreshPlanetEconomy<T extends Parameters<typeof tickEconomy>[0]>(planet:T,now:number):T { return tickEconomy(planet,now) as T; }
export function recalculateFleetPower(player:SpacePlayer,fleet:Fleet):SpacePlayer { return {...player,fleetPower:fleetPower(fleet)}; }
