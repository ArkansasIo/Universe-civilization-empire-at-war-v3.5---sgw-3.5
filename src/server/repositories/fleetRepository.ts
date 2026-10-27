import type { FleetState, ID } from '../../engine/types';

export interface FleetRepository {
  getById(id: ID): Promise<FleetState | null>;
  listByOwner(ownerId: ID): Promise<FleetState[]>;
  save(fleet: FleetState): Promise<void>;
}

export class InMemoryFleetRepository implements FleetRepository {
  private readonly fleets = new Map<ID, FleetState>();

  async getById(id: ID): Promise<FleetState | null> {
    const fleet = this.fleets.get(id);
    return fleet ? structuredClone(fleet) : null;
  }

  async listByOwner(ownerId: ID): Promise<FleetState[]> {
    return [...this.fleets.values()]
      .filter((fleet) => fleet.ownerId === ownerId)
      .map((fleet) => structuredClone(fleet));
  }

  async save(fleet: FleetState): Promise<void> {
    this.fleets.set(fleet.id, structuredClone(fleet));
  }
}
