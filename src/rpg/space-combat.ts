import type { Fleet, BattleResult } from "./fleet.js";
import { SHIPS, resolveFleetBattle, fleetPower } from "./fleet.js";

export interface DefenseGrid { ownerId:string; shield:number; weapons:number; hull:number; }
export interface DebrisField { metal:number; crystal:number; createdAt:number; expiresAt:number; }
export interface CombatReport { result:BattleResult; attackerPower:number; defenderPower:number; debris:DebrisField; }

export function resolveSpaceCombat(attacker:Fleet, defender:Fleet, now=Date.now()):CombatReport {
  const result=resolveFleetBattle(attacker,defender);
  const attackerPower=fleetPower(attacker), defenderPower=fleetPower(defender);
  const destroyedA=result.attackerLosses, destroyedD=result.defenderLosses;
  const debris={metal:Math.floor((destroyedA+destroyedD)*350),crystal:Math.floor((destroyedA+destroyedD)*150),createdAt:now,expiresAt:now+7*24*3600*1000};
  return {result,attackerPower,defenderPower,debris};
}

export function estimateFleetValue(fleet:Fleet):number {
  return Object.entries(fleet.ships).reduce((sum,[id,count])=>{const c=SHIPS[id]?.cost??{}; return sum+count*Object.values(c).reduce((a,b)=>a+b,0);},0);
}
