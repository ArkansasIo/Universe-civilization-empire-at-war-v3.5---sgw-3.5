/** Stash-style protected, general inventory, and equipment vault progression.
 * Capacity values are provisional. Server persistence and atomic transactions are required for production.
 */
export type VaultKind = 'protected' | 'inventory' | 'equipment';
export const STASH_TAB_RULES = { maxTabs: 10, slotsPerTab: 125, maxStackSize: 99, firstAdditionalTabCost: 100_000 } as const;
export interface StashTabProgress { unlockedTabs: number; maxTabs: number; slotsPerTab: number; totalSlots: number; nextTabCost: number | null; }
export function getStashTabProgress(unlockedTabs: number): StashTabProgress {
 const tabs = Math.max(1, Math.min(STASH_TAB_RULES.maxTabs, Math.floor(Number.isFinite(unlockedTabs) ? unlockedTabs : 1)));
 return { unlockedTabs: tabs, maxTabs: STASH_TAB_RULES.maxTabs, slotsPerTab: STASH_TAB_RULES.slotsPerTab, totalSlots: tabs * STASH_TAB_RULES.slotsPerTab, nextTabCost: tabs >= STASH_TAB_RULES.maxTabs ? null : STASH_TAB_RULES.firstAdditionalTabCost * Math.pow(2, tabs - 1) };
}
export function canStackStashItems(existing: { itemId:string; quantity:number; maxStack?:number }, incoming: { itemId:string; quantity:number; maxStack?:number }): { allowed:boolean; resultingQuantity:number; reason:string } {
 if (existing.itemId !== incoming.itemId) return { allowed:false, resultingQuantity:existing.quantity, reason:'Different item IDs cannot share a stack.' };
 const maxStack = Math.min(STASH_TAB_RULES.maxStackSize, Math.max(1, existing.maxStack ?? STASH_TAB_RULES.maxStackSize), Math.max(1, incoming.maxStack ?? STASH_TAB_RULES.maxStackSize));
 if (existing.quantity + incoming.quantity > maxStack) return { allowed:false, resultingQuantity:existing.quantity, reason:'Stack limit exceeded; split the quantity into multiple stacks.' };
 return { allowed:true, resultingQuantity:existing.quantity + incoming.quantity, reason:'Items can be stacked.' };
}
export type VaultUpgradeMaterial = 'metal' | 'crystal' | 'deuterium' | 'naquadah';
export interface VaultCapacity {
 kind: VaultKind;
 level: number;
 maxLevel: number;
 baseSlots: number;
 slotsPerLevel: number;
 capacity: number;
 weightCapacity: number;
 protectedSlots: number;
}
export interface VaultUpgradeCost { metal:number; crystal:number; deuterium:number; naquadah:number; }
export interface VaultUpgradePreview {
 kind: VaultKind;
 currentLevel:number;
 nextLevel:number;
 currentCapacity:number;
 nextCapacity:number;
 addedSlots:number;
 cost:VaultUpgradeCost;
 requiredFacilityLevel:number;
 canUpgrade:boolean;
 reason:string;
}
export interface StashItem {
 itemId:string;
 quantity:number;
 stackable:boolean;
 weight:number;
 category:string;
 rarity?:string;
 locked?:boolean;
 equipped?:boolean;
 protected?:boolean;
}
export const VAULT_RULES:Record<VaultKind,{label:string;baseSlots:number;slotsPerLevel:number;maxLevel:number;baseWeight:number;weightPerLevel:number;baseCost:VaultUpgradeCost;costGrowth:number;facility:string}> = {
 protected:{label:'Protected Vault',baseSlots:20,slotsPerLevel:10,maxLevel:30,baseWeight:500,weightPerLevel:250,baseCost:{metal:1200,crystal:500,deuterium:200,naquadah:100},costGrowth:1.32,facility:'Protected Vault'},
 inventory:{label:'Inventory Vault',baseSlots:60,slotsPerLevel:20,maxLevel:30,baseWeight:1500,weightPerLevel:750,baseCost:{metal:800,crystal:300,deuterium:100,naquadah:40},costGrowth:1.28,facility:'Storage Silo'},
 equipment:{label:'Equipment Vault',baseSlots:24,slotsPerLevel:12,maxLevel:30,baseWeight:1200,weightPerLevel:500,baseCost:{metal:1000,crystal:600,deuterium:150,naquadah:80},costGrowth:1.30,facility:'Armory'},
};
const safeLevel=(level:number,max:number)=>Math.max(1,Math.min(max,Math.floor(Number.isFinite(level)?level:1)));
export function getVaultCapacity(kind:VaultKind,level:number):VaultCapacity {
 const rule=VAULT_RULES[kind], lv=safeLevel(level,rule.maxLevel);
 return {kind,level:lv,maxLevel:rule.maxLevel,baseSlots:rule.baseSlots,slotsPerLevel:rule.slotsPerLevel,capacity:rule.baseSlots+(lv-1)*rule.slotsPerLevel,weightCapacity:rule.baseWeight+(lv-1)*rule.weightPerLevel,protectedSlots:kind==='protected'?rule.baseSlots+(lv-1)*rule.slotsPerLevel:0};
}
export function getVaultUpgradeCost(kind:VaultKind,currentLevel:number):VaultUpgradeCost {
 const rule=VAULT_RULES[kind], level=safeLevel(currentLevel,rule.maxLevel);
 return {metal:Math.ceil(rule.baseCost.metal*Math.pow(rule.costGrowth,level-1)),crystal:Math.ceil(rule.baseCost.crystal*Math.pow(rule.costGrowth,level-1)),deuterium:Math.ceil(rule.baseCost.deuterium*Math.pow(rule.costGrowth,level-1)),naquadah:Math.ceil(rule.baseCost.naquadah*Math.pow(rule.costGrowth,level-1))};
}
export function previewVaultUpgrade(kind:VaultKind,currentLevel:number,facilityLevel:number):VaultUpgradePreview {
 const rule=VAULT_RULES[kind], current=safeLevel(currentLevel,rule.maxLevel), next=current+1, now=getVaultCapacity(kind,current);
 const canUpgrade=current<rule.maxLevel&&facilityLevel>=Math.ceil(next/5);
 const reason=current>=rule.maxLevel?'Vault is at maximum level.':facilityLevel<Math.ceil(next/5)?`Requires ${rule.facility} facility level ${Math.ceil(next/5)}.`:'Upgrade available.';
 return {kind,currentLevel:current,nextLevel:Math.min(next,rule.maxLevel),currentCapacity:now.capacity,nextCapacity:current>=rule.maxLevel?now.capacity:now.capacity+rule.slotsPerLevel,addedSlots:current>=rule.maxLevel?0:rule.slotsPerLevel,cost:getVaultUpgradeCost(kind,current),requiredFacilityLevel:Math.ceil(next/5),canUpgrade,reason};
}
export function validateVaultItems(kind:VaultKind,items:StashItem[],capacity:VaultCapacity):string[] {
 const errors:string[]=[];const ids=new Set<string>();let totalWeight=0;
 for(const item of items){if(!item.itemId)errors.push('Item is missing an ID.');if(ids.has(item.itemId))errors.push('Duplicate item ID: '+item.itemId);ids.add(item.itemId);if(!Number.isFinite(item.quantity)||item.quantity<1)errors.push('Invalid quantity: '+item.itemId);if(!Number.isFinite(item.weight)||item.weight<0)errors.push('Invalid weight: '+item.itemId);totalWeight+=Math.max(0,item.weight)*Math.max(0,item.quantity);if(kind==='equipment'&&item.category!=='equipment'&&item.category!=='gear'&&!item.equipped)errors.push('Non-equipment item in equipment vault: '+item.itemId);}
 if(items.length>capacity.capacity)errors.push('Vault slot capacity exceeded.');if(totalWeight>capacity.weightCapacity)errors.push('Vault weight capacity exceeded.');return errors;
}
export function canMoveToVault(kind:VaultKind,item:StashItem):{allowed:boolean;reason:string}{
 if(item.locked)return {allowed:false,reason:'Item is locked by another operation.'};
 if(item.equipped&&kind!=='equipment')return {allowed:false,reason:'Unequip the item before moving it to this vault.'};
 if(kind==='equipment'&&item.category!=='equipment'&&item.category!=='gear')return {allowed:false,reason:'Equipment Vault accepts gear and equipment only.'};
 if(kind==='protected'&&item.category==='quest-bound')return {allowed:false,reason:'Quest-bound items are managed by the quest inventory.'};
 return {allowed:true,reason:'Transfer allowed; server must revalidate ownership and capacity.'};
}
