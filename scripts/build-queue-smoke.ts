import assert from 'node:assert/strict';
import { cancel, createQueue, enqueue, productionCost, type ProductionDefinition } from '../src/engine';
import type { PlanetState, Resources } from '../src/engine/types';
import {
  InMemoryBuildQueueRepository,
  InMemoryFleetRepository,
  InMemoryPlanetRepository,
  InMemoryResearchRepository,
  InMemoryResourceRepository,
} from '../src/server/repositories';
import { BuildQueueService, ResourceService, garrisonFleetId } from '../src/server/services';

const metalMine: ProductionDefinition = {
  id: 'metal-mine', kind: 'building', baseCost: { metal: 60, crystal: 15 }, costGrowth: 1.5, baseSeconds: 60, timeGrowth: 1.5,
};
const f302: ProductionDefinition = {
  id: 'tauri-f302', kind: 'shipyard', baseCost: { metal: 3_000, crystal: 1_000 }, costGrowth: 1, baseSeconds: 30, timeGrowth: 1,
  prerequisites: { shipyard: 1 },
};
const energyTech: ProductionDefinition = {
  id: 'energy-tech', kind: 'research', baseCost: { crystal: 800, deuterium: 400 }, costGrowth: 2, baseSeconds: 120, timeGrowth: 2,
};

const PLAYER = 'player-1';
const start: Resources = { naquadah: 0, metal: 10_000, crystal: 10_000, deuterium: 10_000, energy: 0, darkMatter: 0 };

function planet(id: string, buildings: Record<string, number>): PlanetState {
  return {
    id, ownerId: PLAYER, name: `World ${id}`, coordinates: { galaxy: 1, system: 1, planet: 1 },
    population: 100, maxPopulation: 1_000, fields: 10, buildings, resources: { ...start },
  };
}

async function rejects(action: () => Promise<unknown>, code: string): Promise<void> {
  await assert.rejects(action, (error: Error) => error.message === code);
}

// --- Pure engine: level chaining, cost curve and gap-free cancellation ---
assert.deepEqual(productionCost(metalMine, 3), { metal: 135, crystal: 33 });
assert.throws(() => productionCost({ ...metalMine, maxLevel: 2 }, 3), /MAX_LEVEL_REACHED/);
let pure = createQueue('building', 'p');
pure = enqueue(pure, { id: 'a', ownerId: PLAYER, definition: metalMine, currentLevel: 2 }, 0).queue;
pure = enqueue(pure, { id: 'b', ownerId: PLAYER, definition: metalMine, currentLevel: 2 }, 0).queue;
assert.deepEqual(pure.items.map((item) => item.level), [3, 4]);
assert.equal(pure.items[1].startedAt, pure.items[0].completesAt);
const shipQueue = enqueue(
  enqueue(createQueue('shipyard', 'p'), { id: 's1', ownerId: PLAYER, definition: f302, quantity: 1 }, 0).queue,
  { id: 's2', ownerId: PLAYER, definition: f302, quantity: 1 }, 0,
).queue;
const afterShipCancel = cancel(shipQueue, 's1', 10_000);
assert.equal(afterShipCancel.queue.items[0].startedAt, 10_000, 'later items move up when an earlier one is cancelled');
assert.equal(afterShipCancel.queue.items[0].completesAt, 40_000);
assert.throws(() => enqueue(createQueue('building', 'p'), { id: 'x', ownerId: PLAYER, definition: f302 }, 0), /QUEUE_KIND_MISMATCH/);

// --- Service ---
const resourceRepo = new InMemoryResourceRepository();
const planets = new InMemoryPlanetRepository();
const fleets = new InMemoryFleetRepository();
const research = new InMemoryResearchRepository();
const resources = new ResourceService(resourceRepo);
const service = new BuildQueueService(new InMemoryBuildQueueRepository(), resources, planets, fleets, research, [metalMine, f302, energyTech]);
await resourceRepo.save(PLAYER, { ...start });
await resourceRepo.save('player-2', { ...start });
await planets.save(planet('home', { 'metal-mine': 2, shipyard: 1 }));
await planets.save(planet('outpost', {}));

// Buildings: chained levels, charged up front.
const l3 = await service.enqueue(PLAYER, 'building', 'home', 'metal-mine', { itemId: 'b3' }, 0);
const l4 = await service.enqueue(PLAYER, 'building', 'home', 'metal-mine', { itemId: 'b4' }, 0);
assert.equal(l3.level, 3);
assert.equal(l3.completesAt, 135_000);
assert.equal(l4.level, 4);
assert.equal(l4.startedAt, 135_000);
assert.equal((await resources.get(PLAYER)).metal, 10_000 - 135 - 202);

// Not started: full refund. Running: refund the unspent half.
assert.deepEqual((await service.cancel(PLAYER, 'building', 'home', 'b4', 0)).refund, { metal: 202, crystal: 50 });
assert.deepEqual((await service.cancel(PLAYER, 'building', 'home', 'b3', 67_500)).refund, { metal: 67, crystal: 16 });
assert.equal((await resources.get(PLAYER)).metal, 10_000 - 135 + 67);

// Cancelling a level also cancels the higher levels that depend on it.
await service.enqueue(PLAYER, 'building', 'home', 'metal-mine', { itemId: 'c3' }, 100_000);
await service.enqueue(PLAYER, 'building', 'home', 'metal-mine', { itemId: 'c4' }, 100_000);
const chained = await service.cancel(PLAYER, 'building', 'home', 'c3', 100_000);
assert.deepEqual(chained.cancelled.map((item) => item.id), ['c3', 'c4']);

await service.enqueue(PLAYER, 'building', 'home', 'metal-mine', { itemId: 'd3' }, 100_000);
assert.deepEqual(await service.complete('building', 'home', 234_999), [], 'nothing completes early');
assert.equal((await service.complete('building', 'home', 235_000)).length, 1);
assert.equal((await planets.getById('home'))?.buildings['metal-mine'], 3);
assert.deepEqual(await service.complete('building', 'home', 999_999), [], 'completion is idempotent');

// Ownership, prerequisites and affordability are checked before anything changes.
const before = await resources.get('player-2');
await rejects(() => service.enqueue('player-2', 'building', 'home', 'metal-mine', { itemId: 'evil' }, 0), 'QUEUE_FORBIDDEN');
await rejects(() => service.cancel('player-2', 'shipyard', 'home', 'nope', 0), 'QUEUE_ITEM_NOT_FOUND');
assert.deepEqual(await resources.get('player-2'), before);
await rejects(() => service.enqueue(PLAYER, 'shipyard', 'outpost', 'tauri-f302', { itemId: 'nf', quantity: 1 }, 0), 'PREREQUISITES_NOT_MET');
await rejects(() => service.enqueue(PLAYER, 'shipyard', 'home', 'tauri-f302', { itemId: 'big', quantity: 5 }, 0), 'INSUFFICIENT_RESOURCES');
assert.equal((await service.getQueue('shipyard', 'home')).items.length, 0, 'unaffordable order is not queued');
await rejects(() => service.enqueue(PLAYER, 'shipyard', 'home', 'metal-mine', { itemId: 'wrong' }, 0), 'UNKNOWN_DEFINITION');

// Shipyard: batch cost/time, delivered to the planet garrison.
const ships = await service.enqueue(PLAYER, 'shipyard', 'home', 'tauri-f302', { itemId: 'f', quantity: 2 }, 0);
assert.deepEqual(ships.cost, { metal: 6_000, crystal: 2_000 });
assert.equal(ships.completesAt, 60_000);
await service.complete('shipyard', 'home', 60_000);
assert.equal((await fleets.getById(garrisonFleetId('home')))?.ships['tauri-f302'], 2);

// Research: empire-wide queue keyed by player, levels persisted to the research repository.
await rejects(() => service.enqueue(PLAYER, 'research', 'player-2', 'energy-tech', { itemId: 'r' }, 0), 'QUEUE_FORBIDDEN');
await service.enqueue(PLAYER, 'research', PLAYER, 'energy-tech', { itemId: 'r1' }, 0);
await service.complete('research', PLAYER, 120_000);
assert.equal((await research.get(PLAYER, 'energy-tech'))?.level, 1);
const r2 = await service.enqueue(PLAYER, 'research', PLAYER, 'energy-tech', { itemId: 'r2' }, 120_000);
assert.equal(r2.level, 2);
assert.deepEqual(r2.cost, { crystal: 1_600, deuterium: 800 });

// Slot limit.
await resourceRepo.save(PLAYER, { ...start, metal: 1e9, crystal: 1e9 });
for (let i = 0; i < 5; i += 1) await service.enqueue(PLAYER, 'building', 'outpost', 'metal-mine', { itemId: `o${i}` }, 0);
await rejects(() => service.enqueue(PLAYER, 'building', 'outpost', 'metal-mine', { itemId: 'o5' }, 0), 'QUEUE_FULL');

console.log('build queue smoke passed');
