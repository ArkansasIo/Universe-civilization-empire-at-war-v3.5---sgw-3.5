import type { CombatContext, Combatant, DamageRequest, DamageResult, DerivedStats, ItemDefinition, StatKey } from './types';

export const CAPS = {
  pve: { critChance: 0.70, cooldownReduction: 0.60, damageReduction: 0.70, healingBonus: 1.00, ccDuration: 1.00 },
  pvp: { critChance: 0.40, cooldownReduction: 0.35, damageReduction: 0.60, healingBonus: 0.50, ccDuration: 0.50 },
} as const;

export const CONTEXT_MULTIPLIERS: Record<CombatContext, Partial<Record<keyof DerivedStats, number>>> = {
  pve: { attackPower: 1, spellPower: 1, critChance: 1, critDamage: 1, healingPower: 1, cooldownReduction: 1 },
  pvp: { attackPower: 0.70, spellPower: 0.70, critChance: 0.50, critDamage: 0.60, healingPower: 0.65, cooldownReduction: 0.50 },
};

export const STAT_WEIGHTS: Partial<Record<StatKey, number>> = {
  str: 1, dex: 1, int: 1, vit: 0.85, con: 0.85, wis: 0.9, spi: 0.9, lck: 0.5, wil: 0.8, cha: 0.5,
  attackPower: 1, spellPower: 1, accuracy: 0.9, evasion: 1.1, critChance: 2.5, critDamage: 1.75,
  attackSpeed: 2, castSpeed: 1.5, armor: 0.75, magicResistance: 0.9, armorPenetration: 1.1,
  magicPenetration: 1.1, blockChance: 1.2, blockValue: 0.8, parryChance: 1.2, dodgeChance: 1.3,
  damageReduction: 2.5, tenacity: 1.2, poise: 0.8, healingPower: 1, cooldownReduction: 2.25, moveSpeed: 1,
};

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
export function softCap(raw: number, cap: number): number {
  if (raw <= 0 || cap <= 0) return Math.max(0, raw);
  return (raw * cap) / (raw + cap);
}
export function diminishingReturns(raw: number, cap: number, k: number): number {
  if (raw <= 0 || cap <= 0 || k <= 0) return 0;
  return cap * (1 - Math.exp(-raw / k));
}
export function hitChance(accuracy: number, evasion: number): number {
  return clamp(accuracy / Math.max(1, accuracy + evasion), 0.05, 0.95);
}
export function armorMitigation(armor: number, attackerLevel: number, k = 75): number {
  return clamp(armor / Math.max(1, armor + k * Math.max(1, attackerLevel)), 0, CAPS.pve.damageReduction);
}
export function contextAdjustedStats(stats: DerivedStats, context: CombatContext): DerivedStats {
  const result = { ...stats };
  const factors = CONTEXT_MULTIPLIERS[context];
  for (const [key, factor] of Object.entries(factors)) {
    const stat = key as keyof DerivedStats;
    result[stat] = (result[stat] as number) * (factor ?? 1);
  }
  result.critChance = Math.min(result.critChance, CAPS[context].critChance);
  result.cooldownReduction = Math.min(result.cooldownReduction, CAPS[context].cooldownReduction);
  result.damageReduction = Math.min(result.damageReduction, CAPS[context].damageReduction);
  return result;
}

/** Simple, deterministic FNV-1a based roll. Use a server-generated seed in authoritative combat. */
function seededRoll(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

export function resolveDamage(request: DamageRequest): DamageResult {
  const { attacker, defender } = request;
  const context = attacker.context;
  const chance = hitChance(attacker.stats.accuracy, defender.stats.evasion);
  const roll = seededRoll(request.seed ?? [attacker.id, defender.id, request.baseDamage, request.damageType].join(':'));
  const hit = roll <= chance;
  const critical = Boolean(request.isCritical);
  if (!hit) return { rawDamage: 0, afterMitigation: 0, absorbed: 0, finalDamage: 0, hit: false, critical: false, damageType: request.damageType };

  const stats = contextAdjustedStats(attacker.stats, context);
  const defenderStats = contextAdjustedStats(defender.stats, defender.context);
  const rawDamage = Math.max(0, request.baseDamage * (request.skillCoefficient ?? 1) + (request.damageType === 'physical' ? stats.attackPower : stats.spellPower));
  const criticalDamage = critical ? rawDamage * (1 + Math.max(0, stats.critDamage)) : rawDamage;
  const armorBased = request.damageType === 'physical' || request.damageType === 'bleed';
  const mitigation = armorBased
    ? armorMitigation(Math.max(0, defenderStats.armor - stats.armorPenetration), attacker.level)
    : armorMitigation(Math.max(0, defenderStats.magicResistance - stats.magicPenetration), attacker.level);
  const afterMitigation = request.damageType === 'true' ? criticalDamage : criticalDamage * (1 - mitigation);
  const resistance = clamp(defender.effects?.length ? 0 : 0, 0, 1); // Typed resistance maps are applied by enemy encounter resolution.
  const pvpFactor = context === 'pvp' ? 0.70 : 1;
  const bossFactor = request.isBossTarget ? 1.0 : 1;
  const finalDamage = Math.max(0, Math.floor(afterMitigation * (1 - resistance) * pvpFactor * bossFactor));
  return { rawDamage: Math.floor(rawDamage), afterMitigation: Math.floor(afterMitigation), absorbed: 0, finalDamage, hit: true, critical, damageType: request.damageType };
}

export function calculateMaxHp(vit: number, con: number, gearHp = 0): number {
  return Math.max(1, Math.floor(Math.max(0, vit) * 15 + Math.max(0, con) * 10 + gearHp));
}
export function calculateItemPower(item: ItemDefinition, context: CombatContext): number {
  const weightValue = (values: Record<string, number | undefined>) =>
    Object.entries(values).reduce((sum, [key, value]) => sum + Math.max(0, value ?? 0) * (STAT_WEIGHTS[key as StatKey] ?? 1), 0);
  const base = weightValue(item.attributes ?? {}) + weightValue(item.stats ?? {});
  const contextScale = context === 'pvp' ? (item.pvp?.statScale ?? 0.65) : (item.pve?.statScale ?? 1);
  const contextDamage = context === 'pvp' ? (item.pvp?.damageMultiplier ?? 0.70) : (item.pve?.damageMultiplier ?? 1);
  const bossBonus = context === 'pve' ? (item.pve?.bossDamageBonus ?? 0) : 0;
  return Math.round(base * contextScale * contextDamage * (1 + bossBonus) * 100) / 100;
}
export function calculateEncounterScaling(input: {
  baseHp: number; baseDamage: number; enemyLevel: number; playerLevel: number;
  players: number; difficultyMultiplier: number;
}): { hp: number; damage: number } {
  const levelDiff = Math.max(-5, Math.min(20, input.playerLevel - input.enemyLevel));
  const party = Math.max(1, input.players);
  const hp = input.baseHp * Math.max(0.1, 1 + levelDiff * 0.18) * (1 + (party - 1) * 0.65) * input.difficultyMultiplier;
  const damage = input.baseDamage * Math.max(0.1, 1 + levelDiff * 0.12) * (1 + (party - 1) * 0.15) * input.difficultyMultiplier;
  return { hp: Math.max(1, Math.floor(hp)), damage: Math.max(1, Math.floor(damage)) };
}
export function calculateThreat(input: { damage: number; healing: number; threatMultiplier?: number; flatThreat?: number; healingWeight?: number }): number {
  return Math.max(0, input.damage * (input.threatMultiplier ?? 1) + input.healing * (input.healingWeight ?? 0.5) + (input.flatThreat ?? 0));
}
