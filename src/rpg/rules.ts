import type { CoreAttribute, DerivedStats, EnemyRank, GameMode } from "./types.js";
export const DEFAULT_STAT_WEIGHTS:Record<string,{pve:number;pvp:number}> = {
  STR:{pve:1,pvp:1},DEX:{pve:1,pvp:1},CON:{pve:.85,pvp:.95},INT:{pve:1,pvp:1},WIS:{pve:.9,pvp:1},
  VIT:{pve:.85,pvp:1},SPI:{pve:.9,pvp:1},LCK:{pve:.45,pvp:.2},WIL:{pve:.8,pvp:1},CHA:{pve:.35,pvp:.3},
  critChance:{pve:2.5,pvp:1.25},critDamage:{pve:1.75,pvp:1.05},attackSpeed:{pve:2,pvp:1.2},
  cooldownReduction:{pve:2.25,pvp:1.1},armor:{pve:.75,pvp:1.1},magicResistance:{pve:.9,pvp:1.1},
};
export const MODE_MULTIPLIERS = {
  pve:{damage:1,critChance:1,critDamage:1,healing:1,cooldownReduction:1,armor:1,ccDuration:1},
  pvp:{damage:.7,critChance:.5,critDamage:.6,healing:.65,cooldownReduction:.5,armor:1.1,ccDuration:.4},
} as const;
export const RANK_MULTIPLIERS:Record<EnemyRank,number> = {
  normal:1,veteran:1.2,elite:2,champion:3,boss:8,raidBoss:40,mythic:80,ascended:120,
};
export const STAT_CAPS = {
  pve:{critChance:.70,cooldownReduction:.60,damageReduction:.70,ccDuration:1},
  pvp:{critChance:.40,cooldownReduction:.35,damageReduction:.70,ccDuration:.50,healingBonus:.50},
} as const;
export const clamp = (value:number,min:number,max:number):number => Math.min(max,Math.max(min,value));
export const finiteNonNegative = (value:number,label="value"):number => {
  if (!Number.isFinite(value)) throw new Error(label+" must be finite");
  return Math.max(0,value);
};
export function softCap(value:number,cap:number):number {
  if (value <= 0 || cap <= 0) return 0;
  return (value/(value+cap))*cap;
}
export function diminishingReturns(raw:number,cap:number,k:number):number {
  if (raw <= 0 || cap <= 0 || k <= 0) return 0;
  return cap*(1-Math.exp(-raw/k));
}
export function normalizeAttribute(value:number):number { return clamp(Math.floor(value),0,10000); }
export function statValuePower(raw:number,weight:number,softCapValue?:number):number {
  const n=finiteNonNegative(raw,"raw stat"), w=finiteNonNegative(weight,"stat weight");
  return (softCapValue && softCapValue>0 ? softCap(n,softCapValue) : n)*w;
}
export function getModeMultiplier(mode:GameMode,key:keyof typeof MODE_MULTIPLIERS.pvp):number {
  return MODE_MULTIPLIERS[mode][key];
}
export function deriveStats(a:Record<CoreAttribute,number>,gear:Partial<DerivedStats>={}):DerivedStats {
  const d:DerivedStats = {
    physicalPower:a.STR*2.5+a.DEX*.4, spellPower:a.INT*2.7+a.WIS*.5, healingPower:a.WIS*2+a.SPI,
    armor:a.CON*1.5+a.STR*.25, magicResistance:a.WIS*1.3+a.WIL*.5,
    maxHP:a.VIT*15+a.CON*10, hpRegen:a.VIT*.08+a.SPI*.05, maxMP:a.INT*8+a.WIS*5+a.SPI*3,
    mpRegen:a.WIS*.08+a.SPI*.12, maxStamina:a.CON*8+a.DEX*3, staminaRegen:a.CON*.05+a.WIL*.03,
    accuracy:a.DEX*1.8+a.WIS*.2, evasion:a.DEX*1.4+a.LCK*.3, armorPenetration:a.STR*.35+a.DEX*.25,
    magicPenetration:a.INT*.35+a.WIL*.25, attackSpeed:1+a.DEX*.005, castSpeed:1+a.INT*.004,
    critChance:clamp(a.DEX*.0004+a.LCK*.0008,0,.70),critDamage:.5+a.STR*.002+a.LCK*.003,
    blockChance:clamp(a.CON*.001+a.STR*.0005,0,.75),blockValue:a.STR*.8+a.CON*.5,
    parryChance:clamp(a.DEX*.0007,0,.65),dodgeChance:clamp(a.DEX*.0005+a.LCK*.0003,0,.60),
    tenacity:a.WIL*.6+a.CON*.2,poise:a.CON*1.3+a.STR*.3,moveSpeed:600+a.DEX*.4,
    cooldownReduction:clamp(a.INT*.001+a.SPI*.0005,0,.60),damageReduction:0,shieldPower:a.SPI*1.4+a.INT*.3,threatMultiplier:1+a.CHA*.01,
  };
  for (const key of Object.keys(gear) as (keyof DerivedStats)[]) d[key]=Math.max(0,d[key]+(gear[key]??0));
  d.critChance=clamp(d.critChance,0,.70); d.cooldownReduction=clamp(d.cooldownReduction,0,.60);
  d.damageReduction=clamp(d.damageReduction,0,.70); return d;
}
export function requiredXp(level:number):number {
  if (!Number.isInteger(level)||level<1) throw new Error("level must be an integer >= 1");
  return Math.floor(Math.pow(level,2.5)*500);
}
export function scaleEnemyStats(base:number,levelDiff:number,tierMultiplier:number,partySize:number,difficultyMultiplier=1):number {
  const levels=clamp(levelDiff,-20,100), party=Math.max(1,Math.floor(partySize));
  return finiteNonNegative(base)*Math.max(.2,1+.18*levels)*Math.max(.1,tierMultiplier)*
    (1+(party-1)*.65)*Math.max(.1,difficultyMultiplier);
}
export function scaleEnemyDamage(base:number,levelDiff:number,tierMultiplier:number,partySize:number,difficultyMultiplier=1):number {
  const levels=clamp(levelDiff,-20,100), party=Math.max(1,Math.floor(partySize));
  return finiteNonNegative(base)*Math.max(.2,1+.12*levels)*Math.max(.1,tierMultiplier)*
    Math.pow(1+(party-1)*.15,.6)*Math.max(.1,difficultyMultiplier);
}
