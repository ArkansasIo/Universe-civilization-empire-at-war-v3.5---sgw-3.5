import type { Resources, ID } from '../../engine/types';
import type { ResourceRepository } from './resourceRepository';
import type { SqlExecutor } from './mysqlRepository';

interface ResourceRow extends Resources {
  player_id: string;
  updated_at: number;
}

export class MySqlResourceRepository implements ResourceRepository {
  constructor(private readonly db: SqlExecutor) {}

  async getByPlayerId(playerId: ID): Promise<Resources | null> {
    const rows = await this.db.execute<ResourceRow[]>(
      `SELECT naquadah, metal, crystal, deuterium, energy, dark_matter AS darkMatter
       FROM game_resources WHERE player_id = ? LIMIT 1`,
      [playerId],
    );
    const row = rows[0];
    return row ? normalize(row) : null;
  }

  async save(playerId: ID, resources: Resources): Promise<void> {
    await this.db.execute(
      `INSERT INTO game_resources
       (player_id, naquadah, metal, crystal, deuterium, energy, dark_matter, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       naquadah = VALUES(naquadah), metal = VALUES(metal), crystal = VALUES(crystal),
       deuterium = VALUES(deuterium), energy = VALUES(energy), dark_matter = VALUES(dark_matter),
       updated_at = VALUES(updated_at)`,
      [playerId, resources.naquadah, resources.metal, resources.crystal, resources.deuterium, resources.energy, resources.darkMatter, Date.now()],
    );
  }
}

function normalize(row: ResourceRow): Resources {
  return {
    naquadah: Number(row.naquadah),
    metal: Number(row.metal),
    crystal: Number(row.crystal),
    deuterium: Number(row.deuterium),
    energy: Number(row.energy),
    darkMatter: Number(row.darkMatter),
  };
}
