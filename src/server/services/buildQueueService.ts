import {
  cancel,
  collectCompleted,
  createQueue,
  enqueue,
  meetsPrerequisites,
  type BuildQueue,
  type ProductionDefinition,
  type QueueItem,
  type QueueKind,
  type ResourceCost,
} from '../../engine/queueEngine';
import type { FleetState, ID, PlanetState } from '../../engine/types';
import type { BuildQueueRepository } from '../repositories/buildQueueRepository';
import type { FleetRepository } from '../repositories/fleetRepository';
import type { PlanetRepository } from '../repositories/planetRepository';
import type { ResearchRepository } from '../repositories/researchRepository';
import type { ResourceService } from './resourceService';

export interface EnqueueOptions {
  itemId: ID;
  quantity?: number;
  speedFactor?: number;
}

/** Ships finished at a planet's shipyard are delivered to this fleet. */
export function garrisonFleetId(planetId: ID): ID {
  return `${planetId}:garrison`;
}

export class BuildQueueService {
  private readonly definitions: Map<string, ProductionDefinition>;

  constructor(
    private readonly queues: BuildQueueRepository,
    private readonly resources: ResourceService,
    private readonly planets: PlanetRepository,
    private readonly fleets: FleetRepository,
    private readonly research: ResearchRepository,
    definitions: ProductionDefinition[],
  ) {
    this.definitions = new Map(definitions.map((definition) => [definition.id, definition]));
  }

  async getQueue(kind: QueueKind, targetId: ID): Promise<BuildQueue> {
    return (await this.queues.get(kind, targetId)) ?? createQueue(kind, targetId);
  }

  async enqueue(playerId: ID, kind: QueueKind, targetId: ID, definitionId: string, options: EnqueueOptions, now = Date.now()): Promise<QueueItem> {
    if (!playerId) throw new Error('INVALID_PLAYER_ID');
    const definition = this.definitions.get(definitionId);
    if (!definition || definition.kind !== kind) throw new Error('UNKNOWN_DEFINITION');

    const researchLevels = await this.researchLevels(playerId);
    let currentLevel = 0;
    let levels = researchLevels;
    if (kind === 'research') {
      if (targetId !== playerId) throw new Error('QUEUE_FORBIDDEN');
      currentLevel = researchLevels[definitionId] ?? 0;
    } else {
      const planet = await this.ownedPlanet(playerId, targetId);
      currentLevel = planet.buildings[definitionId] ?? 0;
      levels = { ...planet.buildings, ...researchLevels };
    }
    if (!meetsPrerequisites(definition, levels)) throw new Error('PREREQUISITES_NOT_MET');

    const queue = await this.getQueue(kind, targetId);
    const result = enqueue(queue, {
      id: options.itemId,
      ownerId: playerId,
      definition,
      currentLevel,
      quantity: options.quantity,
      speedFactor: options.speedFactor,
    }, now);
    // Spend before saving so an unaffordable order leaves the queue untouched.
    await this.resources.spend(playerId, result.item.cost);
    await this.queues.save(result.queue);
    return result.item;
  }

  async cancel(playerId: ID, kind: QueueKind, targetId: ID, itemId: ID, now = Date.now()): Promise<{ cancelled: QueueItem[]; refund: ResourceCost }> {
    const queue = await this.getQueue(kind, targetId);
    const item = queue.items.find((entry) => entry.id === itemId);
    if (!item) throw new Error('QUEUE_ITEM_NOT_FOUND');
    if (item.ownerId !== playerId) throw new Error('QUEUE_FORBIDDEN');
    const result = cancel(queue, itemId, now);
    await this.queues.save(result.queue);
    await this.resources.grant(playerId, result.refund);
    return { cancelled: result.cancelled, refund: result.refund };
  }

  /** Applies every item finished by `now`. Safe to call repeatedly, e.g. from the turn scheduler. */
  async complete(kind: QueueKind, targetId: ID, now = Date.now()): Promise<QueueItem[]> {
    const queue = await this.queues.get(kind, targetId);
    if (!queue) return [];
    const result = collectCompleted(queue, now);
    if (result.completed.length === 0) return [];

    if (kind === 'research') {
      for (const item of result.completed) {
        const existing = await this.research.get(item.ownerId, item.definitionId);
        await this.research.save({
          playerId: item.ownerId,
          technologyId: item.definitionId,
          level: Math.max(existing?.level ?? 0, item.level),
          progress: 1,
          startedAt: item.startedAt,
          completedAt: item.completesAt,
        });
      }
    } else {
      const planet = await this.planets.getById(targetId);
      if (!planet) throw new Error('PLANET_NOT_FOUND');
      if (kind === 'building') {
        for (const item of result.completed) {
          planet.buildings[item.definitionId] = Math.max(planet.buildings[item.definitionId] ?? 0, item.level);
        }
        await this.planets.save(planet);
      } else {
        await this.deliverShips(planet, result.completed);
      }
    }

    await this.queues.save(result.queue);
    return result.completed;
  }

  private async deliverShips(planet: PlanetState, items: QueueItem[]): Promise<void> {
    if (!planet.ownerId) throw new Error('PLANET_UNOWNED');
    const id = garrisonFleetId(planet.id);
    const fleet: FleetState = (await this.fleets.getById(id)) ?? {
      id,
      ownerId: planet.ownerId,
      name: `${planet.name} Garrison`,
      ships: {},
      location: planet.coordinates,
      order: 'defend',
    };
    for (const item of items) fleet.ships[item.definitionId] = (fleet.ships[item.definitionId] ?? 0) + item.quantity;
    await this.fleets.save(fleet);
  }

  private async ownedPlanet(playerId: ID, planetId: ID): Promise<PlanetState> {
    const planet = await this.planets.getById(planetId);
    if (!planet) throw new Error('PLANET_NOT_FOUND');
    if (planet.ownerId !== playerId) throw new Error('QUEUE_FORBIDDEN');
    return planet;
  }

  private async researchLevels(playerId: ID): Promise<Record<string, number>> {
    const entries = await this.research.list(playerId);
    return Object.fromEntries(entries.map((entry) => [entry.technologyId, entry.level]));
  }
}
