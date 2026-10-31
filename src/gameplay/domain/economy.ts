import type { ResourceWallet } from "./types";
import { assertFiniteNonNegative } from "./types";
export interface Workforce { untrained: number; miners: number; lifers: number; }
export interface EconomyModifiers { raceMultiplier?: number; readinessMultiplier?: number; maintenance?: number; }
/** GDD baseline: civilians produce 20, miners and lifers produce 80 Naquadah per tick. */
export function calculateNaturalIncome(workforce: Workforce): number {
  for (const [key, value] of Object.entries(workforce)) assertFiniteNonNegative(value, key);
  return workforce.untrained * 20 + (workforce.miners + workforce.lifers) * 80;
}
export function calculateNetTurnIncome(workforce: Workforce, modifiers: EconomyModifiers = {}): number {
  const gross = calculateNaturalIncome(workforce);
  const maintenance = modifiers.maintenance ?? 0;
  const race = modifiers.raceMultiplier ?? 1;
  const readiness = modifiers.readinessMultiplier ?? 1;
  for (const [key, value] of Object.entries({ maintenance, race, readiness })) assertFiniteNonNegative(value, key);
  return Math.max(0, gross - maintenance) * race * readiness;
}
export function addResources(wallet: ResourceWallet, delta: Partial<ResourceWallet>): ResourceWallet {
  const next = { ...wallet };
  for (const [key, amount] of Object.entries(delta) as [keyof ResourceWallet, number][]) {
    assertFiniteNonNegative(amount, key);
    next[key] += amount;
  }
  return next;
}
export function spendResources(wallet: ResourceWallet, cost: Partial<ResourceWallet>): ResourceWallet {
  const next = { ...wallet };
  for (const [key, amount] of Object.entries(cost) as [keyof ResourceWallet, number][]) {
    assertFiniteNonNegative(amount, key);
    if (next[key] < amount) throw new Error("Insufficient resource: " + key);
    next[key] -= amount;
  }
  return next;
}
