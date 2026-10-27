export type RaceId = 'asgard' | 'goauld' | 'replicator' | 'tauri';

export interface RaceDefinition {
  id: RaceId;
  name: string;
  primaryBonus: string;
  bonusMultiplier: number;
  description: string;
}

export const RACES: readonly RaceDefinition[] = [
  { id: 'asgard', name: 'Asgard', primaryBonus: 'research', bonusMultiplier: 1.25, description: 'Advanced science and energy technology.' },
  { id: 'goauld', name: "Goa'uld", primaryBonus: 'military', bonusMultiplier: 1.25, description: 'Military power, command, and domination.' },
  { id: 'replicator', name: 'Replicator', primaryBonus: 'production', bonusMultiplier: 1.25, description: 'Rapid industrial replication and adaptation.' },
  { id: 'tauri', name: "Tau'ri", primaryBonus: 'balanced', bonusMultiplier: 1.25, description: 'Flexible combined-arms development.' },
] as const;
