export interface TechnologyDefinition {
  id: string;
  name: string;
  tier: number;
  researchCost: number;
  researchTimeTurns: number;
  prerequisites: readonly string[];
  unlocks: readonly string[];
}

export const TECHNOLOGIES: readonly TechnologyDefinition[] = [
  { id: 'energy-physics', name: 'Energy Physics', tier: 1, researchCost: 100, researchTimeTurns: 10, prerequisites: [], unlocks: ['energy-production'] },
  { id: 'naquadah-refining', name: 'Naquadah Refining', tier: 1, researchCost: 125, researchTimeTurns: 12, prerequisites: [], unlocks: ['naquadah-mine'] },
  { id: 'hyperdrive', name: 'Hyperdrive Theory', tier: 2, researchCost: 500, researchTimeTurns: 40, prerequisites: ['energy-physics'], unlocks: ['hyperdrive-mk1'] },
  { id: 'stargate-engineering', name: 'Stargate Engineering', tier: 2, researchCost: 750, researchTimeTurns: 50, prerequisites: ['naquadah-refining', 'energy-physics'], unlocks: ['stargate-network'] },
  { id: 'advanced-shields', name: 'Advanced Shielding', tier: 3, researchCost: 1500, researchTimeTurns: 90, prerequisites: ['hyperdrive'], unlocks: ['advanced-shield-module'] },
] as const;
