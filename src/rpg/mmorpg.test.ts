import assert from "node:assert/strict";
import { addExperience, createProgression, requiredXp } from "./progression.js";
import { addItem, createInventory, countItem, removeItem } from "./inventory.js";
import { equip, listEquipped } from "./equipment.js";
import { createAbilityState, STARTER_ABILITIES, unlockAbility } from "./abilities.js";
import { createQuestProgress, advanceQuest, STARTER_QUESTS } from "./quests.js";
import { STARTER_DUNGEONS, startDungeon } from "./dungeons.js";
import { createParty, addPartyMember } from "./social.js";
import { applyPvpResult, createPvpProfile } from "./pvp.js";
import { spawnWorldBoss, damageWorldBoss } from "./world.js";
import { createTalentState, investTalent, STARTER_TALENTS } from "./talents.js";

const p = addExperience(createProgression(), requiredXp(1));
assert.equal(p.level, 2);

let inv = createInventory(2);
inv = addItem(inv, "tempering-stone", 100);
assert.equal(countItem(inv, "tempering-stone"), 100);
inv = removeItem(inv, "tempering-stone", 40);
assert.equal(countItem(inv, "tempering-stone"), 60);

const loadout = equip({}, { instanceId: "i1", itemId: "ashen-blade", slot: "mainHand" });
assert.equal(listEquipped(loadout).length, 1);

let abilities = createAbilityState();
abilities = unlockAbility(abilities, STARTER_ABILITIES[0]!, 1);
assert(abilities.unlocked.has("basic-strike"));

const quest = STARTER_QUESTS[0]!;
let qp = createQuestProgress(quest);
qp = advanceQuest(qp, "defeat", 3, quest);
assert(qp.completed);

const run = startDungeon(STARTER_DUNGEONS[0]!, "party-1", 5, 100);
assert.equal(run.floor, 1);

let party = createParty("party-1", "p1");
party = addPartyMember(party, "p2");
assert.equal(party.memberIds.length, 2);

const pvp = applyPvpResult(createPvpProfile(), true);
assert(pvp.rating > 1000);

const boss = damageWorldBoss(spawnWorldBoss("void-warden", "riftlands", 1000), 250);
assert.equal(boss.currentHp, 750);

const talent = investTalent(createTalentState(1), STARTER_TALENTS[0]!);
assert.equal(talent.ranks.vanguard, 1);

console.log("RPG MMORPG system tests passed");
