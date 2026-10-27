import type { PlayerState, ID } from '../../engine/types';
import type { PlayerRepository } from './playerRepository';
import type { SqlExecutor } from './mysqlRepository';

interface PlayerRow {
  id: string;
  commander_name: string;
  race: string;
  created_at: number;
  updated_at: number;
}

export class MySqlPlayerRepository implements PlayerRepository {
  constructor(private readonly db: SqlExecutor) {}

  async getById(id: ID): Promise<PlayerState | null> {
    const rows = await this.db.execute<PlayerRow[]>(
      'SELECT id, commander_name, race, created_at, updated_at FROM game_players WHERE id = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? mapPlayer(row) : null;
  }

  async save(player: PlayerState): Promise<void> {
    await this.db.execute(
      `INSERT INTO game_players (id, commander_name, race, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE commander_name = VALUES(commander_name), race = VALUES(race), updated_at = VALUES(updated_at)`,
      [player.id, player.commanderName, player.race, Date.now(), Date.now()],
    );
  }
}

function mapPlayer(row: PlayerRow): PlayerState {
  return {
    id: row.id,
    commanderName: row.commander_name,
    race: row.race as PlayerState['race'],
  };
}
