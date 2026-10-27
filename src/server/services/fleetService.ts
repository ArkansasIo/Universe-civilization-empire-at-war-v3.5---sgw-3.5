import type { FleetState, ID } from '../../engine/types';
import type { FleetRepository } from '../repositories/fleetRepository';

export class FleetService {
  constructor(private readonly fleets: FleetRepository) {}

  async getFleet(id: ID): Promise<FleetState> {
    const fleet = await this.fleets.getById(id);
    if (!fleet) throw new Error('FLEET_NOT_FOUND');
    return fleet;
  }

  async listPlayerFleets(ownerId: ID): Promise<FleetState[]> {
    return this.fleets.listByOwner(ownerId);
  }

  async saveFleet(fleet: FleetState): Promise<void> {
    if (!fleet.id || !fleet.ownerId) throw new Error('INVALID_FLEET');
    await this.fleets.save(fleet);
  }
}
