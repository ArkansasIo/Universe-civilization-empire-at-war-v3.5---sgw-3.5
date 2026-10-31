import { InMemoryFleetRepository, InMemoryPlanetRepository, InMemoryPlayerRepository } from '../src/server/repositories';
import { FleetMovementService, PlanetService, PlayerService, StargateService } from '../src/server/services';
import type { FleetState, PlanetState, PlayerState } from '../src/engine/types';

const player: PlayerState = {
  id: 'player-1',
  commanderName: 'Test Commander',
  race: 'tauri',
  turns: 100,
  maxTurns: 10000,
  resources: { naquadah: 50000, metal: 1000, crystal: 500, deuterium: 500, energy: 1000, darkMatter: 0 },
  bankedNaquadah: 0,
  researchPoints: 0,
};

const planet: PlanetState = {
  id: 'planet-1',
  ownerId: player.id,
  name: 'Test World',
  coordinates: { galaxy: 1, system: 1, planet: 1 },
  population: 100,
  maxPopulation: 1000,
  fields: 10,
  buildings: {},
  resources: player.resources,
};

const fleet: FleetState = {
  id: 'fleet-1',
  ownerId: player.id,
  name: 'Test Fleet',
  ships: { 'tauri-f302': 10 },
  location: planet.coordinates,
  order: 'defend',
};

const playerRepo = new InMemoryPlayerRepository([player]);
const planetRepo = new InMemoryPlanetRepository();
const fleetRepo = new InMemoryFleetRepository();
const playerService = new PlayerService(playerRepo);
const planetService = new PlanetService(planetRepo);
const movement = new FleetMovementService(fleetRepo);
const gates = new StargateService();

await planetService.savePlanet(planet);
await fleetRepo.save(fleet);
if ((await playerService.getPlayer(player.id)).commanderName !== 'Test Commander') throw new Error('PLAYER_SERVICE_FAILED');
if ((await planetService.listPlayerPlanets(player.id)).length !== 1) throw new Error('PLANET_SERVICE_FAILED');
const moved = await movement.move(player.id, fleet.id, { galaxy: 1, system: 2, planet: 1 }, 100, 1_000);
if (!moved.arrivalAt || moved.order !== 'move') throw new Error('FLEET_MOVEMENT_FAILED');
let unauthorizedMoveRejected = false;
try {
  await movement.move('player-2', fleet.id, { galaxy: 1, system: 3, planet: 1 }, 100, 2_000);
} catch (error) {
  unauthorizedMoveRejected = error instanceof Error && error.message === 'FLEET_COMMAND_FORBIDDEN';
}
if (!unauthorizedMoveRejected) throw new Error('FLEET_OWNER_VALIDATION_FAILED');
if ((await fleetRepo.getById(fleet.id))?.destination?.system !== 2) throw new Error('UNAUTHORIZED_FLEET_MOVE_MUTATED_STATE');

let invalidDestinationRejected = false;
try {
  await movement.move(player.id, fleet.id, { galaxy: 0, system: 2, planet: 1 }, 100, 2_000);
} catch (error) {
  invalidDestinationRejected = error instanceof Error && error.message === 'INVALID_COORDINATES';
}
if (!invalidDestinationRejected) throw new Error('FLEET_COORDINATE_VALIDATION_FAILED');

const sourceGate = { id: 'gate-1', planetId: planet.id, address: 'ABC123', active: true, cooldownUntil: 0 };
const targetGate = { id: 'gate-2', planetId: 'planet-2', address: 'XYZ789', active: true, cooldownUntil: 0 };
const travel = gates.dial(sourceGate, targetGate, 1_000);
if (travel.targetGateId !== targetGate.id || travel.gate.cooldownUntil <= 1_000) throw new Error('STARGATE_SERVICE_FAILED');

console.log('server-service-smoke: ok');
