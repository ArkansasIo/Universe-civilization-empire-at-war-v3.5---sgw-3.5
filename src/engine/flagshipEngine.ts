export const FLAGSHIP_SUBSYSTEMS = [
  'bridge',
  'reactor',
  'spinal-lance',
  'deflector',
  'carrier-bays',
  'nanite-hull',
  'tachyon-sensors',
  'auxiliary-capacitors',
] as const;

export type FlagshipSubsystem = (typeof FLAGSHIP_SUBSYSTEMS)[number];
export type FlagshipPowerAllocation = Record<FlagshipSubsystem, number>;

export interface FlagshipPowerGrid {
  capacity: number;
  allocated: number;
  reserve: number;
  efficiency: Record<FlagshipSubsystem, number>;
}

export function calculateFlagshipPowerGrid(
  capacity: number,
  allocation: FlagshipPowerAllocation,
): FlagshipPowerGrid {
  if (!Number.isFinite(capacity) || capacity < 0) throw new Error('INVALID_POWER_CAPACITY');

  const entries = FLAGSHIP_SUBSYSTEMS.map((subsystem) => {
    const power = allocation[subsystem];
    if (!Number.isFinite(power) || power < 0) throw new Error('INVALID_POWER_ALLOCATION');
    return [subsystem, power] as const;
  });
  const allocated = entries.reduce((sum, [, power]) => sum + power, 0);
  if (!Number.isFinite(allocated) || allocated > capacity) throw new Error('POWER_CAPACITY_EXCEEDED');

  const efficiency = Object.fromEntries(
    entries.map(([subsystem, power]) => [subsystem, capacity === 0 ? 0 : power / capacity]),
  ) as Record<FlagshipSubsystem, number>;

  return { capacity, allocated, reserve: capacity - allocated, efficiency };
}

export interface FlagshipHardpoint {
  id: string;
  capacity: number;
  weaponId?: string;
  weaponPower?: number;
}

export function fitFlagshipWeapon(
  hardpoints: FlagshipHardpoint[],
  hardpointId: string,
  weaponId: string,
  weaponPower: number,
): FlagshipHardpoint[] {
  if (!weaponId || !Number.isFinite(weaponPower) || weaponPower < 0) throw new Error('INVALID_WEAPON_FIT');
  const index = hardpoints.findIndex((hardpoint) => hardpoint.id === hardpointId);
  if (index < 0) throw new Error('HARDPOINT_NOT_FOUND');
  if (new Set(hardpoints.map((hardpoint) => hardpoint.id)).size !== hardpoints.length) {
    throw new Error('DUPLICATE_HARDPOINT_ID');
  }
  const hardpoint = hardpoints[index];
  if (hardpoint.weaponId) throw new Error('HARDPOINT_OCCUPIED');
  if (!Number.isFinite(hardpoint.capacity) || hardpoint.capacity < 0) throw new Error('INVALID_HARDPOINT_CAPACITY');
  if (hardpoint.capacity < weaponPower) {
    throw new Error('HARDPOINT_CAPACITY_EXCEEDED');
  }

  return hardpoints.map((item, itemIndex) =>
    itemIndex === index ? { ...item, weaponId, weaponPower } : { ...item },
  );
}
