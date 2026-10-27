import { clamp, finiteNonNegative } from "./rules.js";
import type { ItemDefinition, ItemModeProfile, StatBonuses } from "./types.js";

export type CraftingTrack = "tempering" | "masterworking";
export type UpgradeFailurePolicy = "retain" | "downgrade" | "damage" | "destroy";
export interface MaterialCost { itemId:string; quantity:number; }
export interface CraftingWallet { currency:number; materials:Record<string,number>; }
export interface TemperingLevel {
  level:number; currencyCost:number; materials:MaterialCost[]; successChance:number;
  statMultiplier:number; failurePolicy:UpgradeFailurePolicy; downgradeLevels?:number;
  protectionMaterialId?:string; protectionMaterialQuantity?:number;
}
export interface MasterworkRank {
  rank:number; currencyCost:number; materials:MaterialCost[]; successChance:number;
  statMultiplier:number; bonusStat?:keyof NonNullable<StatBonuses["derived"]>;
  bonusStatAmount?:number; unlockLevel:number; failurePolicy:UpgradeFailurePolicy;
  downgradeRanks?:number; protectionMaterialId?:string; protectionMaterialQuantity?:number;
}
export interface CraftingUpgradeState {
  itemId:string; temperLevel:number; masterworkRank:number; temperXp:number; masterworkXp:number;
  maxTemperLevel:number; maxMasterworkRank:number; damaged:boolean; locked:boolean;
  history:UpgradeHistoryEntry[];
}
export interface UpgradeHistoryEntry {
  id:string; track:CraftingTrack; fromLevel:number; toLevel:number; success:boolean; timestamp:number;
  playerId:string; materialsSpent:MaterialCost[]; currencySpent:number; message:string;
}
export interface UpgradeRequest {
  item:ItemDefinition; state:CraftingUpgradeState; wallet:CraftingWallet; playerId:string;
  track:CraftingTrack; rules:TemperingLevel|MasterworkRank; roll:number; timestamp?:number;
  useProtection?:boolean; mode?:GameMode;
}
export interface UpgradeResult {
  success:boolean; state:CraftingUpgradeState; wallet:CraftingWallet; item:ItemDefinition;
  currencySpent:number; materialsSpent:MaterialCost[]; message:string;
}
export interface TemperingConfig { levels:TemperingLevel[]; masterworkRanks:MasterworkRank[]; }

export const DEFAULT_TEMPERING_CONFIG:TemperingConfig = {
  levels:[
    {level:1,currencyCost:500,materials:[{itemId:"tempering-stone",quantity:2}],successChance:1,statMultiplier:1.03,failurePolicy:"retain"},
    {level:2,currencyCost:900,materials:[{itemId:"tempering-stone",quantity:3}],successChance:.95,statMultiplier:1.06,failurePolicy:"retain"},
    {level:3,currencyCost:1500,materials:[{itemId:"tempering-stone",quantity:4},{itemId:"refined-ore",quantity:1}],successChance:.9,statMultiplier:1.09,failurePolicy:"retain"},
    {level:4,currencyCost:2400,materials:[{itemId:"tempering-stone",quantity:5},{itemId:"refined-ore",quantity:2}],successChance:.85,statMultiplier:1.12,failurePolicy:"downgrade",downgradeLevels:1,protectionMaterialId:"warding-rune",protectionMaterialQuantity:1},
    {level:5,currencyCost:3600,materials:[{itemId:"tempering-stone",quantity:6},{itemId:"star-metal",quantity:1}],successChance:.8,statMultiplier:1.16,failurePolicy:"downgrade",downgradeLevels:1,protectionMaterialId:"warding-rune",protectionMaterialQuantity:1},
    {level:6,currencyCost:5200,materials:[{itemId:"tempering-stone",quantity:7},{itemId:"star-metal",quantity:2}],successChance:.72,statMultiplier:1.20,failurePolicy:"downgrade",downgradeLevels:1,protectionMaterialId:"greater-warding-rune",protectionMaterialQuantity:1},
    {level:7,currencyCost:7500,materials:[{itemId:"tempering-stone",quantity:8},{itemId:"star-metal",quantity:3}],successChance:.65,statMultiplier:1.25,failurePolicy:"downgrade",downgradeLevels:2,protectionMaterialId:"greater-warding-rune",protectionMaterialQuantity:1},
    {level:8,currencyCost:10500,materials:[{itemId:"tempering-stone",quantity:10},{itemId:"astral-core",quantity:1}],successChance:.58,statMultiplier:1.30,failurePolicy:"downgrade",downgradeLevels:2,protectionMaterialId:"masterwork-seal",protectionMaterialQuantity:1},
    {level:9,currencyCost:14500,materials:[{itemId:"tempering-stone",quantity:12},{itemId:"astral-core",quantity:2}],successChance:.5,statMultiplier:1.36,failurePolicy:"downgrade",downgradeLevels:2,protectionMaterialId:"masterwork-seal",protectionMaterialQuantity:1},
    {level:10,currencyCost:20000,materials:[{itemId:"tempering-stone",quantity:15},{itemId:"primordial-ingot",quantity:1}],successChance:.42,statMultiplier:1.43,failurePolicy:"downgrade",downgradeLevels:3,protectionMaterialId:"masterwork-seal",protectionMaterialQuantity:1},
  ],
  masterworkRanks:[
    {rank:1,unlockLevel:10,currencyCost:10000,materials:[{itemId:"masterwork-core",quantity:1},{itemId:"star-metal",quantity:3}],successChance:.85,statMultiplier:1.05,bonusStat:"physicalPower",bonusStatAmount:10,failurePolicy:"retain"},
    {rank:2,unlockLevel:20,currencyCost:25000,materials:[{itemId:"masterwork-core",quantity:2},{itemId:"astral-core",quantity:2}],successChance:.75,statMultiplier:1.10,bonusStat:"physicalPower",bonusStatAmount:20,failurePolicy:"downgrade",downgradeRanks:1,protectionMaterialId:"masterwork-seal",protectionMaterialQuantity:1},
    {rank:3,unlockLevel:30,currencyCost:50000,materials:[{itemId:"masterwork-core",quantity:3},{itemId:"primordial-ingot",quantity:2}],successChance:.65,statMultiplier:1.16,bonusStat:"critChance",bonusStatAmount:.01,failurePolicy:"downgrade",downgradeRanks:1,protectionMaterialId:"masterwork-seal",protectionMaterialQuantity:1},
    {rank:4,unlockLevel:40,currencyCost:90000,materials:[{itemId:"masterwork-core",quantity:4},{itemId:"void-crystal",quantity:2}],successChance:.55,statMultiplier:1.23,bonusStat:"physicalPower",bonusStatAmount:35,failurePolicy:"downgrade",downgradeRanks:1,protectionMaterialId:"masterwork-seal",protectionMaterialQuantity:2},
    {rank:5,unlockLevel:50,currencyCost:150000,materials:[{itemId:"masterwork-core",quantity:5},{itemId:"world-boss-heart",quantity:1}],successChance:.45,statMultiplier:1.32,bonusStat:"critDamage",bonusStatAmount:.05,failurePolicy:"downgrade",downgradeRanks:2,protectionMaterialId:"masterwork-seal",protectionMaterialQuantity:2},
  ],
};

export function createCraftingUpgradeState(item:ItemDefinition):CraftingUpgradeState {
  return {itemId:item.id,temperLevel:0,masterworkRank:0,temperXp:0,masterworkXp:0,maxTemperLevel:10,maxMasterworkRank:5,damaged:false,locked:false,history:[]};
}
function clone<T>(value:T):T { return structuredClone(value); }
function costAvailable(wallet:CraftingWallet,currency:number,materials:MaterialCost[]):boolean {
  return wallet.currency>=currency && materials.every(m=>Number.isFinite(m.quantity)&&m.quantity>=0&&(wallet.materials[m.itemId]??0)>=m.quantity);
}
function spend(wallet:CraftingWallet,currency:number,materials:MaterialCost[]):CraftingWallet {
  const out=clone(wallet); out.currency-=currency;
  for(const m of materials) out.materials[m.itemId]=(out.materials[m.itemId]??0)-m.quantity;
  return out;
}
function combineMaterials(cost:MaterialCost[],protection?:MaterialCost):MaterialCost[] {
  const map=new Map<string,number>();
  for(const m of [...cost,...(protection?[protection]:[])]) map.set(m.itemId,(map.get(m.itemId)??0)+m.quantity);
  return [...map].map(([itemId,quantity])=>({itemId,quantity}));
}
function scaleProfile(profile:ItemModeProfile,multiplier:number):ItemModeProfile {
  const out=clone(profile);
  for(const key of ["baseDamage","armor","magicResistance","pvpPower","pvpResilience"] as const) if(out[key]!==undefined) out[key]=out[key]!*multiplier;
  if(out.stats?.attributes) for(const key of Object.keys(out.stats.attributes) as (keyof NonNullable<StatBonuses["attributes"]>)[]) {
    out.stats.attributes[key]=out.stats.attributes[key]!*multiplier;
  }
  if(out.stats?.derived) for(const key of Object.keys(out.stats.derived) as (keyof NonNullable<StatBonuses["derived"]>)[]) {
    out.stats.derived[key]=out.stats.derived[key]!*multiplier;
  }
  return out;
}
/** Calculate effective item profiles from base item data; never repeatedly multiplies an already-upgraded profile. */
export function applyUpgradeBonuses(base:ItemDefinition,state:CraftingUpgradeState,config:TemperingConfig=DEFAULT_TEMPERING_CONFIG):ItemDefinition {
  const item=clone(base);
  const temper=config.levels.find(x=>x.level===state.temperLevel);
  const master=config.masterworkRanks.find(x=>x.rank===state.masterworkRank);
  const multiplier=(temper?.statMultiplier??1)*(master?.statMultiplier??1);
  item.pve=scaleProfile(base.pve,multiplier);
  item.pvp=scaleProfile(base.pvp,multiplier);
  if(master?.bonusStat&&master.bonusStatAmount) {
    for(const profile of [item.pve,item.pvp]) {
      profile.stats=profile.stats??{};
      profile.stats.derived=profile.stats.derived??{};
      profile.stats.derived[master.bonusStat]=(profile.stats.derived[master.bonusStat]??0)+master.bonusStatAmount;
    }
  }
  return item;
}
function upgradeRule(request:UpgradeRequest):TemperingLevel|MasterworkRank|undefined {
  return request.track==="tempering"
    ? (request.rules as TemperingLevel)
    : (request.rules as MasterworkRank);
}
export function attemptUpgrade(request:UpgradeRequest):UpgradeResult {
  const state=clone(request.state), wallet=clone(request.wallet);
  const item=clone(request.item), rules=upgradeRule(request);
  if(!rules) throw new Error("Upgrade rule is required");
  if(state.itemId!==item.id) throw new Error("Upgrade state does not match item");
  if(state.locked) throw new Error("Item is locked for crafting");
  if(state.damaged) throw new Error("Item is damaged; repair it before upgrading");
  if(!Number.isFinite(request.roll)||request.roll<0||request.roll>=1) throw new Error("roll must be in [0, 1)");
  const current=request.track==="tempering"?state.temperLevel:state.masterworkRank;
  const next=request.track==="tempering"?(rules as TemperingLevel).level:(rules as MasterworkRank).rank;
  const cap=request.track==="tempering"?state.maxTemperLevel:state.maxMasterworkRank;
  if(next!==current+1) throw new Error("Upgrades must be performed one level/rank at a time");
  if(next>cap) throw new Error("Maximum upgrade level reached");
  if(request.track==="masterworking"&&item.itemLevel<(rules as MasterworkRank).unlockLevel) throw new Error("Item level is too low for this masterwork rank");
  const baseMaterials=rules.materials;
  const protectionCost=request.useProtection&&rules.protectionMaterialId
    ? {itemId:rules.protectionMaterialId,quantity:rules.protectionMaterialQuantity??1}:undefined;
  const materials=combineMaterials(baseMaterials,protectionCost);
  if(!costAvailable(wallet,rules.currencyCost,materials)) throw new Error("Insufficient currency or crafting materials");
  const nextWallet=spend(wallet,rules.currencyCost,materials);
  const success=request.roll<clamp(rules.successChance,0,1);
  const from=current;
  let to=current, message:string;
  if(success) {
    to=next;
    if(request.track==="tempering") state.temperLevel=to; else state.masterworkRank=to;
    state[request.track==="tempering"?"temperXp":"masterworkXp"]+=100;
    message=`Upgrade succeeded: ${request.track} ${from} → ${to}`;
  } else if(!protectionCost && rules.failurePolicy==="downgrade") {
    const delta=request.track==="tempering"?(rules as TemperingLevel).downgradeLevels??1:(rules as MasterworkRank).downgradeRanks??1;
    to=Math.max(0,current-delta);
    if(request.track==="tempering") state.temperLevel=to; else state.masterworkRank=to;
    message=`Upgrade failed; ${request.track} decreased to ${to}`;
  } else if(!protectionCost && rules.failurePolicy==="damage") {
    state.damaged=true; message="Upgrade failed; item durability is damaged and repair is required";
  } else if(!protectionCost && rules.failurePolicy==="destroy") {
    state.damaged=true; message="Upgrade failed; item is marked destroyed and must be restored by a recovery service";
  } else message="Upgrade failed; current upgrade level was preserved";
  const materialsSpent=materials.map(m=>({...m}));
  state.history.push({id:`upgrade-${request.playerId}-${request.timestamp??Date.now()}-${state.history.length+1}`,track:request.track,fromLevel:from,toLevel:to,success,timestamp:request.timestamp??Date.now(),playerId:request.playerId,materialsSpent,currencySpent:rules.currencyCost,message});
  return {success,state,wallet:nextWallet,item:applyUpgradeBonuses(item,state),currencySpent:rules.currencyCost,materialsSpent,message};
}
export interface RepairRule { currencyCost:number; materials:MaterialCost[]; clearsDamage:boolean; }
export function repairUpgradedItem(state:CraftingUpgradeState,wallet:CraftingWallet,rule:RepairRule):{state:CraftingUpgradeState;wallet:CraftingWallet} {
  if(!state.damaged)return {state:clone(state),wallet:clone(wallet)};
  if(!rule.clearsDamage)throw new Error("Repair recipe does not restore this damage state");
  if(!costAvailable(wallet,finiteNonNegative(rule.currencyCost),rule.materials))throw new Error("Insufficient currency or repair materials");
  const nextState=clone(state); nextState.damaged=false;
  return {state:nextState,wallet:spend(wallet,rule.currencyCost,rule.materials)};
}
export function estimateUpgradeCost(track:CraftingTrack,target:number,config:TemperingConfig=DEFAULT_TEMPERING_CONFIG):{currency:number;materials:MaterialCost[]} {
  const rules=track==="tempering"?config.levels.filter(r=>r.level<=target):config.masterworkRanks.filter(r=>r.rank<=target);
  const totals=new Map<string,number>(); let currency=0;
  for(const r of rules) { currency+=r.currencyCost; for(const m of r.materials)totals.set(m.itemId,(totals.get(m.itemId)??0)+m.quantity); }
  return {currency,materials:[...totals].map(([itemId,quantity])=>({itemId,quantity}))};
}
export function temperingSuccessChance(level:number,config:TemperingConfig=DEFAULT_TEMPERING_CONFIG):number {
  return clamp(config.levels.find(x=>x.level===level)?.successChance??0,0,1);
}
export function masterworkSuccessChance(rank:number,config:TemperingConfig=DEFAULT_TEMPERING_CONFIG):number {
  return clamp(config.masterworkRanks.find(x=>x.rank===rank)?.successChance??0,0,1);
}
