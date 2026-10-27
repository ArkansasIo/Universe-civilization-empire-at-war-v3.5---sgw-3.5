import type { EffectDefinition, EnemyDefinition, ItemDefinition, LootTable } from "./types.js";
export const DEFAULT_EFFECTS:EffectDefinition[]=[
  {id:"power-surge",name:"Power Surge",category:"offensive",durationSeconds:12,stackMode:"refresh",magnitude:.2,isPercent:true,stat:"physicalPower"},
  {id:"fortified",name:"Fortified",category:"defensive",durationSeconds:15,stackMode:"replaceStronger",magnitude:.15,isPercent:true,stat:"damageReduction"},
  {id:"regeneration",name:"Regeneration",category:"defensive",durationSeconds:10,stackMode:"refresh",magnitude:25,tickSeconds:1,damageType:"true",stat:"hpRegen"},
  {id:"poison",name:"Poison",category:"dot",durationSeconds:8,stackMode:"addStacks",maxStacks:5,magnitude:12,tickSeconds:2,damageType:"poison",cleanseType:"poison"},
  {id:"stun",name:"Stun",category:"control",durationSeconds:3,stackMode:"refresh",magnitude:1,ccDiminishingCategory:"stun",cleanseType:"physical"},
  {id:"slow",name:"Slow",category:"statBreak",durationSeconds:6,stackMode:"refresh",magnitude:-.25,isPercent:true,stat:"moveSpeed",cleanseType:"magic"},
  {id:"curse",name:"Curse",category:"statBreak",durationSeconds:10,stackMode:"refresh",magnitude:-.1,isPercent:true,cleanseType:"curse"},
];
export const STARTER_ITEMS:ItemDefinition[]=[
  {id:"ashen-blade",name:"Ashen Blade",description:"An ember-edged sword tuned separately for PvE and PvP.",type:"weapon",slot:"mainHand",rarity:"epic",requiredLevel:20,itemLevel:40,value:12000,tags:["sword","fire"],pve:{baseDamage:1200,damageBonuses:{fire:.15},bossDamageBonus:.1,stats:{attributes:{STR:50},derived:{critChance:.05}},procEffects:[{id:"ashen-burn",name:"Ashen Burn",category:"dot",durationSeconds:5,stackMode:"refresh",magnitude:30,tickSeconds:1,damageType:"fire"}]},pvp:{baseDamage:650,pvpPower:10,antiHeal:.2,normalized:true,stats:{attributes:{STR:20},derived:{critChance:.025}},procEffects:[{id:"pvp-burn",name:"Contained Burn",category:"dot",durationSeconds:3,stackMode:"refresh",magnitude:8,tickSeconds:1,damageType:"fire"}]}},
  {id:"guardian-plate",name:"Guardian Plate",type:"armor",slot:"chest",rarity:"rare",requiredLevel:15,itemLevel:25,value:6800,tags:["heavy","tank"],pve:{armor:260,stats:{attributes:{CON:20,VIT:25},derived:{threatMultiplier:.3}}},pvp:{armor:300,pvpResilience:18,normalized:true,stats:{attributes:{CON:15,VIT:15},derived:{damageReduction:.03}}}},
  {id:"arena-breaker",name:"Arena Breaker",type:"accessory",slot:"trinket",rarity:"epic",requiredLevel:30,itemLevel:45,value:15000,tags:["pvp","cleanse"],pve:{stats:{derived:{tenacity:5}}},pvp:{pvpResilience:25,antiHeal:.08,normalized:true,procEffects:[{id:"arena-cleanse",name:"Arena Cleanse",category:"utility",durationSeconds:0,stackMode:"none",magnitude:1,cleanseType:"all"}]}},
];
const statTemplate = {
  physicalPower:40,spellPower:20,healingPower:5,armor:15,magicResistance:10,maxHP:1000,hpRegen:1,maxMP:200,mpRegen:2,maxStamina:100,staminaRegen:3,
  accuracy:60,evasion:12,armorPenetration:3,magicPenetration:2,attackSpeed:1,castSpeed:1,critChance:.05,critDamage:.5,blockChance:.05,blockValue:8,
  parryChance:.02,dodgeChance:.03,tenacity:5,poise:10,moveSpeed:600,cooldownReduction:.02,damageReduction:.02,shieldPower:15,threatMultiplier:1
};
export const SAMPLE_STAT_BLOCK = {
 level:10,attributes:{STR:15,DEX:12,CON:12,INT:10,WIS:10,VIT:14,SPI:8,LCK:5,WIL:10,CHA:5},
 derived:statTemplate,resources:{hp:{current:1000,max:1000,regenPerSecond:1},mp:{current:200,max:200,regenPerSecond:2},stamina:{current:100,max:100,regenPerSecond:3}},
 resistances:{physical:0,fire:0,ice:0,lightning:0,earth:0,wind:0,water:0,light:0,dark:0,arcane:0,poison:0,bleed:0,void:0,chaos:0,true:0},
 tags:["humanoid"],gearScore:100
} as const;
export const STARTER_LOOT_TABLES:LootTable[]=[
  {id:"basic-mob",entries:[{itemId:"crafting-ore",weight:60,minQuantity:1,maxQuantity:3},{itemId:"health-potion",weight:30,minQuantity:1,maxQuantity:2},{itemId:"guardian-plate",weight:10}],currency:{id:"credits",min:5,max:50}},
  {id:"world-boss",entries:[{itemId:"ashen-blade",weight:30},{itemId:"guardian-plate",weight:45},{itemId:"star-relic",weight:25}],pity:{counterKey:"world-boss-epic",threshold:10,guaranteedItemId:"ashen-blade"}},
];
const basicStats=()=>structuredClone(SAMPLE_STAT_BLOCK);
export const STARTER_ENEMIES:EnemyDefinition[]=[
  {id:"riftling",name:"Riftling Scavenger",rank:"normal",role:"bruiser",level:8,baseStats:basicStats(),abilities:[{id:"claw",name:"Rending Claw",cooldownSeconds:2,range:2,damage:35,damageType:"physical",target:"threat",tags:["melee"]}],affixes:[],immunities:[],lootTableId:"basic-mob",groupTags:["beast","trash"],respawnSeconds:20},
  {id:"void-warden",name:"Void Warden",rank:"elite",role:"controller",level:20,baseStats:basicStats(),abilities:[{id:"void-bolt",name:"Void Bolt",cooldownSeconds:5,range:18,castSeconds:1.5,damage:120,damageType:"void",target:"threat",tags:["ranged","interruptible"]},{id:"gravity-well",name:"Gravity Well",cooldownSeconds:14,range:12,castSeconds:2,damage:70,damageType:"void",target:"cluster",tags:["aoe","root"]}],phases:[{id:"last-stand",trigger:{type:"hpPercent",value:25},abilityIds:["gravity-well"],damageMultiplier:1.5}],affixes:["arcane-shield"],immunities:["fear"],lootTableId:"world-boss",groupTags:["void","elite"]},
  {id:"star-devourer",name:"Star Devourer",rank:"raidBoss",role:"summoner",level:50,baseStats:basicStats(),abilities:[{id:"nova",name:"Event Horizon Nova",cooldownSeconds:30,range:35,castSeconds:3,damage:900,damageType:"void",target:"cluster",tags:["aoe","telegraph"]},{id:"spawn-shards",name:"Spawn Star Shards",cooldownSeconds:20,range:40,damage:0,damageType:"void",target:"self",tags:["summon","adds"]}],phases:[{id:"eclipse",trigger:{type:"hpPercent",value:60},abilityIds:["spawn-shards"],spawnAddIds:["riftling"],damageMultiplier:1.2},{id:"collapse",trigger:{type:"hpPercent",value:20},abilityIds:["nova"],damageMultiplier:1.8}],affixes:["soft-enrage","shared-hp"],immunities:["knockback","fear"],lootTableId:"world-boss",enrageSeconds:480,groupTags:["cosmic","raid-boss"]},
];
