import type { CoreAttributes, Combatant, DerivedStats, Resources } from './types';
import { calculateMaxHp, clamp } from './formulas';

export type ClassId = 'warrior' | 'ranger' | 'mage' | 'cleric' | 'rogue' | 'commander';
export type ProgressionState = { level:number; xp:number; skillPoints:number; talentPoints:number; attributes:CoreAttributes };

export const XP_TABLE: Record<number, number> = Object.fromEntries(Array.from({length:100}, (_,i)=>[i+1, Math.floor(Math.pow(i+1,2.5)*500)]));
export const CLASS_BASE_STATS: Record<ClassId, Partial<DerivedStats>> = {
  warrior:{attackPower:24,armor:40,blockChance:.08,poise:20}, ranger:{attackPower:28,accuracy:.12,evasion:.08,critChance:.06,moveSpeed:.08},
  mage:{spellPower:32,magicPenetration:10,castSpeed:.08}, cleric:{spellPower:20,healingPower:30,magicResistance:25},
  rogue:{attackPower:26,evasion:.12,critChance:.1,attackSpeed:.12,armorPenetration:8}, commander:{attackPower:22,armor:25,accuracy:.08,tenacity:15},
};

export function xpToNextLevel(level:number):number { return XP_TABLE[Math.max(1,level)] ?? Math.floor(Math.pow(level,2.5)*500); }
export function addExperience(state:ProgressionState, amount:number):ProgressionState {
  let next={...state,xp:Math.max(0,state.xp+Math.max(0,amount))};
  while(next.level<100 && next.xp>=xpToNextLevel(next.level)){ next.xp-=xpToNextLevel(next.level); next.level++; next.skillPoints+=1; next.talentPoints+=1; }
  return next;
}
export function buildResources(attributes:CoreAttributes, gearHp=0, gearMp=0):Resources {
  const maxHp=calculateMaxHp(attributes.vit,attributes.con,gearHp); const maxMp=Math.max(1,Math.floor(attributes.int*8+attributes.wis*4+gearMp));
  const maxStamina=Math.max(1,Math.floor(attributes.con*5+attributes.dex*3)); return {hp:maxHp,maxHp,mp:maxMp,maxMp,stamina:maxStamina,maxStamina};
}
export function applyClassBaseStats(stats:DerivedStats,classId:ClassId,level:number):DerivedStats {
  const result={...stats}; const base=CLASS_BASE_STATS[classId]; for(const [key,value] of Object.entries(base)){(result as any)[key]=((result as any)[key]??0)+(value??0)*Math.max(1,level)/10;} return result;
}
export function attributeGrowth(level:number,classId:ClassId):CoreAttributes {
  const base={str:10,dex:10,con:10,int:10,wis:10,vit:10,spi:10,lck:10,wil:10,cha:10};
  const focus:Record<ClassId,Partial<CoreAttributes>>={warrior:{str:3,vit:3,con:2},ranger:{dex:3,lck:2,wil:1},mage:{int:3,wis:2,spi:2},cleric:{wis:3,spi:2,con:1},rogue:{dex:3,lck:2,str:1},commander:{cha:3,wil:2,con:1}};
  for(const [k,v] of Object.entries(focus[classId])) (base as any)[k]+=(v??0)*Math.max(0,level-1);
  return base;
}
export function normalizeCombatant(combatant:Combatant):Combatant { return {...combatant,level:clamp(combatant.level,1,100)}; }
