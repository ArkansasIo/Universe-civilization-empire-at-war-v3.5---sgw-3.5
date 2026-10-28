import { randomBytes } from 'node:crypto';
import { createApiApp, startHttpServer } from '../src/server/http';
import {
  AuthService,
  InMemoryIdentityRepository,
  Pbkdf2PasswordHasher,
} from '../src/server/auth';
import {
  InMemoryFleetRepository,
  InMemoryPlanetRepository,
  InMemoryPlayerRepository,
  InMemoryResourceRepository,
  InMemorySessionRepository,
} from '../src/server/repositories';
import { createInitialAuthoritativeState } from '../src/server/authoritativeStateFactory';
import { executeGameCommand, InMemoryGameStateStore, InMemoryIdempotencyStore, type GameState } from '../src/server/gameCommands';
import type { PlayerState } from '../src/engine/types';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8080);

const players = new InMemoryPlayerRepository();
const resources = new InMemoryResourceRepository();
const planets = new InMemoryPlanetRepository();
const fleets = new InMemoryFleetRepository();
const auth = new AuthService(
  new InMemoryIdentityRepository(),
  players,
  new InMemorySessionRepository(),
  new Pbkdf2PasswordHasher(),
);

const commandStates = new InMemoryGameStateStore();
const idempotency = new InMemoryIdempotencyStore();

const app = createApiApp({
  auth: {
    async register(username, password, player) {
      const result = await auth.register(username, password, player);
      await resources.save(player.id, player.resources);
      commandStates.save(createInitialAuthoritativeState(player));
      return result;
    },
    async login(username, password) {
      return auth.login(username, password);
    },
    async logout(token) {
      await auth.logout(token);
    },
    async validateSession(token) {
      const session = await auth.validateSession(token);
      return { id: session.id, playerId: session.playerId, username: session.username };
    },
  },
  getPlayer: async (id) => (await players.getById(id)) ?? { id },
  getResources: async (id) => (await resources.get(id)) ?? {},
  getPlanets: async (id) => planets.listByOwner(id),
  getFleets: async (id) => fleets.listByOwner(id),
  getResearch: async () => [],
  executeCommand: async (request, principal) =>
    executeGameCommand(request, {
      principal,
      stateStore: commandStates,
      idempotencyStore: idempotency,
    }),
});

const server = await startHttpServer(app, host, port);
console.log(`universe-civilization-api listening on http://${server.host}:${server.port} (pid ${process.pid})`);
console.log(`health: http://${server.host}:${server.port}/api/v1/health`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
}
