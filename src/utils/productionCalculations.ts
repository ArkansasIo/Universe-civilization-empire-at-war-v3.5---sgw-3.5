import { OGameFacility } from '../types';

export interface TurnProduction {
  metal: number;
  crystal: number;
  deuterium: number;
  energyProduced: number;
  energyNeeded: number;
  energyRatio: number;
}

// Per-turn mine yield after energy shortfall; shared by turn processing and the HUD so they always agree.
export function computeTurnProduction(facilities: OGameFacility[]): TurnProduction {
  const level = (id: string, fallback: number) => facilities.find((f) => f.id === id)?.level || fallback;
  const metalMineLevel = level('metal_mine', 1);
  const crystalMineLevel = level('crystal_mine', 1);
  const deutMineLevel = level('deuterium_synthesizer', 1);
  const solarLevel = level('solar_plant', 1);
  const fusionLevel = level('fusion_reactor', 0);

  const baseMetal = Math.round(30 * metalMineLevel * Math.pow(1.1, metalMineLevel)) + 30;
  const baseCrystal = Math.round(20 * crystalMineLevel * Math.pow(1.1, crystalMineLevel)) + 15;
  const baseDeut = Math.round(10 * deutMineLevel * Math.pow(1.1, deutMineLevel) * 1.36);

  const energyProduced = Math.round(20 * solarLevel * Math.pow(1.1, solarLevel)) + Math.round(30 * fusionLevel * Math.pow(1.05, fusionLevel)) + 100;
  const energyNeeded = Math.max(
    1,
    Math.round(10 * metalMineLevel * Math.pow(1.1, metalMineLevel)) +
      Math.round(10 * crystalMineLevel * Math.pow(1.1, crystalMineLevel)) +
      Math.round(20 * deutMineLevel * Math.pow(1.1, deutMineLevel))
  );
  const energyRatio = Math.min(1.0, Math.max(0.0, energyProduced / energyNeeded));

  return {
    metal: Math.round(baseMetal * energyRatio),
    crystal: Math.round(baseCrystal * energyRatio),
    deuterium: Math.round(baseDeut * energyRatio),
    energyProduced,
    energyNeeded,
    energyRatio,
  };
}
