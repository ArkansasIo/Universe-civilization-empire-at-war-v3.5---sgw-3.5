import assert from 'node:assert/strict';
import type { GameState } from '../src/server/gameCommands';
import { MySqlAuthoritativeCommandExecutor } from '../src/server/repositories/mysqlAuthoritativeCommandExecutor';
import type { SqlTransaction, SqlWriteResult } from '../src/server/repositories/sqlTransaction';

const initialState: GameState = {
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

interface StoredCommand {
  playerId: string;
  idempotencyKey: string;
  commandId: string;
  commandName: string;
  requestHash: string;
  status: 'pending' | 'completed' | 'failed';
  responseJson?: string;
}

class FakeSqlTransaction implements SqlTransaction {
  private inTransaction = false;
  private state = structuredClone(initialState);
  private readonly commands = new Map<string, StoredCommand>();
  private readonly events = new Map<string, unknown>();

  async begin(): Promise<void> {
    assert.equal(this.inTransaction, false);
    this.inTransaction = true;
  }

  async commit(): Promise<void> {
    assert.equal(this.inTransaction, true);
    this.inTransaction = false;
  }

  async rollback(): Promise<void> {
    this.inTransaction = false;
  }

  async execute<T = unknown>(sql: string, params: readonly unknown[] = []): Promise<T> {
    if (sql.includes('FROM game_command_idempotency') && sql.includes('idempotency_key = ?')) {
      const [playerId, key] = params as [string, string];
      const row = [...this.commands.values()].find((value) => value.playerId === playerId && value.idempotencyKey === key);
      return (row ? [this.commandRow(row)] : []) as T;
    }

    if (sql.includes('FROM game_command_idempotency') && sql.includes('command_id = ?')) {
      const [playerId, commandId] = params as [string, string];
      const row = [...this.commands.values()].find((value) => value.playerId === playerId && value.commandId === commandId);
      return (row ? [this.commandRow(row)] : []) as T;
    }

    if (sql.includes('FROM game_authoritative_state')) {
      return [{ player_id: this.state.playerId, state_version: this.state.version, state_json: JSON.stringify(this.state) }] as T;
    }

    if (sql.startsWith('INSERT IGNORE INTO game_command_idempotency')) {
      const [playerId, idempotencyKey, commandId, commandName, requestHash] = params as [string, string, string, string, string];
      const duplicate = [...this.commands.values()].some((value) =>
        (value.playerId === playerId && value.idempotencyKey === idempotencyKey) ||
        (value.playerId === playerId && value.commandId === commandId),
      );
      if (duplicate) return { affectedRows: 0 } as T;
      this.commands.set(`${playerId}:${idempotencyKey}`, {
        playerId, idempotencyKey, commandId, commandName, requestHash, status: 'pending',
      });
      return { affectedRows: 1 } as T;
    }

    if (sql.startsWith('UPDATE game_authoritative_state')) {
      const [version, stateJson, _updatedAt, playerId, expectedVersion] = params as [number, string, number, string, number];
      if (this.state.playerId !== playerId || this.state.version !== expectedVersion) return { affectedRows: 0 } as T;
      this.state = JSON.parse(stateJson) as GameState;
      assert.equal(this.state.version, version);
      return { affectedRows: 1 } as T;
    }

    if (sql.startsWith('INSERT INTO game_command_events')) {
      const [eventId] = params as [string];
      this.events.set(eventId, params);
      return { affectedRows: 1 } as T;
    }

    if (sql.startsWith('UPDATE game_command_idempotency')) {
      const [statusOrResponse, maybeResponse, maybeVersion, maybeCompletedAt, playerId, key] = params;
      const row = this.commands.get(`${String(playerId)}:${String(key)}`);
      assert.ok(row);
      if (String(sql).includes("status = 'completed'")) {
        row.status = 'completed';
        row.responseJson = String(maybeResponse);
      } else {
        row.status = 'failed';
        row.responseJson = String(statusOrResponse);
      }
      return { affectedRows: 1 } as T;
    }

    throw new Error(`Unhandled SQL in smoke test: ${sql}`);
  }

  private commandRow(row: StoredCommand): Record<string, unknown> {
    return {
      player_id: row.playerId,
      idempotency_key: row.idempotencyKey,
      command_id: row.commandId,
      command_name: row.commandName,
      request_hash: row.requestHash,
      status: row.status,
      event_id: undefined,
      response_json: row.responseJson,
      state_version: undefined,
      created_at: Date.now(),
      completed_at: undefined,
    };
  }
}

const db = new FakeSqlTransaction();
const executor = new MySqlAuthoritativeCommandExecutor(db);
const principal = { userId: 'player-1', roles: ['user'] };

const request = {
  commandId: 'cmd-persist-1',
  idempotencyKey: 'idem-persist-1',
  command: 'purchase' as const,
  payload: { itemId: 'soldier', quantity: 2, cost: { naquadah: 100 } },
};

const first = await executor.execute(request, principal);
assert.equal(first.accepted, true);
assert.equal(first.state?.resources.naquadah, 800);
assert.equal(first.stateVersion, 1);

const replay = await executor.execute(request, principal);
assert.deepEqual(replay, first);
assert.equal(replay.state?.resources.naquadah, 800);

const differentKeySameCommand = await executor.execute({ ...request, idempotencyKey: 'idem-persist-2' }, principal);
assert.equal(differentKeySameCommand.accepted, false);
assert.equal(differentKeySameCommand.reason, 'COMMAND_ID_REUSED_WITH_DIFFERENT_REQUEST');

console.log('MySQL authoritative persistence smoke tests passed.');
