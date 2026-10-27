import assert from "node:assert/strict";
import { deriveStats, hitChance, armorMitigation, resolveHealing, scaleEnemyStats, calculateItemPower, validateItem, rollLoot, EffectSystem, SAMPLE_STAT_BLOCK, STARTER_ITEMS, STARTER_LOOT_TABLES, DEFAULT_EFFECTS, STARTER_ENEMIES, createScaledEnemy, chooseEnemyAbility, resolveDamage } from "./index.js";
const attrs={STR:20,DEX:15,CON:12,INT:18,WIS:12,VIT:20,SPI:10,LCK:7,WIL:12,CHA:5};
const d=deriveStats(attrs);
assert.equal(d.maxHP,420);
assert.ok(d.physicalPower>0 && d.spellPower>0);
assert.equal(hitChance(100,0),.95);
assert.equal(hitChance(0,100),.05);
assert.ok(armorMitigation(1000,10)<.85);
assert.ok(resolveHealing(100,20,.1,.2,"pve")>resolveHealing(100,20,.1,.2,"pvp"));
const ranked=scaleEnemyStats(1000,5,2,4,1);
assert.ok(ranked>1000);
for(const item of STARTER_ITEMS) assert.deepEqual(validateItem(item),[]);
assert.ok(calculateItemPower(STARTER_ITEMS[0],"pve")>calculateItemPower(STARTER_ITEMS[0],"pvp"));
const loot=rollLoot(STARTER_LOOT_TABLES[0],{random:()=>0.1});
assert.equal(loot.length,1);
assert.ok(loot[0].quantity>=1);
assert.deepEqual(rollLoot(STARTER_LOOT_TABLES[1],{pityCount:10}),[{itemId:"ashen-blade",quantity:1}]);
const target={id:"target",name:"Target",teamId:"b",mode:"pve" as const,stats:structuredClone(SAMPLE_STAT_BLOCK),effects:[],threat:{} as Record<string,number>,alive:true};
const effects=new EffectSystem();
target.stats.resources.hp!.current=500;
effects.apply(target,DEFAULT_EFFECTS.find(e=>e.id==="regeneration")!,"ally");
const healingEvents=effects.tick(target,2);
assert.equal(healingEvents.length,2);
assert.ok(target.stats.resources.hp!.current>500,"regeneration must heal rather than damage");
effects.apply(target,DEFAULT_EFFECTS.find(e=>e.id==="poison")!,"enemy");
target.stats.resources.hp!.current=500;
const events=effects.tick(target,2);
assert.ok(events.some(e=>e.effectId==="poison"&&e.damage>0));
assert.ok(target.stats.resources.hp!.current<500,"poison should reduce HP");
effects.apply(target,DEFAULT_EFFECTS.find(e=>e.id==="stun")!,"enemy");
assert.equal(effects.cleanse(target,"physical"),1);
const scaled=createScaledEnemy(STARTER_ENEMIES[0],{playerLevel:20,playerCount:4});
assert.ok(scaled.resources.hp!.max>0);
const ability=chooseEnemyAbility(STARTER_ENEMIES[2].abilities,{distance:4,targetHpPercent:.15,cooldownReady:true,phaseAllowed:true,playerClusterSize:5});
assert.ok(ability);
const attacker={...target,id:"attacker",teamId:"a",stats:structuredClone(SAMPLE_STAT_BLOCK),alive:true,effects:[],threat:{}};
const defender={...target,id:"defender",teamId:"b",stats:structuredClone(SAMPLE_STAT_BLOCK),alive:true,effects:[],threat:{}};
const damage=resolveDamage({attacker,defender,baseDamage:100,damageType:"physical",mode:"pvp",canCrit:false},.99);
assert.ok(damage.finalDamage>=0 && damage.finalDamage<=100);
assert.equal(damage.critical,false);

import { attemptUpgrade, createCraftingUpgradeState, DEFAULT_TEMPERING_CONFIG, applyUpgradeBonuses, estimateUpgradeCost, repairUpgradedItem } from "./index.js";
const craftItem=STARTER_ITEMS[0];
const freshState=createCraftingUpgradeState(craftItem);
const baseWallet={currency:1000000,materials:{"tempering-stone":100,"refined-ore":20,"star-metal":20,"astral-core":20,"primordial-ingot":20,"masterwork-core":20,"void-crystal":20,"world-boss-heart":5,"warding-rune":20,"greater-warding-rune":20,"masterwork-seal":20}};
const temperRule=DEFAULT_TEMPERING_CONFIG.levels[0];
const upgraded=attemptUpgrade({item:craftItem,state:freshState,wallet:baseWallet,playerId:"test-player",track:"tempering",rules:temperRule,roll:0.01,timestamp:100});
assert.equal(upgraded.success,true);
assert.equal(upgraded.state.temperLevel,1);
assert.equal(upgraded.wallet.materials["tempering-stone"],98);
const failRule=DEFAULT_TEMPERING_CONFIG.levels[3];
const failState={...upgraded.state,temperLevel:3};
const protectedFail=attemptUpgrade({item:craftItem,state:failState,wallet:upgraded.wallet,playerId:"test-player",track:"tempering",rules:failRule,roll:.99,timestamp:200,useProtection:true});
assert.equal(protectedFail.success,false);
assert.equal(protectedFail.state.temperLevel,3,"protection must prevent downgrade");
const baseProfilePower=calculateItemPower(craftItem,"pve");
const applied=applyUpgradeBonuses(craftItem,upgraded.state);
assert.ok(calculateItemPower(applied,"pve")>baseProfilePower);
assert.equal(calculateItemPower(applyUpgradeBonuses(craftItem,upgraded.state),"pve"),calculateItemPower(applied,"pve"),"applying upgrades must be idempotent");
const estimate=estimateUpgradeCost("tempering",3);
assert.ok(estimate.currency>0 && estimate.materials.length>0);
const damaged={...upgraded.state,damaged:true};
const repaired=repairUpgradedItem(damaged,{...baseWallet,materials:{...baseWallet.materials,"repair-kit":1}},{currencyCost:100,materials:[{itemId:"repair-kit",quantity:1}],clearsDamage:true});
assert.equal(repaired.state.damaged,false);
const protectedFailureCosts=protectedFail.wallet.materials["warding-rune"];
assert.equal(protectedFailureCosts,19,"protection material must be consumed");
const noProtectionFailure=attemptUpgrade({
  item:craftItem,
  state:{...upgraded.state,temperLevel:3},
  wallet:{currency:baseWallet.currency,materials:{...baseWallet.materials,"tempering-stone":100,"refined-ore":20}},
  playerId:"test-player",track:"tempering",rules:failRule,roll:.99,timestamp:201
});
assert.equal(noProtectionFailure.state.temperLevel,2,"failed unprotected +4 attempt must downgrade by one");
const bonusMasterworkRule=DEFAULT_TEMPERING_CONFIG.masterworkRanks[0];
const masterworked=attemptUpgrade({
  item:craftItem,state:{...freshState,temperLevel:10},
  wallet:baseWallet,playerId:"test-player",track:"masterworking",
  rules:bonusMasterworkRule,roll:.01,timestamp:300
});
assert.equal(masterworked.state.masterworkRank,1);
assert.ok(masterworked.item.pve.stats?.derived?.physicalPower);
assert.equal(rollLoot(STARTER_LOOT_TABLES[0],{random:()=>0,alreadyUnique:new Set(["guardian-plate"])}).length,1);

console.log("RPG/MMORPG unit smoke tests passed");
