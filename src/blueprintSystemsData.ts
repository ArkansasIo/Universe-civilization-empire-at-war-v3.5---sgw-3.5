export interface EveBlueprint {
  id: string;
  name: string;
  type: 'ship' | 'module' | 'ammunition' | 'drone';
  materialEfficiency: number; // ME (0 to 10%)
  timeEfficiency: number; // TE (0 to 20%)
  runsRemaining: number;
  isOriginal: boolean; // BPO vs BPC
  researchingType: 'none' | 'me' | 'te' | 'copy';
  researchRemainingSeconds: number;
  baseBuildCost: { metal: number; crystal: number; deuterium: number };
  baseBuildTimeSeconds: number;
}

export const INITIAL_EVE_BLUEPRINTS: EveBlueprint[] = [
  {
    id: 'bp_1',
    name: 'Interceptor BPO (Original)',
    type: 'ship',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 999,
    isOriginal: true,
    researchingType: 'none',
    researchRemainingSeconds: 0,
    baseBuildCost: { metal: 3000, crystal: 1500, deuterium: 500 },
    baseBuildTimeSeconds: 60,
  },
  {
    id: 'bp_2',
    name: 'Heavy Frigate BPO (Original)',
    type: 'ship',
    materialEfficiency: 2,
    timeEfficiency: 5,
    runsRemaining: 999,
    isOriginal: true,
    researchingType: 'none',
    researchRemainingSeconds: 0,
    baseBuildCost: { metal: 12000, crystal: 6000, deuterium: 2000 },
    baseBuildTimeSeconds: 120,
  },
  {
    id: 'bp_3',
    name: 'Capital Hunter Destroyer BPC (Copy)',
    type: 'ship',
    materialEfficiency: 0,
    timeEfficiency: 0,
    runsRemaining: 15,
    isOriginal: false,
    researchingType: 'none',
    researchRemainingSeconds: 0,
    baseBuildCost: { metal: 35000, crystal: 18000, deuterium: 8000 },
    baseBuildTimeSeconds: 240,
  },
  {
    id: 'bp_4',
    name: 'Quantum Shield Booster BPO',
    type: 'module',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 999,
    isOriginal: true,
    researchingType: 'none',
    researchRemainingSeconds: 0,
    baseBuildCost: { metal: 8000, crystal: 12000, deuterium: 4000 },
    baseBuildTimeSeconds: 90,
  },
];
