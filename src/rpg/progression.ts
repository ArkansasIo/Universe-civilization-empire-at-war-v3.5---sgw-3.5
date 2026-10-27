import type { CoreStats, StatBonuses } from "./types.js";

/** Class-level bonuses use runtime derived-stat names and are normalized by the progression consumer. */
export interface ClassStatBonuses { physicalPower?: number; magicalPower?: number; maxHp?: number; maxMana?: number; armor?: number; critChance?: number; critDamage?: number; evasion?: number; healingPower?: number; cooldownReduction?: number; }

export type RpgClassId = "warrior" | "ranger" | "mage" | "rogue" | "paladin" | "engineer";

export interface RpgClassDefinition {
  id: RpgClassId;
  name: string;
  description: string;
  primaryStats: (keyof CoreStats)[];
  baseBonuses: ClassStatBonuses;
}

export interface CharacterProgression {
  level: number;
  xp: number;
  skillPoints: number;
  classId: RpgClassId;
}

export const RPG_CLASSES: Record<RpgClassId, RpgClassDefinition> = {
  warrior: { id: "warrior", name: "Warrior", description: "Heavy frontline combatant.", primaryStats: ["STR", "VIT"], baseBonuses: { physicalPower: 12, maxHp: 60, armor: 8 } },
  ranger: { id: "ranger", name: "Ranger", description: "Mobile ranged damage dealer.", primaryStats: ["DEX", "WIS"], baseBonuses: { physicalPower: 9, critChance: 0.03, evasion: 0.03 } },
  mage: { id: "mage", name: "Mage", description: "High-output energy caster.", primaryStats: ["INT", "SPI"], baseBonuses: { magicalPower: 14, maxMana: 80, critChance: 0.02 } },
  rogue: { id: "rogue", name: "Rogue", description: "Critical-strike specialist.", primaryStats: ["DEX", "LCK"], baseBonuses: { physicalPower: 7, critChance: 0.06, critDamage: 0.15 } },
  paladin: { id: "paladin", name: "Paladin", description: "Defensive hybrid with recovery tools.", primaryStats: ["STR", "WIL"], baseBonuses: { physicalPower: 7, armor: 10, maxHp: 45, healingPower: 5 } },
  engineer: { id: "engineer", name: "Engineer", description: "Technology and support specialist.", primaryStats: ["INT", "CHA"], baseBonuses: { magicalPower: 8, physicalPower: 5, cooldownReduction: 0.03 } }
};

export function requiredXp(level: number): number {
  if (!Number.isInteger(level) || level < 1) throw new Error("level must be a positive integer");
  return Math.floor(level ** 2.5 * 500);
}

export function createProgression(classId: RpgClassId = "warrior"): CharacterProgression {
  if (!RPG_CLASSES[classId]) throw new Error(`Unknown class: ${classId}`);
  return { level: 1, xp: 0, skillPoints: 0, classId };
}

export function addExperience(state: CharacterProgression, amount: number, levelCap = 50): CharacterProgression {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("experience must be non-negative");
  const next = { ...state };
  next.xp += Math.floor(amount);
  while (next.level < levelCap && next.xp >= requiredXp(next.level)) {
    next.xp -= requiredXp(next.level);
    next.level += 1;
    next.skillPoints += 1;
  }
  return next;
}
