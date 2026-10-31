import type { Government, Race } from '../types';

export interface FactionModifiers {
  economy: number;
  research: number;
  attack: number;
  defense: number;
  covert: number;
  colony: number;
  fleet: number;
  metalProduction: number;
  crystalProduction: number;
  deuteriumProduction: number;
  subspaceSpeed: number;
}

function positiveModifier(value: number | undefined, name: string): number {
  const result = value ?? 1;
  if (!Number.isFinite(result) || result < 0) throw new Error(`INVALID_${name.toUpperCase()}_MODIFIER`);
  return result;
}

export function calculateFactionModifiers(race: Race, government: Government): FactionModifiers {
  return {
    economy: positiveModifier(race.incomeModifier, 'race_economy') *
      positiveModifier(government.economyModifier, 'government_economy'),
    research: positiveModifier(government.researchModifier, 'research'),
    attack: positiveModifier(race.attackModifier, 'race_attack') *
      positiveModifier(government.militaryModifier, 'government_military'),
    defense: positiveModifier(race.defenseModifier, 'race_defense') *
      positiveModifier(government.defenseModifier, 'government_defense'),
    covert: positiveModifier(race.covertModifier, 'race_covert'),
    colony: positiveModifier(government.colonyModifier, 'colony'),
    fleet: positiveModifier(government.fleetModifier, 'fleet'),
    metalProduction: positiveModifier(government.metalMineModifier, 'metal_production'),
    crystalProduction: positiveModifier(government.crystalMineModifier, 'crystal_production'),
    deuteriumProduction: positiveModifier(government.deutMineModifier, 'deuterium_production'),
    subspaceSpeed: positiveModifier(government.subspaceSpeedModifier, 'subspace_speed'),
  };
}
