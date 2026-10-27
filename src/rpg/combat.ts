import { clamp, finiteNonNegative, getModeMultiplier, MODE_MULTIPLIERS, STAT_CAPS } from "./rules.js";
import type { Combatant, DamageRequest, DamageResult, DamageType, GameMode, StatBlock } from "./types.js";
export function hitChance(accuracy:number,evasion:number):number {
  const a=finiteNonNegative(accuracy), e=finiteNonNegative(evasion);
  return clamp(a/(a+e||1),.05,.95);
}
export function armorMitigation(armor:number,attackerLevel:number,k=75):number {
  return clamp(finiteNonNegative(armor)/(finiteNonNegative(armor)+Math.max(1,k*attackerLevel)),0,.85);
}
export function getResistance(stats:StatBlock,type:DamageType):number {
  return clamp(stats.resistances[type]??0,-.5,.90);
}
export function resolveDamage(req:DamageRequest,roll=Math.random()):DamageResult {
  const {attacker,defender,mode}=req;
  const raw=finiteNonNegative(req.baseDamage)*finiteNonNegative(req.skillCoefficient??1);
  const armor= req.damageType==="physical" ? armorMitigation(Math.max(0,defender.stats.derived.armor-attacker.stats.derived.armorPenetration),attacker.stats.level) : 0;
  let afterArmor=raw*(1-armor);
  const flat=Math.max(0,defender.stats.flatResistances?.[req.damageType]??0);
  afterArmor=Math.max(0,afterArmor-flat);
  const resistance=getResistance(defender.stats,req.damageType);
  let afterResistance=afterArmor*(1-resistance);
  const pvp=mode==="pvp" || req.isPvp===true;
  if(pvp) afterResistance*=MODE_MULTIPLIERS.pvp.damage;
  let critical=false;
  const critChance=clamp(attacker.stats.derived.critChance*(pvp?MODE_MULTIPLIERS.pvp.critChance:1),0,STAT_CAPS[mode].critChance);
  if(req.canCrit!==false && roll<critChance) { critical=true; afterResistance*=1+attacker.stats.derived.critDamage*(pvp?MODE_MULTIPLIERS.pvp.critDamage:1); }
  const blocked=(defender.stats.derived.blockChance>0 && roll>=critChance && roll<critChance+defender.stats.derived.blockChance);
  if(blocked) afterResistance=Math.max(0,afterResistance-defender.stats.derived.blockValue);
  if(req.isBossTarget) afterResistance=Math.max(0,afterResistance);
  const finalDamage=Math.round(afterResistance*100)/100;
  return {raw,afterArmor,afterResistance,finalDamage,critical,blocked};
}
export function applyDamage(target:Combatant,amount:number):number {
  const hp=target.stats.resources.hp; if(!hp || !target.alive) return 0;
  const actual=Math.min(hp.current,finiteNonNegative(amount)); hp.current=Math.max(0,hp.current-actual);
  if(hp.current<=0) target.alive=false;
  return actual;
}
export function resolveHealing(base:number,power:number,bonusPercent:number,reductionPercent:number,mode:GameMode):number {
  const m=mode==="pvp"?MODE_MULTIPLIERS.pvp.healing:1;
  return Math.max(0,base+power)*(1+clamp(bonusPercent,0,.5))* (1-clamp(reductionPercent,0,.9))*m;
}
export function addThreat(target:Combatant,sourceId:string,damage:number,healing=0,threatMultiplier=1,flat=0):number {
  const amount=Math.max(0,damage+healing*.5)*Math.max(0,threatMultiplier)+Math.max(0,flat);
  target.threat[sourceId]=(target.threat[sourceId]??0)+amount;
  return target.threat[sourceId];
}
export function highestThreatTarget(combatant:Combatant):string|undefined {
  return Object.entries(combatant.threat).sort((a,b)=>b[1]-a[1])[0]?.[0];
}
export function combatContextMultiplier(mode:GameMode):number { return getModeMultiplier(mode,"damage"); }
