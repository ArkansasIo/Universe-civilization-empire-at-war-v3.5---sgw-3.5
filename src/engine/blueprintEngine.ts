import type { ResourceDelta } from './resourceTransactions';

export interface BlueprintEfficiency {
  materialEfficiency: number;
  timeEfficiency: number;
}

function validateEfficiency(efficiency: BlueprintEfficiency): void {
  if (
    !Number.isFinite(efficiency.materialEfficiency) ||
    efficiency.materialEfficiency < 0 ||
    efficiency.materialEfficiency > 10
  ) {
    throw new Error('INVALID_MATERIAL_EFFICIENCY');
  }
  if (
    !Number.isFinite(efficiency.timeEfficiency) ||
    efficiency.timeEfficiency < 0 ||
    efficiency.timeEfficiency > 20
  ) {
    throw new Error('INVALID_TIME_EFFICIENCY');
  }
}

export function blueprintMaterialCost(
  baseCost: ResourceDelta,
  efficiency: BlueprintEfficiency,
): ResourceDelta {
  validateEfficiency(efficiency);
  const multiplier = 1 - efficiency.materialEfficiency / 100;
  return Object.fromEntries(
    Object.entries(baseCost).map(([resource, amount]) => {
      if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
        throw new Error('INVALID_BLUEPRINT_COST');
      }
      return [resource, Math.ceil(amount * multiplier)];
    }),
  );
}

export function blueprintManufacturingSeconds(
  baseSeconds: number,
  efficiency: BlueprintEfficiency,
): number {
  validateEfficiency(efficiency);
  if (!Number.isFinite(baseSeconds) || baseSeconds < 0) throw new Error('INVALID_MANUFACTURING_TIME');
  return Math.ceil(baseSeconds * (1 - efficiency.timeEfficiency / 100));
}
