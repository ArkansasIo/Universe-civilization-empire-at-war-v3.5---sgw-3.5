import type { ID, Resources } from '../../engine/types';

export interface ResourceRepository {
  get(playerId: ID): Promise<Resources | null>;
  save(playerId: ID, resources: Resources): Promise<void>;
}

export class InMemoryResourceRepository implements ResourceRepository {
  private readonly resources = new Map<ID, Resources>();

  async get(playerId: ID): Promise<Resources | null> {
    const value = this.resources.get(playerId);
    return value ? { ...value } : null;
  }

  async save(playerId: ID, resources: Resources): Promise<void> {
    this.resources.set(playerId, { ...resources });
  }
}
