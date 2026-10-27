import assert from 'node:assert/strict';
import { createApiApp } from '../src/server/http/app.js';
import { MemoryCraftingStateStore } from '../src/rpg/crafting-persistence.js';
import { CraftingService } from '../src/rpg/crafting-service.js';
import { STARTER_ITEMS } from '../src/rpg/catalog.js';

const item = STARTER_ITEMS[0];
if (!item) throw new Error('Starter item catalog is empty');

const app = createApiApp({
  auth: {
    async register() { throw new Error('unused'); },
    async login() { throw new Error('unused'); },
    async logout() {},
    async validateSession(token) {
      if (token !== 'smoke-token') throw new Error('INVALID_SESSION');
      return { id: 'session-1', playerId: 'player-1', username: 'smoke' };
    },
  },
  crafting: new CraftingService(new MemoryCraftingStateStore(), () => 0.01),
});

const server = app.listen(0);
try {
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Smoke server did not expose a TCP address');
  const base = `http://127.0.0.1:${address.port}`;
  const headers = { authorization: 'Bearer smoke-token', 'content-type': 'application/json' };

  const preview = await fetch(`${base}/api/v1/crafting/preview`, {
    method: 'POST', headers,
    body: JSON.stringify({ requestId: 'preview-1', playerId: 'player-1', item, state: { temperLevel: 0, masterworkRank: 0, damaged: false }, inventory: { materials: { 'tempering-stone': 10 } }, currency: 5000, track: 'tempering' }),
  });
  assert.equal(preview.status, 200);
  const previewBody = await preview.json() as { ok: boolean; nextLevel: number; successChance: number };
  assert.equal(previewBody.ok, true); assert.equal(previewBody.nextLevel, 1); assert.equal(previewBody.successChance, 1);

  const upgrade = await fetch(`${base}/api/v1/crafting/upgrade`, {
    method: 'POST', headers,
    body: JSON.stringify({ requestId: 'upgrade-1', playerId: 'player-1', item, state: { temperLevel: 0, masterworkRank: 0, damaged: false }, inventory: { materials: { 'tempering-stone': 10 } }, currency: 5000, track: 'tempering' }),
  });
  assert.equal(upgrade.status, 200);
  const upgradeBody = await upgrade.json() as { ok: boolean; result: { success: boolean; state: { temperLevel: number } } };
  assert.equal(upgradeBody.ok, true); assert.equal(upgradeBody.result.success, true); assert.equal(upgradeBody.result.state.temperLevel, 1);

  const state = await fetch(`${base}/api/v1/crafting/ashen-blade/state`, { headers });
  assert.equal(state.status, 200);
  const stateBody = await state.json() as { state: { version: number; temperLevel: number } };
  assert.equal(stateBody.state.version, 1); assert.equal(stateBody.state.temperLevel, 1);

  console.log('crafting HTTP smoke test passed');
} finally {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
