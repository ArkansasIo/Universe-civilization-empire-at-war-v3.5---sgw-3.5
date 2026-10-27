export interface BuildingDefinition {
  id: string;
  name: string;
  category: 'resource' | 'population' | 'military' | 'research' | 'shipyard' | 'defense' | 'special';
  maxLevel: number;
  baseCost: { naquadah: number; metal: number; crystal: number };
  growth: number;
  prerequisites: readonly string[];
}

export const BUILDINGS: readonly BuildingDefinition[] = [
  { id: 'naquadah-mine', name: 'Naquadah Mine', category: 'resource', maxLevel: 50, baseCost: { naquadah: 1000, metal: 500, crystal: 100 }, growth: 1.5, prerequisites: [] },
  { id: 'crystal-mine', name: 'Crystal Mine', category: 'resource', maxLevel: 50, baseCost: { naquadah: 1200, metal: 600, crystal: 150 }, growth: 1.5, prerequisites: [] },
  { id: 'research-lab', name: 'Research Laboratory', category: 'research', maxLevel: 40, baseCost: { naquadah: 5000, metal: 2500, crystal: 1000 }, growth: 1.6, prerequisites: ['energy-physics'] },
  { id: 'shipyard', name: 'Shipyard', category: 'shipyard', maxLevel: 30, baseCost: { naquadah: 10000, metal: 8000, crystal: 3000 }, growth: 1.7, prerequisites: [] },
  { id: 'stargate', name: 'Stargate', category: 'special', maxLevel: 10, baseCost: { naquadah: 100000, metal: 50000, crystal: 50000 }, growth: 2, prerequisites: ['stargate-engineering'] },
] as const;
