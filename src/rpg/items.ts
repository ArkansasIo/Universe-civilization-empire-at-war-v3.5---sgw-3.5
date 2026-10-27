import { clamp, finiteNonNegative, MODE_MULTIPLIERS, STAT_CAPS, statValuePower, DEFAULT_STAT_WEIGHTS } from "./rules.js";
import type { GameMode, ItemDefinition, ItemModeProfile, StatBlock } from "./types.js";
export function getItemProfile(item:ItemDefinition,mode:GameMode):ItemModeProfile { return mode==="pve"?item.pve:item.pvp; }
export function effectiveItemStats(item:ItemDefinition,mode:GameMode) {
  const p=getItemProfile(item,mode);
  return {baseDamage:Math.max(0,p.baseDamage??0),armor:Math.max(0,p.armor??0),magicResistance:Math.max(0,p.magicResistance??0),
    stats:p.stats??{},damageBonuses:p.damageBonuses??{},bossDamageBonus:mode==="pve"?Math.max(0,p.bossDamageBonus??0):0,
    pvpPower:mode==="pvp"?Math.max(0,p.pvpPower??0):0,pvpResilience:mode==="pvp"?Math.max(0,p.pvpResilience??0):0,
    antiHeal:mode==="pvp"?clamp(p.antiHeal??0,0,.5):0,ccDurationScale:mode==="pvp"?clamp(p.ccDurationScale??.4,0,.5):1};
}
export function calculateItemPower(item:ItemDefinition,mode:GameMode):number {
  const p=getItemProfile(item,mode);
  let value=0;
  const bonuses=p.stats;
  if(bonuses?.attributes) for(const [key,raw] of Object.entries(bonuses.attributes)) {
    const weight=DEFAULT_STAT_WEIGHTS[key]?.[mode]??1;
    value+=statValuePower(raw??0,weight);
  }
  if(bonuses?.derived) for(const [key,raw] of Object.entries(bonuses.derived)) {
    const weight=DEFAULT_STAT_WEIGHTS[key]?.[mode]??1;
    value+=statValuePower(raw??0,weight);
  }
  value+=(p.baseDamage??0)*(mode==="pve"?1:.7);
  value+=(p.armor??0)*(mode==="pve"?.75:.825);
  value+=(p.magicResistance??0)*(mode==="pve"?.9:.99);
  value+=(p.pvpPower??0)+(p.pvpResilience??0)*1.5;
  value+=(p.bossDamageBonus??0)*100;
  for(const effect of p.procEffects??[]) value+=Math.abs(effect.magnitude)*Math.min(1,Math.max(0,effect.durationSeconds/10))*(mode==="pvp"?.5:1);
  return Math.round(value*100)/100;
}
export function validateItem(item:ItemDefinition):string[] {
  const errors:string[]=[];
  if(!item.id.trim())errors.push("Item id is required");
  if(!item.name.trim())errors.push("Item name is required");
  if(!Number.isInteger(item.requiredLevel)||item.requiredLevel<1)errors.push("requiredLevel must be an integer >= 1");
  if(!Number.isFinite(item.itemLevel)||item.itemLevel<1)errors.push("itemLevel must be >= 1");
  if(!Number.isFinite(item.value)||item.value<0)errors.push("value must be finite and non-negative");
  if(item.pvp.bossDamageBonus)errors.push("Boss damage bonuses are PvE-only; do not add them to PvP profiles");
  return errors;
}
export function normalizePvpStats(stats:StatBlock):StatBlock {
  const copy=structuredClone(stats);
  copy.derived.critChance=clamp(copy.derived.critChance*MODE_MULTIPLIERS.pvp.critChance,0,STAT_CAPS.pvp.critChance);
  copy.derived.cooldownReduction=clamp(copy.derived.cooldownReduction*MODE_MULTIPLIERS.pvp.cooldownReduction,0,STAT_CAPS.pvp.cooldownReduction);
  copy.derived.damageReduction=clamp(copy.derived.damageReduction,0,STAT_CAPS.pvp.damageReduction);
  copy.pvpPower=copy.pvpPower??0; copy.pvpResilience=copy.pvpResilience??0;
  return copy;
}
export function saleValue(item:ItemDefinition,quantity=1):number {
  return Math.floor(finiteNonNegative(item.value)*clamp(Math.floor(quantity),1,item.stackLimit??999));
}
