import { clamp, finiteNonNegative, RANK_MULTIPLIERS, scaleEnemyDamage, scaleEnemyStats } from "./rules.js";
import type { EnemyDefinition, EnemyRank, StatBlock } from "./types.js";
export interface EncounterScaling { playerLevel:number; playerCount:number; difficultyMultiplier?:number; }
export function createScaledEnemy(enemy:EnemyDefinition,options:EncounterScaling):StatBlock {
  const levelDiff=options.playerLevel-enemy.level, tier=RANK_MULTIPLIERS[enemy.rank];
  const base=enemy.baseStats;
  const copy=structuredClone(base);
  const hp=base.resources.hp;
  if(hp) { hp.max=scaleEnemyStats(hp.max,levelDiff,tier,options.playerCount,options.difficultyMultiplier); hp.current=hp.max; }
  copy.derived.physicalPower=scaleEnemyDamage(base.derived.physicalPower,levelDiff,tier,options.playerCount,options.difficultyMultiplier);
  copy.derived.spellPower=scaleEnemyDamage(base.derived.spellPower,levelDiff,tier,options.playerCount,options.difficultyMultiplier);
  copy.derived.armor=scaleEnemyStats(base.derived.armor,levelDiff,Math.sqrt(tier),options.playerCount,options.difficultyMultiplier);
  copy.level=Math.max(1,Math.floor(options.playerLevel));
  return copy;
}
export interface AbilityContext { distance:number; targetHpPercent:number; cooldownReady:boolean; phaseAllowed:boolean; playerClusterSize:number; targetRole?:"tank"|"healer"|"dps"; }
export function abilityUtilityScore(context:AbilityContext,ability:{range:number;tags:string[];utilityWeights?:Record<string,number>}):number {
  const w=ability.utilityWeights??{};
  let score=(context.distance<=ability.range?1:-1)* (w.range??1);
  if(context.targetHpPercent<.25&&ability.tags.includes("execute"))score+=w.execute??2;
  if(context.cooldownReady)score+=w.cooldown??2;
  if(context.phaseAllowed)score+=w.phase??2;
  if(context.playerClusterSize>=3&&ability.tags.includes("aoe"))score+=w.cluster??1.5;
  if(context.targetRole==="healer"&&ability.tags.includes("interrupt"))score+=w.healer??1;
  return score;
}
export function chooseEnemyAbility<T extends {id:string;range:number;tags:string[];utilityWeights?:Record<string,number>}>(abilities:T[],context:AbilityContext,previousAbilityId?:string):T|undefined {
  return abilities.filter(a=>a.id!==previousAbilityId).sort((a,b)=>abilityUtilityScore(context,b)-abilityUtilityScore(context,a))[0];
}
export function isImmune(enemy:EnemyDefinition,statusTag:string):boolean { return enemy.immunities?.includes(statusTag)??false; }
export function rankMultiplier(rank:EnemyRank):number { return RANK_MULTIPLIERS[rank]; }
export function canSpawnEnemy(enemy:EnemyDefinition,zoneLevel:number):boolean {
  return Number.isFinite(zoneLevel)&&Math.abs(enemy.level-zoneLevel)<=Math.max(10,Math.floor(zoneLevel*.35));
}
export function enrageMultiplier(elapsedSeconds:number,enrageSeconds:number):number {
  if(enrageSeconds<=0)return 1;
  const progress=clamp(elapsedSeconds/enrageSeconds,0,1);
  return 1+progress*.75;
}
export function safeEnemyBaseValue(value:number):number { return finiteNonNegative(value); }
