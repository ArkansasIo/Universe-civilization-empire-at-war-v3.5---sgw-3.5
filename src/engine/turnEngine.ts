import type { PlanetColony, PlayerResources } from '../types';
import { grantResources } from './resourceTransactions';

export interface TurnEngineConfig {
  maxTurns: number;
  turnsGeneratedPerTick: number;
  naquadahPerMiner: number;
  naquadahPerLifer: number;
  colonyProductionMultiplier: number;
}

export interface TurnSnapshot {
  resources: PlayerResources;
  colonies: PlanetColony[];
  processedTurns: number;
  generatedNaquadah: number;
}

export const DEFAULT_TURN_ENGINE_CONFIG: TurnEngineConfig = {
  maxTurns: 10000,
  turnsGeneratedPerTick: 1,
  naquadahPerMiner: 20,
  naquadahPerLifer: 80,
  colonyProductionMultiplier: 1,
};

function safeInteger(value: number): number {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
}

export function calculateNaturalIncome(
  resources: PlayerResources,
  colonies: PlanetColony[],
  config: TurnEngineConfig = DEFAULT_TURN_ENGINE_CONFIG,
): number {
  const workforceIncome =
    safeInteger(resources.miners) * config.naquadahPerMiner +
    safeInteger(resources.lifers) * config.naquadahPerLifer;

  const colonyIncome = colonies.reduce((sum, colony) => {
    const production = colony.naquadahProductionRate ?? 0;
    const bonus = Math.max(0, colony.incomeBonus ?? 0);
    return sum + production * (1 + bonus);
  }, 0);

  return Math.max(
    0,
    Math.floor((workforceIncome + colonyIncome) * config.colonyProductionMultiplier),
  );
}

/**
 * Processes turns as a pure state transition. No input object is mutated.
 * A turn is consumed only when the caller has an available turn and the
 * resulting resource transaction is valid.
 */
export function processTurns(
  resources: PlayerResources,
  colonies: PlanetColony[],
  requestedTurns: number,
  config: TurnEngineConfig = DEFAULT_TURN_ENGINE_CONFIG,
): TurnSnapshot {
  const availableTurns = safeInteger(resources.attackTurns ?? resources.turnBank ?? 0);
  const turns = Math.min(safeInteger(requestedTurns), availableTurns);

  if (turns === 0) {
    return {
      resources: { ...resources },
      colonies,
      processedTurns: 0,
      generatedNaquadah: 0,
    };
  }

  const incomePerTurn = calculateNaturalIncome(resources, colonies, config);
  const income = incomePerTurn * turns;
  const granted = grantResources(resources, { naquadah: income });
  if (!granted.ok) {
    return {
      resources: { ...resources },
      colonies,
      processedTurns: 0,
      generatedNaquadah: 0,
    };
  }

  const next = { ...granted.resources };
  next.attackTurns = Math.max(0, availableTurns - turns);

  return {
    resources: next,
    colonies,
    processedTurns: turns,
    generatedNaquadah: income,
  };
}

export function accrueTurns(
  resources: PlayerResources,
  elapsedTicks: number,
  config: TurnEngineConfig = DEFAULT_TURN_ENGINE_CONFIG,
): PlayerResources {
  const ticks = safeInteger(elapsedTicks);
  const current = safeInteger(resources.attackTurns ?? resources.turnBank ?? 0);
  const generated = ticks * safeInteger(config.turnsGeneratedPerTick);
  const cap = Math.max(0, safeInteger(config.maxTurns));
  const nextTurns = Math.min(cap, current + generated);

  return {
    ...resources,
    attackTurns: nextTurns,
    turnBank: nextTurns,
  };
}
