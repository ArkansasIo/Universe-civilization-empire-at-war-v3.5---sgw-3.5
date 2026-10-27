import type { GameCommandName, CommandResult } from '../gameCommands';
import type { SqlExecutor } from './mysqlRepository';
import type { SqlTransaction, SqlWriteResult } from './sqlTransaction';

export type CommandStatus = 'pending' | 'completed' | 'failed';

export interface CommandIdempotencyRecord {
  playerId: string;
  idempotencyKey: string;
  commandId: string;
  command: GameCommandName;
  requestHash: string;
  status: CommandStatus;
  eventId?: string;
  response?: CommandResult;
  stateVersion?: number;
  createdAt: number;
  completedAt?: number;
}

export interface CommandEventRecord {
  eventId: string;
  playerId: string;
  commandId: string;
  command: GameCommandName;
  stateVersionBefore: number;
  stateVersionAfter: number;
  payload: unknown;
  result: CommandResult;
  createdAt: number;
}

interface CommandRow {
  player_id: string;
  idempotency_key: string;
  command_id: string;
  command_name: GameCommandName;
  request_hash: string;
  status: CommandStatus;
  event_id?: string | null;
  response_json?: string | null;
  state_version?: number | string | null;
  created_at: number | string;
  completed_at?: number | string | null;
}

function parseJson<T>(value: unknown): T | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return JSON.parse(value) as T;
  return value as T;
}

function mapRow(row: CommandRow): CommandIdempotencyRecord {
  return {
    playerId: row.player_id,
    idempotencyKey: row.idempotency_key,
    commandId: row.command_id,
    command: row.command_name,
    requestHash: row.request_hash,
    status: row.status,
    eventId: row.event_id ?? undefined,
    response: parseJson<CommandResult>(row.response_json),
    stateVersion: row.state_version == null ? undefined : Number(row.state_version),
    createdAt: Number(row.created_at),
    completedAt: row.completed_at == null ? undefined : Number(row.completed_at),
  };
}

export class MySqlCommandIdempotencyRepository {
  constructor(private readonly db: SqlExecutor) {}

  async get(playerId: string, idempotencyKey: string): Promise<CommandIdempotencyRecord | null> {
    const rows = await this.db.execute<CommandRow[]>(
      `SELECT player_id, idempotency_key, command_id, command_name, request_hash, status,
              event_id, response_json, state_version, created_at, completed_at
         FROM game_command_idempotency
        WHERE player_id = ? AND idempotency_key = ?
        LIMIT 1`,
      [playerId, idempotencyKey],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async claim(tx: SqlTransaction, record: CommandIdempotencyRecord): Promise<boolean> {
    const result = await tx.execute<SqlWriteResult>(
      `INSERT IGNORE INTO game_command_idempotency
        (player_id, idempotency_key, command_id, command_name, request_hash, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [record.playerId, record.idempotencyKey, record.commandId, record.command, record.requestHash, record.createdAt],
    );
    return Number(result.affectedRows ?? 0) === 1;
  }

  async complete(tx: SqlTransaction, playerId: string, idempotencyKey: string, result: CommandResult, completedAt: number): Promise<void> {
    await tx.execute(
      `UPDATE game_command_idempotency
          SET status = 'completed', event_id = ?, response_json = ?, state_version = ?, completed_at = ?
        WHERE player_id = ? AND idempotency_key = ?`,
      [result.eventId, JSON.stringify(result), result.stateVersion ?? null, completedAt, playerId, idempotencyKey],
    );
  }

  async fail(tx: SqlTransaction, playerId: string, idempotencyKey: string, result: CommandResult, completedAt: number): Promise<void> {
    await tx.execute(
      `UPDATE game_command_idempotency
          SET status = 'failed', response_json = ?, completed_at = ?
        WHERE player_id = ? AND idempotency_key = ?`,
      [JSON.stringify(result), completedAt, playerId, idempotencyKey],
    );
  }
}

export class MySqlCommandEventRepository {
  constructor(private readonly db: SqlExecutor) {}

  async append(tx: SqlTransaction, event: CommandEventRecord): Promise<void> {
    await tx.execute(
      `INSERT INTO game_command_events
        (event_id, player_id, command_id, command_name, state_version_before,
         state_version_after, payload_json, result_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event.eventId, event.playerId, event.commandId, event.command, event.stateVersionBefore,
        event.stateVersionAfter, JSON.stringify(event.payload), JSON.stringify(event.result), event.createdAt],
    );
  }
}
