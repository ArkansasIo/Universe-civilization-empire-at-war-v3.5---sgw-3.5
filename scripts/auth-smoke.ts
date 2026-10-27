import assert from 'node:assert/strict';
import { AuthService, InMemoryIdentityRepository, Pbkdf2PasswordHasher } from '../src/server/auth';
import { InMemoryPlayerRepository } from '../src/server/repositories/playerRepository';
import { InMemorySessionRepository } from '../src/server/repositories/sessionRepository';
import type { PlayerState } from '../src/engine/types';

const player: PlayerState = {
  id: 'player-auth-smoke',
  commanderName: 'SmokeCommander',
  race: 'tauri',
  turns: 100,
  maxTurns: 10000,
  resources: { naquadah: 1000, metal: 1000, crystal: 1000, deuterium: 1000, energy: 1000, darkMatter: 0 },
  bankedNaquadah: 0,
  researchPoints: 0,
};

const auth = new AuthService(
  new InMemoryIdentityRepository(),
  new InMemoryPlayerRepository(),
  new InMemorySessionRepository(),
  new Pbkdf2PasswordHasher(100_000),
);

const registered = await auth.register('SmokeCommander', 'correct-horse-battery', player, 1_000);
assert.equal(registered.playerId, player.id);
assert.equal((await auth.validateSession(registered.sessionToken, 2_000)).playerId, player.id);
assert.throws(() => {}, undefined);

const loggedIn = await auth.login('smokecommander', 'correct-horse-battery', 3_000);
assert.equal(loggedIn.username, 'smokecommander');
await assert.rejects(() => auth.login('smokecommander', 'wrong-password', 4_000), /INVALID_CREDENTIALS/);
await auth.logout(loggedIn.sessionToken, 5_000);
await assert.rejects(() => auth.validateSession(loggedIn.sessionToken, 6_000), /SESSION_INVALID/);

console.log('Authentication smoke test passed');
