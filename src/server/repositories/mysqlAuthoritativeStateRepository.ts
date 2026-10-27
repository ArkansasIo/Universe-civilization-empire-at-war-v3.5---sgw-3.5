import type { SqlExecutor } from './mysqlRepository';
import type { SqlTransaction, SqlWriteResult } from './sqlTransaction';
import type { GameState } from '../gameCommands';

interface StateRow {
  player_id: string;
  state_version: number | string;
  state_json: string | GameState;
}

export class MySqlAuthoritativeStateRepository {
  constructor(private readonly db: SqlExecutor) {}

  async get(playerId: string): Promise<GameState | null> {
    const rows = await this.db.execute<StateRow[]>(
      `SELECT player_id, state_version, state_json
         FROM game_authoritative_state
        WHERE player_id = ? LIMIT 1`,
      [playerId],
    );
    return rows[0] ? mapState(rows[0]) : null;
  }

  /** Initialize a player's authoritative snapshot without overwriting an existing state. */
  async initialize(state: GameState, executor: SqlExecutor = this.db): Promise<void> {
    await executor.execute(
      `INSERT IGNORE INTO game_authoritative_state
        (player_id, state_version, state_json, updated_at)
       VALUES (?, ?, ?, ?)`,
      [state.playerId, state.version, JSON.stringify(state), Date.now()],
    );
  }

  async saveInitial(tx: SqlTransaction, state: GameState): Promise<void> {
    await tx.execute(
      `INSERT INTO game_authoritative_state
        (player_id, state_version, state_json, updated_at)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        state_json = VALUES(state_json),
        state_version = VALUES(state_version),
        updated_at = VALUES(updated_at)`,
      [state.playerId, state.version, JSON.stringify(state), Date.now()],
    );
  }

  async saveIfVersion(tx: SqlTransaction, state: GameState, expectedVersion: number): Promise<number> {
    const result = await tx.execute<SqlWriteResult>(
      `UPDATE game_authoritative_state
          SET state_version = ?, state_json = ?, updated_at = ?
        WHERE player_id = ? AND state_version = ?`,
      [state.version, JSON.stringify(state), Date.now(), state.playerId, expectedVersion],
    );
    if (Number(result.affectedRows ?? 0) !== 1) throw new Error('STATE_VERSION_CONFLICT');
    return state.version;
  }
}

function mapState(row: StateRow): GameState {
  const value = typeof row.state_json === 'string' ? JSON.parse(row.state_json) as GameState : row.state_json;
  return { ...value, version: Number(row.state_version) };
}
