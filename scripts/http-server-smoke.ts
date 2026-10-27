import assert from 'node:assert/strict';
import { createApiApp } from '../src/server/http/app';
import { startHttpServer } from '../src/server/http/server';

const sessions = new Map<string, { id: string; playerId: string; username: string }>();
const players = new Map<string, unknown>();

const app = createApiApp({
  auth: {
    async register(username, _password, player) {
      const token = `token-${username}`;
      sessions.set(token, { id: `session-${username}`, playerId: player.id, username });
      players.set(player.id, player);
      return { playerId: player.id, username, sessionToken: token, expiresAt: Date.now() + 3600000 };
    },
    async login(username) {
      const playerId = `player-${username}`;
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
  getPlayer: async id => players.get(id) ?? { id },
  getResources: async id => ({ playerId: id, naquadah: 0 }),
});

const server = await startHttpServer(app, '127.0.0.1', 0);
try {
  const health = await fetch(`http://127.0.0.1:${server.port}/healthz`);
  assert.equal(health.status, 200);

  const unauthorized = await fetch(`http://127.0.0.1:${server.port}/api/v1/player`);
  assert.equal(unauthorized.status, 401);

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
