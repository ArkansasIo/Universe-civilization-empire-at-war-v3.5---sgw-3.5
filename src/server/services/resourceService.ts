import type { ID, Resources } from '../../engine/types';
import type { ResourceRepository } from '../repositories/resourceRepository';

const RESOURCE_KEYS: (keyof Resources)[] = ['naquadah', 'metal', 'crystal', 'deuterium', 'energy', 'darkMatter'];

export class ResourceService {
  constructor(private readonly resources: ResourceRepository) {}

  async get(playerId: ID): Promise<Resources> {
    const value = await this.resources.get(playerId);
    if (!value) throw new Error('RESOURCES_NOT_FOUND');
    return value;
  }

  async grant(playerId: ID, delta: Partial<Resources>): Promise<Resources> {
    const current = await this.get(playerId);
    const next = { ...current };
    for (const key of RESOURCE_KEYS) {
      const change = delta[key] ?? 0;
      if (!Number.isFinite(change)) throw new Error('INVALID_RESOURCE_DELTA');
      next[key] = Math.max(0, next[key] + change);
    }
    await this.resources.save(playerId, next);
    return next;
  }

  async spend(playerId: ID, cost: Partial<Resources>): Promise<Resources> {
    const current = await this.get(playerId);
    for (const key of RESOURCE_KEYS) {
      const amount = cost[key] ?? 0;
      if (amount < 0 || !Number.isFinite(amount) || current[key] < amount) {
        throw new Error('INSUFFICIENT_RESOURCES');
      }
    }
    const next = { ...current };
    for (const key of RESOURCE_KEYS) next[key] -= cost[key] ?? 0;
    await this.resources.save(playerId, next);
    return next;
  }
}
