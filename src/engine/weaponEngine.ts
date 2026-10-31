import type { PlayerResources, PlayerWeapon } from '../types';
import { spendResources, type ResourceDelta } from './resourceTransactions';

export function degradeWeaponDurability(
  weapons: PlayerWeapon[],
  battleRounds: number,
  durabilityPerRound = 1,
): PlayerWeapon[] {
  if (!Number.isSafeInteger(battleRounds) || battleRounds < 0) throw new Error('INVALID_BATTLE_ROUNDS');
  if (!Number.isFinite(durabilityPerRound) || durabilityPerRound < 0) {
    throw new Error('INVALID_DURABILITY_RATE');
  }
  return weapons.map((weapon) => {
    if (!Number.isFinite(weapon.durability) || weapon.durability < 0 || weapon.durability > 100) {
      throw new Error('INVALID_WEAPON_DURABILITY');
    }
    return {
      ...weapon,
      durability: Math.max(0, weapon.durability - battleRounds * durabilityPerRound),
    };
  });
}

export interface WeaponRepairResult {
  ok: boolean;
  reason?: string;
  resources: PlayerResources;
  weapon: PlayerWeapon;
  cost: ResourceDelta;
}

export function repairWeapon(
  resources: PlayerResources,
  weapon: PlayerWeapon,
  targetDurability: number,
  costPerDurabilityPoint: ResourceDelta,
): WeaponRepairResult {
  if (!Number.isFinite(weapon.durability) || weapon.durability < 0 || weapon.durability > 100) {
    throw new Error('INVALID_WEAPON_DURABILITY');
  }
  if (!Number.isFinite(targetDurability) || targetDurability < weapon.durability || targetDurability > 100) {
    throw new Error('INVALID_REPAIR_TARGET');
  }
  const points = targetDurability - weapon.durability;
  const cost = Object.fromEntries(
    Object.entries(costPerDurabilityPoint).map(([resource, amount]) => {
      if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
        throw new Error('INVALID_REPAIR_COST');
      }
      return [resource, Math.ceil(amount * points)];
    }),
  );
  const transaction = spendResources(resources, cost);
  if (!transaction.ok) {
    return {
      ok: false,
      reason: transaction.reason,
      resources: { ...resources },
      weapon: { ...weapon },
      cost,
    };
  }
  return {
    ok: true,
    resources: transaction.resources,
    weapon: { ...weapon, durability: targetDurability },
    cost,
  };
}
