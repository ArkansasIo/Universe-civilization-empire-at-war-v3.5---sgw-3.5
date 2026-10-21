import assert from 'node:assert/strict';
import {
  executeGameCommand,
  InMemoryGameStateStore,
  InMemoryIdempotencyStore,
  type GameState,
} from '../src/server/gameCommands';

const state: GameState = {
  playerId: 'player-1',
  resources: {
    naquadah: 1000,
    bankedNaquadah: 0,
    metal: 500,
    crystal: 500,
    deuterium: 500,
    energy: 100,
    maxEnergy: 100,
    attackTurns: 5,
    untrainedUnits: 0,
    miners: 10,
    lifers: 2,
    unitProduction: 0,
    attackUnits: 100,
    defenseUnits: 50,
    spies: 0,
    antiSpies: 0,
    superUnits: 0,
  },
  colonies: [],
  technologies: {},
  inventory: {},
  fleets: {},
  version: 0,
};

const store = new InMemoryGameStateStore([state]);
const idempotency = new InMemoryIdempotencyStore();
const context = {
  principal: { userId: 'player-1', roles: ['user'] },
  stateStore: store,
  idempotencyStore: idempotency,
  targets: { enemy: { id: 'enemy', attack: 10, defense: 10, units: 50, naquadah: 4000 } },
};

const purchase = executeGameCommand(
  { commandId: 'cmd-1', idempotencyKey: 'idem-1', command: 'purchase', payload: { itemId: 'soldier', quantity: 2, cost: { naquadah: 100 } } },
  context,
);
assert.equal(purchase.accepted, true);
assert.equal(purchase.state?.resources.naquadah, 800);
assert.equal(purchase.state?.inventory.soldier, 2);

const replay = executeGameCommand(
  { commandId: 'cmd-1-retry', idempotencyKey: 'idem-1', command: 'purchase', payload: { itemId: 'soldier', quantity: 2, cost: { naquadah: 100 } } },
  context,
);
assert.equal(replay.eventId, purchase.eventId);
assert.equal(store.load('player-1')?.resources.naquadah, 800);

const turn = executeGameCommand(
  { commandId: 'cmd-2', idempotencyKey: 'idem-2', command: 'process-turn', payload: { turns: 2 } },
  context,
);
assert.equal(turn.accepted, true);
assert.equal(turn.details?.processedTurns, 2);
assert.equal(turn.state?.resources.naquadah, 1520);

const research = executeGameCommand(
  { commandId: 'cmd-3', idempotencyKey: 'idem-3', command: 'research', payload: { technologyId: 'hyperdrive', cost: { crystal: 100 } } },
  context,
);
assert.equal(research.accepted, true);
assert.equal(research.state?.technologies.hyperdrive, 1);

const fleet = executeGameCommand(
  { commandId: 'cmd-4', idempotencyKey: 'idem-4', command: 'fleet', payload: { fleetId: 'scout', quantity: 3, cost: { metal: 150 } } },
  context,
);
assert.equal(fleet.accepted, true);
assert.equal(fleet.state?.fleets.scout, 3);

const attack = executeGameCommand(
  { commandId: 'cmd-5', idempotencyKey: 'idem-5', command: 'attack', payload: { targetId: 'enemy' } },
  context,
);
assert.equal(attack.accepted, true);
assert.equal(attack.details?.victory, true);
assert.equal(attack.state?.resources.attackTurns, 2);
assert.equal(attack.state?.resources.naquadah, 2520);

const unauthorized = executeGameCommand(
  { commandId: 'cmd-6', idempotencyKey: 'idem-6', command: 'purchase', payload: { itemId: 'exploit', quantity: 1, cost: { naquadah: 1 } } },
  { ...context, principal: { userId: 'missing-player', roles: ['user'] } },
);
assert.equal(unauthorized.accepted, false);

console.log('Game command smoke tests passed.');
