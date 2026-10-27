import type { BossDefinition, EnemyDefinition, ItemDefinition, LootTableDefinition, StatusEffectDefinition, EncounterDefinition } from './types';

const attributes = (str: number, dex: number, con: number, int: number, wis: number, vit: number, spi: number, lck: number, wil: number, cha: number) =>
  ({ str, dex, con, int, wis, vit, spi, lck, wil, cha });
const stats = (attackPower: number, spellPower: number, armor: number, magicResistance: number, accuracy = 0.8, evasion = 0.1) => ({
  attackPower, spellPower, accuracy, evasion, critChance: 0.05, critDamage: 0.5, attackSpeed: 1,
  castSpeed: 1, armor, magicResistance, armorPenetration: 0, magicPenetration: 0, blockChance: 0.05,
  blockValue: 5, parryChance: 0.03, dodgeChance: 0.05, damageReduction: 0, tenacity: 0,
  poise: 10, healingPower: 0, cooldownReduction: 0, moveSpeed: 1,
});
const resources = (hp: number, mp = 100, stamina = 100) => ({ hp, maxHp: hp, mp, maxMp: mp, stamina, maxStamina: stamina });

export const statusEffects: StatusEffectDefinition[] = [
  { id: 'power-surge', name: 'Power Surge', category: 'buff', durationMs: 12000, stackMode: 'refresh', maxStacks: 1, modifiers: [{ stat: 'attackPower', mode: 'percent', value: 0.2 }] },
  { id: 'fortified', name: 'Fortified', category: 'buff', durationMs: 10000, stackMode: 'refresh', maxStacks: 1, modifiers: [{ stat: 'armor', mode: 'percent', value: 0.25 }] },
  { id: 'regeneration', name: 'Regeneration', category: 'healOverTime', durationMs: 8000, stackMode: 'refresh', maxStacks: 1, tickIntervalMs: 1000, tickPower: 0.04 },
  { id: 'burning', name: 'Burning', category: 'damageOverTime', durationMs: 6000, stackMode: 'additive', maxStacks: 3, damageType: 'fire', tickIntervalMs: 1000, tickPower: 0.05, cleanseType: 'magic' },
  { id: 'poisoned', name: 'Poisoned', category: 'damageOverTime', durationMs: 10000, stackMode: 'additive', maxStacks: 5, damageType: 'poison', tickIntervalMs: 2000, tickPower: 0.03, cleanseType: 'poison' },
  { id: 'stunned', name: 'Stunned', category: 'crowdControl', durationMs: 2000, stackMode: 'replaceStrongest', maxStacks: 1, tags: ['cc', 'interrupts'] },
  { id: 'shattered-armor', name: 'Shattered Armor', category: 'debuff', durationMs: 8000, stackMode: 'additive', maxStacks: 3, modifiers: [{ stat: 'armor', mode: 'percent', value: -0.08 }] },
];

export const items: ItemDefinition[] = [
  { id: 'ashen-blade-pve', name: 'Ashen Blade', description: 'A cinder-edged sword tuned for PvE encounters.', kind: 'weapon', rarity: 'epic', itemLevel: 80, requiredLevel: 40, slot: 'mainHand', attributes: { str: 50 }, stats: { attackPower: 120, critChance: 0.05 }, pve: { statScale: 1, damageMultiplier: 1, bossDamageBonus: 0.15, procIds: ['burning'] }, pvp: { statScale: 0.65, damageMultiplier: 0.7, resilience: 25 }, tags: ['sword', 'fire', 'pve'] },
  { id: 'vanguard-aegis-pvp', name: 'Vanguard Aegis', description: 'A reliable defensive off-hand for arena combat.', kind: 'armor', rarity: 'epic', itemLevel: 80, requiredLevel: 40, slot: 'offHand', stats: { armor: 90, damageReduction: 0.08, tenacity: 20 }, pve: { statScale: 1 }, pvp: { statScale: 1, damageMultiplier: 1, resilience: 50, healingReduction: 0.05 }, tags: ['shield', 'pvp', 'defensive'] },
  { id: 'phoenix-revival-tonic', name: 'Phoenix Revival Tonic', description: 'A rare consumable used to recover health in PvE.', kind: 'consumable', rarity: 'rare', itemLevel: 45, requiredLevel: 10, stackLimit: 10, sellValue: 75, tags: ['healing', 'consumable'] },
];

export const enemies: EnemyDefinition[] = [
  { id: 'rift-stalker', name: 'Rift Stalker', species: 'Void Beast', rank: 'normal', role: 'assassin', level: 12, attributes: attributes(16, 22, 12, 8, 10, 14, 8, 12, 10, 4), baseStats: stats(35, 8, 12, 8, 0.82, 0.22), baseResources: resources(650, 50, 120), abilities: ['quick-strike', 'shadow-pounce'], resistances: { void: 0.15 }, immunities: [], affixes: [], lootTableId: 'rift-common', xpReward: 50, tags: ['beast', 'void', 'mob'] },
  { id: 'naquadah-sentinel', name: 'Naquadah Sentinel', species: 'Construct', rank: 'elite', role: 'tank', level: 25, attributes: attributes(30, 8, 35, 8, 12, 38, 6, 2, 25, 2), baseStats: stats(70, 5, 120, 80, 0.78, 0.04), baseResources: resources(7500, 0, 150), abilities: ['shield-bash', 'fortify', 'ground-pulse'], resistances: { physical: 0.25, fire: -0.1 }, immunities: ['poison'], affixes: ['fortified'], lootTableId: 'sentinel-elite', xpReward: 450, tags: ['construct', 'elite', 'guardian'] },
];

export const bosses: BossDefinition[] = [
  {
    id: 'system-lord-vorath', name: 'System Lord Vorath', species: 'Goa’uld Warlord', rank: 'boss', role: 'caster', level: 50,
    attributes: attributes(70, 35, 80, 100, 65, 95, 80, 35, 75, 85),
    baseStats: stats(320, 460, 450, 520, 0.9, 0.1),
    baseResources: resources(180000, 8000, 2000), abilities: ['staff-blast', 'naquadah-storm', 'jaffa-reinforcements'],
    resistances: { fire: 0.2, arcane: 0.25, physical: 0.1 }, immunities: ['charm', 'fear'],
    affixes: ['arcane-shield'], lootTableId: 'system-lord-cache', xpReward: 12000, tags: ['boss', 'system-lord', 'stargate'],
    enrageAfterMs: 480000, enrageDamagePerInterval: 0.12, enrageIntervalMs: 15000,
    partyScaling: { hpPerAdditionalPlayer: 0.65, damagePerAdditionalPlayer: 0.15 },
    phases: [
      { id: 'phase-1', name: 'Ascendant Guard', trigger: { type: 'hpPercent', value: 0.75 }, abilities: ['staff-blast', 'mark-target'] },
      { id: 'phase-2', name: 'Jaffa Reinforcements', trigger: { type: 'hpPercent', value: 0.5 }, abilities: ['naquadah-storm'], spawnAdds: ['jaffa-elite'] },
      { id: 'phase-3', name: 'Corrupted Naquadah', trigger: { type: 'hpPercent', value: 0.25 }, abilities: ['void-pulse', 'naquadah-storm'], arenaHazards: ['corruption-zones'], damageMultiplier: 1.25 },
    ],
  },
];

export const lootTables: LootTableDefinition[] = [
  { id: 'rift-common', rolls: 1, entries: [{ itemId: 'rift-hide', weight: 60, minQuantity: 1, maxQuantity: 3 }, { itemId: 'naquadah-shard', weight: 40, minQuantity: 1, maxQuantity: 2 }], currencyRange: { min: 10, max: 35 } },
  { id: 'sentinel-elite', rolls: 2, entries: [{ itemId: 'sentinel-core', weight: 45 }, { itemId: 'vanguard-aegis-pvp', weight: 15 }, { itemId: 'naquadah-crystal', weight: 40 }], currencyRange: { min: 100, max: 350 } },
  { id: 'system-lord-cache', rolls: 3, entries: [{ itemId: 'ashen-blade-pve', weight: 25 }, { itemId: 'lord-relic', weight: 25 }, { itemId: 'naquadah-crystal', weight: 50 }], currencyRange: { min: 5000, max: 15000 }, pity: { itemId: 'lord-relic', failedRollThreshold: 12 } },
];

export const encounters: EncounterDefinition[] = [
  { id: 'riftlands-skirmish', name: 'Riftlands Skirmish', kind: 'openWorld', recommendedLevel: 10, minPlayers: 1, maxPlayers: 5, difficulty: 'normal', enemyGroups: [{ enemyId: 'rift-stalker', count: 4 }], objectives: ['Defeat the rift patrol'], rewardLootTableIds: ['rift-common'] },
  { id: 'naquadah-vault', name: 'Naquadah Vault', kind: 'dungeon', recommendedLevel: 25, minPlayers: 3, maxPlayers: 5, difficulty: 'hard', enemyGroups: [{ enemyId: 'naquadah-sentinel', count: 2 }], objectives: ['Disable three warding pylons', 'Defeat the sentinel'], rewardLootTableIds: ['sentinel-elite'] },
  { id: 'system-lord-crusade', name: 'System Lord Crusade', kind: 'raid', recommendedLevel: 50, minPlayers: 8, maxPlayers: 40, difficulty: 'mythic', enemyGroups: [{ enemyId: 'naquadah-sentinel', count: 4 }], bossIds: ['system-lord-vorath'], objectives: ['Break the arcane shield', 'Survive all phases', 'Defeat System Lord Vorath'], timerMs: 600000, rewardLootTableIds: ['system-lord-cache'] },
];
