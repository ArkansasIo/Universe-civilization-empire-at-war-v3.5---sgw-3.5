import { DEFAULT_TEMPERING_CONFIG, applyUpgradeBonuses, type CraftingUpgradeState, type MasterworkRank, type MaterialCost } from "./tempering.js";
import type { ItemDefinition } from "./types.js";

export interface MasterworkPreview {
  currentRank:number;
  nextRank:number;
  unlockLevel:number;
  eligible:boolean;
  successChance:number;
  currencyCost:number;
  materials:MaterialCost[];
  protectedMaterials:MaterialCost[];
  projectedItem:ItemDefinition;
  reason?:string;
}

export interface MasterworkRankSummary {
  rank:number;
  unlockLevel:number;
  successChance:number;
  currencyCost:number;
  materials:MaterialCost[];
  protectionMaterial?:MaterialCost;
  statMultiplier:number;
  bonusStat?:string;
  bonusStatAmount?:number;
}

export function getMasterworkRank(rank:number):MasterworkRank|undefined{return DEFAULT_TEMPERING_CONFIG.masterworkRanks.find(rule=>rule.rank===rank);}

export function listMasterworkRanks():MasterworkRankSummary[]{
  return DEFAULT_TEMPERING_CONFIG.masterworkRanks.map(rule=>({
    rank:rule.rank,
    unlockLevel:rule.unlockLevel,
    successChance:rule.successChance,
    currencyCost:rule.currencyCost,
    materials:rule.materials.map(material=>({...material})),
    protectionMaterial:rule.protectionMaterialId?{itemId:rule.protectionMaterialId,quantity:rule.protectionMaterialQuantity??1}:undefined,
    statMultiplier:rule.statMultiplier,
    bonusStat:rule.bonusStat,
    bonusStatAmount:rule.bonusStatAmount,
  }));
}

export function previewMasterwork(item:ItemDefinition,state:CraftingUpgradeState,useProtection=false):MasterworkPreview{
  const current=state.masterworkRank;
  const next=current+1;
  const rule=getMasterworkRank(next);
  if(!rule) return {currentRank:current,nextRank:next,unlockLevel:0,eligible:false,successChance:0,currencyCost:0,materials:[],protectedMaterials:[],projectedItem:applyUpgradeBonuses(item,state),reason:"Maximum masterwork rank reached"};
  if(item.itemLevel<rule.unlockLevel) return {currentRank:current,nextRank:next,unlockLevel:rule.unlockLevel,eligible:false,successChance:rule.successChance,currencyCost:rule.currencyCost,materials:rule.materials.map(m=>({...m})),protectedMaterials:[],projectedItem:applyUpgradeBonuses(item,state),reason:`Requires item level ${rule.unlockLevel}`};
  const projectedState={...state,masterworkRank:next};
  return {currentRank:current,nextRank:next,unlockLevel:rule.unlockLevel,eligible:true,successChance:rule.successChance,currencyCost:rule.currencyCost,materials:rule.materials.map(m=>({...m})),protectedMaterials:useProtection&&rule.protectionMaterialId?[{itemId:rule.protectionMaterialId,quantity:rule.protectionMaterialQuantity??1}]:[],projectedItem:applyUpgradeBonuses(item,projectedState)};
}

export function masterworkCostToRank(targetRank:number):{currency:number;materials:MaterialCost[]}{
  if(targetRank<0||!Number.isInteger(targetRank))throw new Error("targetRank must be a non-negative integer");
  const rules=DEFAULT_TEMPERING_CONFIG.masterworkRanks.filter(rule=>rule.rank<=targetRank);
  const materialTotals=new Map<string,number>();
  let currency=0;
  for(const rule of rules){currency+=rule.currencyCost;for(const material of rule.materials)materialTotals.set(material.itemId,(materialTotals.get(material.itemId)??0)+material.quantity);}
  return {currency,materials:[...materialTotals].map(([itemId,quantity])=>({itemId,quantity}))};
}
