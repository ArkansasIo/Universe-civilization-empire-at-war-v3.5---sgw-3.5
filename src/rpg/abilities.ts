export type AbilityTarget = "self" | "ally" | "enemy" | "area";

export interface AbilityDefinition {
  id: string;
  name: string;
  level: number;
  target: AbilityTarget;
  resourceCost: number;
  cooldownSeconds: number;
  power: number;
  tags: string[];
}

export interface AbilityState {
  unlocked: Set<string>;
  cooldownUntil: Record<string, number>;
}

export const STARTER_ABILITIES: AbilityDefinition[] = [
  { id: "basic-strike", name: "Basic Strike", level: 1, target: "enemy", resourceCost: 0, cooldownSeconds: 0, power: 1, tags: ["physical"] },
  { id: "power-attack", name: "Power Attack", level: 5, target: "enemy", resourceCost: 20, cooldownSeconds: 5, power: 1.75, tags: ["physical", "heavy"] },
  { id: "arcane-bolt", name: "Arcane Bolt", level: 5, target: "enemy", resourceCost: 20, cooldownSeconds: 3, power: 1.5, tags: ["magical"] },
  { id: "battle-ward", name: "Battle Ward", level: 10, target: "ally", resourceCost: 30, cooldownSeconds: 20, power: 0.2, tags: ["defensive"] }
];

export function createAbilityState(): AbilityState {
  return { unlocked: new Set(), cooldownUntil: {} };
}

export function unlockAbility(state: AbilityState, ability: AbilityDefinition, level: number): AbilityState {
  if (level < ability.level) throw new Error(`level ${ability.level} required for ${ability.id}`);
  const unlocked = new Set(state.unlocked);
  unlocked.add(ability.id);
  return { ...state, unlocked };
}

export function canUseAbility(state: AbilityState, ability: AbilityDefinition, nowMs: number): boolean {
  return state.unlocked.has(ability.id) && (state.cooldownUntil[ability.id] ?? 0) <= nowMs;
}

export function startCooldown(state: AbilityState, ability: AbilityDefinition, nowMs: number): AbilityState {
  return { ...state, cooldownUntil: { ...state.cooldownUntil, [ability.id]: nowMs + ability.cooldownSeconds * 1000 } };
}
