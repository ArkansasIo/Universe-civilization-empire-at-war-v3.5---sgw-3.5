export type ResourceId = 'naquadah' | 'metal' | 'crystal' | 'deuterium' | 'energy' | 'darkMatter';

export interface ResourceDefinition {
  id: ResourceId;
  name: string;
  tradable: boolean;
  description: string;
}

export const RESOURCES: readonly ResourceDefinition[] = [
  { id: 'naquadah', name: 'Naquadah', tradable: true, description: 'Primary strategic currency and energy resource.' },
  { id: 'metal', name: 'Metal', tradable: true, description: 'Industrial construction material.' },
  { id: 'crystal', name: 'Crystal', tradable: true, description: 'Advanced research and manufacturing material.' },
  { id: 'deuterium', name: 'Deuterium', tradable: true, description: 'Fleet fuel and reactor resource.' },
  { id: 'energy', name: 'Energy', tradable: false, description: 'Operational energy reserve.' },
  { id: 'darkMatter', name: 'Dark Matter', tradable: false, description: 'Rare end-game strategic resource.' },
] as const;
