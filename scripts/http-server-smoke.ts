import assert from 'node:assert/strict';
import { createApiApp } from '../src/server/http/app';
import { startHttpServer } from '../src/server/http/server';
import { executeGameCommand, InMemoryGameStateStore, InMemoryIdempotencyStore, type GameState } from '../src/server/gameCommands';

const sessions = new Map<string, { id: string; playerId: string; username: string }>();
const players = new Map<string, unknown>();
const initializedPlayers: string[] = [];
const initializedResources: string[] = [];
const state: GameState = {
  playerId: 'player-commander',
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
const stateStore = new InMemoryGameStateStore([state]);
const idempotencyStore = new InMemoryIdempotencyStore();

const app = createApiApp({
  auth: {
    async register(username, _password, player) {
      const token = `token-${username}`;
      sessions.set(token, { id: `session-${username}`, playerId: player.id, username });
      players.set(player.id, player);
      return { playerId: player.id, username, sessionToken: token, expiresAt: Date.now() + 3600000 };
    },
    async login(username) {
      const playerId = 'player-commander';
      const token = `token-${username}`;
      sessions.set(token, { id: `session-${username}`, playerId, username });
      return { playerId, username, sessionToken: token, expiresAt: Date.now() + 3600000 };
    },
    async logout(token) { sessions.delete(token); },
    async validateSession(token) {
      const session = sessions.get(token);
      if (!session) throw new Error('SESSION_INVALID');
      return session;
    },
  },
  initializeAuthoritativeState: async player => { initializedPlayers.push(player.id); },
  initializeResources: async playerId => { initializedResources.push(playerId); },
  getPlayer: async id => players.get(id) ?? { id },
  getResources: async id => stateStore.load(id)?.resources ?? {},
  executeCommand: async (request, principal) => executeGameCommand(request, {
    principal,
    stateStore,
    idempotencyStore,
    targets: { enemy: { id: 'enemy', attack: 10, defense: 10, units: 50, naquadah: 4000 } },
  }),
});

const server = await startHttpServer(app, '127.0.0.1', 0);
try {
  const health = await fetch(`http://127.0.0.1:${server.port}/api/v1/health`);
  assert.equal(health.status, 200);

  const unauthorized = await fetch(`http://127.0.0.1:${server.port}/api/v1/player`);
  assert.equal(unauthorized.status, 401);

  const registration = await fetch(`http://127.0.0.1:${server.port}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'new_commander', password: 'password123', commanderName: 'New Commander', race: 'tauri' }),
  });
  assert.equal(registration.status, 201);
  const registered = await registration.json() as { playerId: string; sessionToken: string };
  assert.ok(registered.playerId);
  assert.ok(registered.sessionToken);
  assert.deepEqual(initializedPlayers, [registered.playerId]);
  assert.deepEqual(initializedResources, [registered.playerId]);

  const badRegistration = await fetch(`http://127.0.0.1:${server.port}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'x', password: 'short', commanderName: 'X', race: 'tauri' }),
  });
  assert.equal(badRegistration.status, 400);

  const login = await fetch(`http://127.0.0.1:${server.port}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'commander', password: 'password123' }),
  });
  assert.equal(login.status, 200);
  const auth = await login.json() as { sessionToken: string };

  const player = await fetch(`http://127.0.0.1:${server.port}/api/v1/player`, {
    headers: { authorization: `Bearer ${auth.sessionToken}` },
  });
  assert.equal(player.status, 200);

  const commandHeaders = {
    authorization: `Bearer ${auth.sessionToken}`,
    'content-type': 'application/json',
    'idempotency-key': 'http-idem-1',
  };
  const purchase = await fetch(`http://127.0.0.1:${server.port}/api/v1/production/purchase`, {
    method: 'POST',
    headers: commandHeaders,
    body: JSON.stringify({ commandId: 'http-cmd-1', payload: { itemId: 'soldier', quantity: 2, cost: { naquadah: 100 } } }),
  });
  assert.equal(purchase.status, 200);
  const purchaseResult = await purchase.json() as { eventId: string; stateVersion: number };
  assert.equal(purchaseResult.stateVersion, 1);

  const replay = await fetch(`http://127.0.0.1:${server.port}/api/v1/production/purchase`, {
    method: 'POST',
    headers: commandHeaders,
    body: JSON.stringify({ commandId: 'different-command-id', payload: { itemId: 'soldier', quantity: 2, cost: { naquadah: 100 } } }),
  });
  assert.equal(replay.status, 200);
  const replayResult = await replay.json() as { eventId: string; stateVersion: number };
  assert.equal(replayResult.eventId, purchaseResult.eventId);
  assert.equal(replayResult.stateVersion, purchaseResult.stateVersion);

  const missingIdempotency = await fetch(`http://127.0.0.1:${server.port}/api/v1/turn/process`, {
    method: 'POST',
    headers: { authorization: `Bearer ${auth.sessionToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ commandId: 'http-cmd-2', payload: { turns: 1 } }),
  });
  assert.equal(missingIdempotency.status, 400);

  const badMedia = await fetch(`http://127.0.0.1:${server.port}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: 'not-json',
  });
  assert.equal(badMedia.status, 415);

  console.log('HTTP server smoke test passed');
} finally {
  await server.close();
}
