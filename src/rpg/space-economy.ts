export type SpaceResource = "naquadah" | "metal" | "crystal" | "deuterium" | "energy" | "darkMatter";
export interface ResourceWallet { naquadah:number; metal:number; crystal:number; deuterium:number; energy:number; darkMatter:number; }
export interface ProductionBuilding { id:string; level:number; basePerHour:number; growth:number; energyUsePerHour:number; }
export interface PlanetEconomy { planetId:string; buildings:ProductionBuilding[]; resources:ResourceWallet; lastTickAt:number; }

export const ZERO_RESOURCES:ResourceWallet = { naquadah:0, metal:0, crystal:0, deuterium:0, energy:0, darkMatter:0 };

export function productionPerHour(building:ProductionBuilding):number {
  if (building.level < 0) throw new Error("building level cannot be negative");
  return building.basePerHour * Math.pow(building.growth, building.level);
}

export function tickEconomy(state:PlanetEconomy, now:number, maxHours=48):PlanetEconomy {
  if (now < state.lastTickAt) throw new Error("economy clock cannot move backwards");
  const hours = Math.min(maxHours, (now-state.lastTickAt)/3_600_000);
  const next = {...state, resources:{...state.resources}, lastTickAt:state.lastTickAt+hours*3_600_000};
  for (const building of state.buildings) {
    const amount=productionPerHour(building)*hours;
    const key = building.id.includes("metal") ? "metal" : building.id.includes("crystal") ? "crystal" : building.id.includes("deuterium") ? "deuterium" : building.id.includes("naquadah") ? "naquadah" : null;
    if (key) next.resources[key] += amount;
  }
  return next;
}

export function canAfford(wallet:ResourceWallet, cost:Partial<ResourceWallet>):boolean {
  return (Object.keys(cost) as SpaceResource[]).every(k => wallet[k] >= (cost[k] ?? 0));
}
export function spend(wallet:ResourceWallet, cost:Partial<ResourceWallet>):ResourceWallet {
  if (!canAfford(wallet,cost)) throw new Error("insufficient resources");
  const next={...wallet};
  for (const k of Object.keys(cost) as SpaceResource[]) next[k]-=cost[k] ?? 0;
  return next;
}
export function unitProductionCost(currentUnits:number):number { return currentUnits*5000+10000; }
export function naturalIncome(untrainedUnits:number, minersAndLifers:number):number { return untrainedUnits*20+minersAndLifers*80; }
export function bankCapacity(income:number):number { return income*48*1.5; }
