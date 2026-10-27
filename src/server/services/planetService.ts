import type { ID, PlanetState } from '../../engine/types';
import type { PlanetRepository } from '../repositories/planetRepository';

export class PlanetService {
  constructor(private readonly planets: PlanetRepository) {}

  async getPlanet(id: ID): Promise<PlanetState> {
    if (!id) throw new Error('INVALID_PLANET_ID');
    const planet = await this.planets.getById(id);
    if (!planet) throw new Error('PLANET_NOT_FOUND');
    return planet;
  }

  async listPlayerPlanets(ownerId: ID): Promise<PlanetState[]> {
    if (!ownerId) throw new Error('INVALID_OWNER_ID');
    return this.planets.listByOwner(ownerId);
  }

  async savePlanet(planet: PlanetState): Promise<void> {
    if (!planet.id || !planet.name) throw new Error('INVALID_PLANET');
    if (planet.population < 0 || planet.maxPopulation < 0) throw new Error('INVALID_POPULATION');
    if (planet.population > planet.maxPopulation) throw new Error('POPULATION_CAP_EXCEEDED');
    await this.planets.save(planet);
  }
}
