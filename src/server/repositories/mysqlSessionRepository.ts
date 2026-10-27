import { createHash } from 'node:crypto';
import type { SessionRecord, SessionRepository } from './sessionRepository';
import type { SqlExecutor } from './mysqlRepository';

interface SessionRow {
  id: string;
  player_id: string;
  username: string;
  token_hash: string;
  created_at: number;
  expires_at: number;
  revoked_at: number | null;
}

export class MySqlSessionRepository implements SessionRepository {
  constructor(private readonly db: SqlExecutor) {}

  async getByToken(token: string): Promise<SessionRecord | null> {
    const tokenHash = hashToken(token);
    const rows = await this.db.execute<SessionRow[]>(
      'SELECT id, player_id, username, token_hash, created_at, expires_at, revoked_at FROM game_sessions WHERE token_hash = ? LIMIT 1',
      [tokenHash],
    );
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async save(session: SessionRecord): Promise<void> {
    await this.db.execute(
      `INSERT INTO game_sessions (id, token_hash, player_id, username, created_at, expires_at, revoked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at), revoked_at = VALUES(revoked_at)`,
      [session.id, hashToken(session.token), session.playerId, session.username, session.createdAt, session.expiresAt, session.revokedAt ?? null],
    );
  }

  async revoke(id: string, revokedAt: number): Promise<void> {
    await this.db.execute('UPDATE game_sessions SET revoked_at = ? WHERE id = ?', [revokedAt, id]);
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function mapRow(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    playerId: row.player_id,
    username: row.username,
    token: '',
    tokenHash: row.token_hash,
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
    ...(row.revoked_at === null ? {} : { revokedAt: Number(row.revoked_at) }),
  };
}
