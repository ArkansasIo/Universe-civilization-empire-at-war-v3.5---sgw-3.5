import type { SqlExecutor } from './mysqlRepository';
import type { SqlTransaction, SqlWriteResult } from './sqlTransaction';

export interface StateVersionRecord {
  playerId: string;
  version: number;
}

export class MySqlStateVersionRepository {
  constructor(private readonly db: SqlExecutor) {}

  async get(playerId: string): Promise<StateVersionRecord | null> {
    const rows = await this.db.execute<Array<{ id: string; state_version: number | string }>>(
      `SELECT id, state_version FROM game_players WHERE id = ? LIMIT 1`,
      [playerId],
    );
    return rows[0] ? { playerId: rows[0].id, version: Number(rows[0].state_version) } : null;
  }

  async increment(tx: SqlTransaction, playerId: string, expectedVersion: number): Promise<number> {
    const result = await tx.execute<SqlWriteResult>(
      `UPDATE game_players
          SET state_version = state_version + 1, updated_at = ?
        WHERE id = ? AND state_version = ?`,
      [Date.now(), playerId, expectedVersion],
    );
    if (Number(result.affectedRows ?? 0) !== 1) throw new Error('STATE_VERSION_CONFLICT');
    return expectedVersion + 1;
  }
}
