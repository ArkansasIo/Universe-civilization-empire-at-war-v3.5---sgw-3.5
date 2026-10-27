import assert from 'node:assert/strict';
import { createInitialAuthoritativeState } from '../src/server/authoritativeStateFactory';
import { MySqlAuthoritativeStateInitializer } from '../src/server/authoritativeStateInitializer';
import { MySqlAuthoritativeStateRepository } from '../src/server/repositories/mysqlAuthoritativeStateRepository';
import type { PlayerState } from '../src/engine/types';
import type { SqlExecutor } from '../src/server/repositories/mysqlRepository';

const player: PlayerState = {
  id: 'player-init-1',
  commanderName: 'InitCommander',
  race: 'tauri',
  turns: 10,
  maxTurns: 10000,
  resources: {
    naquadah: 500,
    metal: 200,
    crystal: 100,
    deuterium: 50,
    energy: 75,
    darkMatter: 3,
  },
  bankedNaquadah: 25,
  researchPoints: 0,
};

const state = createInitialAuthoritativeState(player);
assert.equal(state.playerId, player.id);
assert.equal(state.version, 0);
assert.equal(state.resources.naquadah, 500);
assert.equal(state.resources.bankedNaquadah, 25);
assert.equal(state.resources.darkMatter, 3);
assert.equal(state.resources.attackUnits, 100);

const calls: string[] = [];
const db: SqlExecutor = {
  async execute<T = unknown>(sql: string): Promise<T> {
    calls.push(sql);
    return { affectedRows: 1 } as T;
  },
};
const initializer = new MySqlAuthoritativeStateInitializer(new MySqlAuthoritativeStateRepository(db));
await initializer.initialize(player);
assert.equal(calls.length, 1);
assert.match(calls[0], /INSERT IGNORE INTO game_authoritative_state/);

console.log('Authoritative state initialization smoke tests passed.');
