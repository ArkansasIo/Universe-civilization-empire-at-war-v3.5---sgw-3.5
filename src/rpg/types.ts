/** Shared, engine-agnostic RPG/MMORPG contracts for the Universe Civilization client.
 * Keep combat resolution deterministic and server-authoritative for multiplayer use.
 */
export type DamageType =
  | 'physical' | 'fire' | 'ice' | 'lightning' | 'earth' | 'wind' | 'water'
  | 'light' | 'dark' | 'arcane' | 'poison' | 'bleed' | 'void' | 'chaos' | 'true';

export type CoreAttributes = {
  str: number; dex: number; con: number; int: number; wis: number;
  vit: number; spi: number; lck: number; wil: number; cha: number;
};

export type DerivedStats = {
  attackPower: number; spellPower: number; accuracy: number; evasion: number;
  critChance: number; critDamage: number; attackSpeed: number; castSpeed: number;
  armor: number; magicResistance: number; armorPenetration: number;
  magicPenetration: number; blockChance: number; blockValue: number; parryChance: number;
  dodgeChance: number; damageReduction: number; tenacity: number; poise: number;
  healingPower: number; cooldownReduction: number; moveSpeed: number;
};

export type Resources = { hp: number; maxHp: number; mp: number; maxMp: number; stamina: number; maxStamina: number; };
export type CombatContext = 'pve' | 'pvp';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'ascended';
export type ItemKind = 'weapon' | 'armor' | 'accessory' | 'trinket' | 'consumable' | 'material' | 'quest' | 'cosmetic';
export type EquipmentSlot =
  | 'head' | 'chest' | 'legs' | 'gloves' | 'boots' | 'mainHand' | 'offHand'
  | 'ring1' | 'ring2' | 'amulet' | 'cloak' | 'belt' | 'trinket1' | 'trinket2';

export type StatKey = keyof CoreAttributes | keyof DerivedStats;
export type StatModifier = { stat: StatKey; mode: 'flat' | 'percent'; value: number };
export type EffectStackMode = 'none' | 'refresh' | 'additive' | 'replaceStrongest' | 'independent';
export type EffectCategory = 'buff' | 'debuff' | 'crowdControl' | 'damageOverTime' | 'healOverTime' | 'shield';
export type StatusEffectDefinition = {
  id: string; name: string; category: EffectCategory; durationMs: number;
  stackMode: EffectStackMode; maxStacks: number; modifiers?: StatModifier[];
  damageType?: DamageType; tickIntervalMs?: number; tickPower?: number;
  cleanseType?: 'physical' | 'magic' | 'curse' | 'poison' | 'bleed' | 'all';
  tags?: string[];
};

export type ItemDefinition = {
  id: string; name: string; description: string; kind: ItemKind; rarity: ItemRarity;
  itemLevel: number; requiredLevel: number; slot?: EquipmentSlot;
  attributes?: Partial<CoreAttributes>; stats?: Partial<DerivedStats>;
  pve?: { statScale?: number; damageMultiplier?: number; bossDamageBonus?: number; procIds?: string[] };
  pvp?: { statScale?: number; damageMultiplier?: number; healingReduction?: number; resilience?: number; procIds?: string[] };
  tags?: string[]; setId?: string; stackLimit?: number; sellValue?: number; bindOnPickup?: boolean;
};

export type EnemyRank = 'normal' | 'veteran' | 'elite' | 'champion' | 'boss' | 'raidBoss' | 'mythic' | 'ascended';
export type EnemyRole = 'bruiser' | 'tank' | 'assassin' | 'sniper' | 'caster' | 'controller' | 'summoner' | 'support' | 'trickster';
export type EnemyDefinition = {
  id: string; name: string; species: string; rank: EnemyRank; role: EnemyRole; level: number;
  attributes: CoreAttributes; baseStats: DerivedStats; baseResources: Resources;
  abilities: string[]; resistances: Partial<Record<DamageType, number>>;
  immunities: string[]; affixes: string[]; lootTableId: string;
  xpReward: number; tags: string[];
};

export type BossPhaseTrigger =
  | { type: 'hpPercent'; value: number }
  | { type: 'elapsedMs'; value: number }
  | { type: 'addCount'; value: number }
  | { type: 'objective'; id: string };
export type BossPhase = {
  id: string; name: string; trigger: BossPhaseTrigger; abilities: string[];
  spawnAdds?: string[]; arenaHazards?: string[]; resistanceOverrides?: Partial<Record<DamageType, number>>;
  damageMultiplier?: number;
};
export type BossDefinition = EnemyDefinition & {
  rank: 'boss' | 'raidBoss' | 'mythic' | 'ascended';
  phases: BossPhase[]; enrageAfterMs?: number; enrageDamagePerInterval?: number;
  enrageIntervalMs?: number; partyScaling?: { hpPerAdditionalPlayer: number; damagePerAdditionalPlayer: number };
};

export type LootEntry = { itemId: string; weight: number; minQuantity?: number; maxQuantity?: number };
export type LootTableDefinition = {
  id: string; rolls: number; entries: LootEntry[]; currencyRange?: { min: number; max: number };
  pity?: { itemId: string; failedRollThreshold: number };
};
export type EncounterDefinition = {
  id: string; name: string; kind: 'openWorld' | 'dungeon' | 'raid' | 'event' | 'story' | 'arena';
  recommendedLevel: number; minPlayers: number; maxPlayers: number; difficulty: DifficultyTier;
  enemyGroups: Array<{ enemyId: string; count: number }>; bossIds?: string[];
  objectives: string[]; timerMs?: number; rewardLootTableIds: string[];
};
export type DifficultyTier = 'normal' | 'hard' | 'nightmare' | 'mythic' | 'ascended' | 'apocalypse';
export type Combatant = {
  id: string; level: number; context: CombatContext; attributes: CoreAttributes;
  stats: DerivedStats; resources: Resources; effects?: ActiveStatusEffect[];
};
export type ActiveStatusEffect = { definitionId: string; stacks: number; expiresAt: number; nextTickAt?: number; sourceId?: string };
export type DamageRequest = {
  attacker: Combatant; defender: Combatant; baseDamage: number; damageType: DamageType;
  skillCoefficient?: number; isCritical?: boolean; isBossTarget?: boolean; seed?: string;
};
export type DamageResult = {
  rawDamage: number; afterMitigation: number; absorbed: number; finalDamage: number;
  hit: boolean; critical: boolean; damageType: DamageType;
};
