import type { PlanetColony, PlayerResources } from '../types';

export interface ColonyMaintenanceBreakdown {
  colonyId: string;
  grossTribute: number;
  maintenance: number;
  modifiers: {
    homeworld: number;
    logisticalStrain: number;
    specialization: number;
    taxPolicy: number;
  };
}

export interface EmpireIncomeBreakdown {
  workforceIncome: number;
  grossColonyTribute: number;
  grossIncome: number;
  totalMaintenance: number;
  raceMultiplier: number;
  defconMultiplier: number;
  netIncome: number;
  colonies: ColonyMaintenanceBreakdown[];
}

export interface EmpireIncomeOptions {
  race?: number;
  defcon?: number;
  naquadahPerUntrained?: number;
  naquadahPerMiner?: number;
  naquadahPerLifer?: number;
}

const SPECIALIZATION_MODIFIERS: Record<NonNullable<PlanetColony['specialization']>, number> = {
  homeworld: 1,
  mining: 0.9,
  trade: 0.85,
  industrial: 1.1,
  research: 1.15,
  fortress: 1.2,
};

const TAX_MODIFIERS: Record<NonNullable<PlanetColony['taxPolicy']>, number> = {
  extractive: 0.85,
  balanced: 1,
  subsidized: 1.25,
};

function requireNonNegativeFinite(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`INVALID_${name.toUpperCase()}`);
  return value;
}

function colonyLevel(colony: PlanetColony): number {
  if (!Number.isSafeInteger(colony.level) || colony.level < 1) throw new Error('INVALID_COLONY_LEVEL');
  return colony.level;
}

export function calculateColonyMaintenance(
  colony: PlanetColony,
  colonyCount: number,
): ColonyMaintenanceBreakdown {
  const level = colonyLevel(colony);
  if (!Number.isSafeInteger(colonyCount) || colonyCount < 0) throw new Error('INVALID_COLONY_COUNT');

  const homeworld = colony.isHomeworld ? 0.75 : 1;
  const logisticalStrain = 1 + Math.max(0, colonyCount - 2) * 0.08;
  const specialization = colony.specialization
    ? SPECIALIZATION_MODIFIERS[colony.specialization]
    : 1;
  const taxPolicy = colony.taxPolicy ? TAX_MODIFIERS[colony.taxPolicy] : 1;
  const baseCost = level * 2500 + Math.pow(level, 1.45) * 850;
  const maintenance = Math.max(
    1200,
    Math.round(baseCost * homeworld * logisticalStrain * specialization * taxPolicy),
  );
  if (!Number.isFinite(maintenance)) throw new Error('INVALID_MAINTENANCE_RESULT');
  const grossTribute = requireNonNegativeFinite(colony.naquadahProductionRate ?? 0, 'COLONY_TRIBUTE');

  return {
    colonyId: colony.id,
    grossTribute,
    maintenance,
    modifiers: { homeworld, logisticalStrain, specialization, taxPolicy },
  };
}

export function calculateEmpireIncome(
  resources: PlayerResources,
  colonies: PlanetColony[],
  options: EmpireIncomeOptions = {},
): EmpireIncomeBreakdown {
  const untrained = requireNonNegativeFinite(resources.untrainedUnits, 'UNTRAINED_UNITS');
  const miners = requireNonNegativeFinite(resources.miners, 'MINERS');
  const lifers = requireNonNegativeFinite(resources.lifers, 'LIFERS');
  const raceMultiplier = requireNonNegativeFinite(options.race ?? 1, 'RACE_MULTIPLIER');
  const defconMultiplier = requireNonNegativeFinite(options.defcon ?? 1, 'DEFCON_MULTIPLIER');
  const naquadahPerUntrained = requireNonNegativeFinite(
    options.naquadahPerUntrained ?? 20,
    'UNTRAINED_INCOME_RATE',
  );
  const naquadahPerMiner = requireNonNegativeFinite(options.naquadahPerMiner ?? 80, 'MINER_INCOME_RATE');
  const naquadahPerLifer = requireNonNegativeFinite(options.naquadahPerLifer ?? 80, 'LIFER_INCOME_RATE');

  const colonyBreakdowns = colonies.map((colony) =>
    calculateColonyMaintenance(colony, colonies.length),
  );
  const workforceIncome =
    untrained * naquadahPerUntrained +
    miners * naquadahPerMiner +
    lifers * naquadahPerLifer;
  const grossColonyTribute = colonyBreakdowns.reduce((sum, colony) => sum + colony.grossTribute, 0);
  const totalMaintenance = colonyBreakdowns.reduce((sum, colony) => sum + colony.maintenance, 0);
  const grossIncome = workforceIncome + grossColonyTribute;
  const netIncome = Math.floor(
    Math.max(0, grossIncome - totalMaintenance) * raceMultiplier * defconMultiplier,
  );

  if (![workforceIncome, grossColonyTribute, totalMaintenance, netIncome].every(Number.isFinite)) {
    throw new Error('INVALID_INCOME_RESULT');
  }

  return {
    workforceIncome,
    grossColonyTribute,
    grossIncome,
    totalMaintenance,
    raceMultiplier,
    defconMultiplier,
    netIncome,
    colonies: colonyBreakdowns,
  };
}
