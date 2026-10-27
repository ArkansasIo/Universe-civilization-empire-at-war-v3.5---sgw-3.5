import type { ResourceWallet } from "./space-economy.js";
import { SHIPS, type ShipDefinition } from "./fleet.js";

export interface FleetBuildOrder { id:string; planetId:string; shipId:string; quantity:number; queuedAt:number; completesAt:number; cost:ResourceWallet; }
export interface ShipyardState { planetId:string; shipyardLevel:number; queue:FleetBuildOrder[]; }

export function shipCost(shipId:string,quantity:number):ResourceWallet {
  const ship=SHIPS[shipId]; if(!ship) throw new Error("unknown ship");
  const c=ship.cost;
  return {metal:(c.metal??0)*quantity,crystal:(c.crystal??0)*quantity,deuterium:(c.deuterium??0)*quantity,naquadah:(c.naquadah??0)*quantity,energy:0,darkMatter:0};
}

export function shipBuildTime(shipId:string,quantity:number,shipyardLevel:number):number {
  const ship=SHIPS[shipId]; if(!ship) throw new Error("unknown ship");
  return Math.max(1,Math.ceil(ship.buildTime*quantity/Math.max(1,shipyardLevel)));
}

export function queueShips(planetId:string,shipId:string,quantity:number,shipyardLevel:number,now:number):FleetBuildOrder {
  if(quantity<1) throw new Error("quantity must be positive");
  const duration=shipBuildTime(shipId,quantity,shipyardLevel);
  return {id:`ship-${planetId}-${shipId}-${now}`,planetId,shipId,quantity,queuedAt:now,completesAt:now+duration*1000,cost:shipCost(shipId,quantity)};
}
