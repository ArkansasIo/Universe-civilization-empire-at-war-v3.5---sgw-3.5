/** Shared RPG/MMORPG runtime contracts. Numeric stat values are normalized by the rules layer. */
export const CORE_ATTRIBUTES = ["STR","DEX","CON","INT","WIS","VIT","SPI","LCK","WIL","CHA"] as const;
export type CoreAttribute = typeof CORE_ATTRIBUTES[number];
export type GameMode = "pve" | "pvp";
export type DamageType = "physical" | "fire" | "ice" | "lightning" | "earth" | "wind" | "water" | "light" | "dark" | "arcane" | "poison" | "bleed" | "void" | "chaos" | "true";
export type ResourceType = "hp" | "mp" | "stamina" | "energy" | "rage" | "focus" | "faith" | "aether" | "heat" | "sanity";
export type EnemyRank = "normal" | "veteran" | "elite" | "champion" | "boss" | "raidBoss" | "mythic" | "ascended";
export type EnemyRole = "bruiser" | "tank" | "assassin" | "sniper" | "caster" | "controller" | "summoner" | "support" | "trickster";
export type ItemSlot = "head" | "chest" | "legs" | "gloves" | "boots" | "mainHand" | "offHand" | "ring" | "amulet" | "cloak" | "belt" | "trinket" | "relic";
export type ItemType = "weapon" | "armor" | "accessory" | "consumable" | "material" | "quest" | "mount" | "cosmetic" | "relic";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "ascended";
export type EffectCategory = "offensive" | "defensive" | "utility" | "control" | "dot" | "statBreak";
export type StackMode = "none" | "refresh" | "addStacks" | "replaceStronger" | "independent";
export type CleanseType = "physical" | "magic" | "curse" | "poison" | "bleed" | "all";
export interface CoreStats { STR:number; DEX:number; CON:number; INT:number; WIS:number; VIT:number; SPI:number; LCK:number; WIL:number; CHA:number; }
export interface ResourcePool { current:number; max:number; regenPerSecond?:number; }
export interface DerivedStats {
  physicalPower:number; spellPower:number; healingPower:number; armor:number; magicResistance:number;
  maxHP:number; hpRegen:number; maxMP:number; mpRegen:number; maxStamina:number; staminaRegen:number;
  accuracy:number; evasion:number; armorPenetration:number; magicPenetration:number;
  attackSpeed:number; castSpeed:number; critChance:number; critDamage:number; blockChance:number; blockValue:number;
  parryChance:number; dodgeChance:number; tenacity:number; poise:number; moveSpeed:number; cooldownReduction:number;
  damageReduction:number; shieldPower:number; threatMultiplier:number;
}
export interface StatBlock {
  level:number; attributes:CoreStats; derived:DerivedStats; resources:Partial<Record<ResourceType,ResourcePool>>;
  resistances:Partial<Record<DamageType,number>>; flatResistances?:Partial<Record<DamageType,number>>;
  tags:string[]; gearScore?:number; pvpPower?:number; pvpResilience?:number;
}
export interface StatBonuses { attributes?:Partial<CoreStats>; derived?:Partial<DerivedStats>; resistances?:Partial<Record<DamageType,number>>; physicalPower?:number; magicalPower?:number; maxHp?:number; maxMana?:number; critChance?:number; critDamage?:number; evasion?:number; cooldownReduction?:number; }
export interface EffectDefinition {
  id:string; name:string; category:EffectCategory; durationSeconds:number; stackMode:StackMode; maxStacks?:number;
  magnitude:number; stat?:keyof DerivedStats | CoreAttribute; isPercent?:boolean; damageType?:DamageType; tickSeconds?:number;
  cleanseType?:CleanseType; ccDiminishingCategory?:string; grantsImmunity?:string[]; sourceTags?:string[];
}
export interface ActiveEffect { definition:EffectDefinition; stacks:number; remainingSeconds:number; sourceId?:string; elapsedForTick?:number; }
export interface ItemDefinition {
  id:string; name:string; description?:string; type:ItemType; slot?:ItemSlot; rarity:Rarity; requiredLevel:number;
  itemLevel:number; value:number; stackLimit?:number; bindOnPickup?:boolean; tags:string[];
  pve: ItemModeProfile; pvp: ItemModeProfile; setId?:string; cosmeticId?:string;
}
export interface ItemModeProfile {
  baseDamage?:number; armor?:number; magicResistance?:number; stats?:StatBonuses;
  procEffects?:EffectDefinition[]; damageBonuses?:Partial<Record<DamageType,number>>; bossDamageBonus?:number;
  pvpPower?:number; pvpResilience?:number; antiHeal?:number; ccDurationScale?:number; normalized?:boolean;
}
export interface LootEntry { itemId:string; weight:number; minQuantity?:number; maxQuantity?:number; uniquePerReset?:boolean; }
export interface LootTable { id:string; entries:LootEntry[]; currency?:{id:string;min:number;max:number}; pity?:{counterKey:string;threshold:number;guaranteedItemId:string}; }
export interface EnemyAbility {
  id:string; name:string; cooldownSeconds:number; range:number; castSeconds?:number; damage:number;
  damageType:DamageType; target:"threat"|"lowestHp"|"cluster"|"random"|"self"; tags:string[]; utilityWeights?:Record<string,number>;
}
export interface EnemyPhase { id:string; trigger:{type:"hpPercent"|"elapsedSeconds"|"event";value:number|string}; abilityIds:string[]; spawnAddIds?:string[]; damageMultiplier?:number; }
export interface EnemyDefinition {
  id:string; name:string; rank:EnemyRank; role:EnemyRole; level:number; baseStats:StatBlock; abilities:EnemyAbility[];
  phases?:EnemyPhase[]; affixes?:string[]; immunities?:string[]; lootTableId?:string; enrageSeconds?:number;
  groupTags:string[]; respawnSeconds?:number;
}
export interface Combatant {
  id:string; name:string; teamId:string; mode:GameMode; stats:StatBlock; effects:ActiveEffect[];
  threat:Record<string,number>; alive:boolean; immunities?:string[]; boss?:boolean;
}
export interface DamageRequest {
  attacker:Combatant; defender:Combatant; baseDamage:number; damageType:DamageType; mode:GameMode;
  skillCoefficient?:number; canCrit?:boolean; isBossTarget?:boolean; isPvp?:boolean;
}
export interface DamageResult { raw:number; afterArmor:number; afterResistance:number; finalDamage:number; critical:boolean; blocked:boolean; }
export interface CombatEvent { type:string; timestamp:number; sourceId:string; targetId?:string; value?:number; data?:Record<string,unknown>; }
