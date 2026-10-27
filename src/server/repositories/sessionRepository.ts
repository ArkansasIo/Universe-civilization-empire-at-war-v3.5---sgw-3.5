export interface SessionRecord {
  id: string;
  playerId: string;
  username: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
  revokedAt?: number;
}

export interface SessionRepository {
  getByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  save(session: SessionRecord): Promise<void>;
  revoke(id: string, revokedAt: number): Promise<void>;
}

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, SessionRecord>();

  async getByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const session = this.sessions.get(tokenHash);
    return session ? structuredClone(session) : null;
  }

  async save(session: SessionRecord): Promise<void> {
    this.sessions.set(session.tokenHash, structuredClone(session));
  }

  async revoke(id: string, revokedAt: number): Promise<void> {
    for (const [key, session] of this.sessions) {
      if (session.id === id) this.sessions.set(key, { ...session, revokedAt });
    }
  }
}
