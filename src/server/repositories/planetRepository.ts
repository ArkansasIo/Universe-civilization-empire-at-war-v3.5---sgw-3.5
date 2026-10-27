import type { ID, PlanetState } from '../../engine/types';

export interface PlanetRepository {
  getById(id: ID): Promise<PlanetState | null>;
  listByOwner(ownerId: ID): Promise<PlanetState[]>;
  save(planet: PlanetState): Promise<void>;
}

export class InMemoryPlanetRepository implements PlanetRepository {
  private readonly planets = new Map<ID, PlanetState>();

  async getById(id: ID): Promise<PlanetState | null> {
    const planet = this.planets.get(id);
    return planet ? structuredClone(planet) : null;
  }

  async listByOwner(ownerId: ID): Promise<PlanetState[]> {
    return [...this.planets.values()]
      .filter((planet) => planet.ownerId === ownerId)
      .map((planet) => structuredClone(planet));
  }

  async save(planet: PlanetState): Promise<void> {
    this.planets.set(planet.id, structuredClone(planet));
  }
}
