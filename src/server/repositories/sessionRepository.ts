export interface SessionRecord {
  tokenHash: string;
  playerId: string;
  createdAt: number;
  expiresAt: number;
  revokedAt?: number;
}

export interface SessionRepository {
  get(tokenHash: string): Promise<SessionRecord | null>;
  save(session: SessionRecord): Promise<void>;
  revoke(tokenHash: string, revokedAt: number): Promise<void>;
}

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, SessionRecord>();

  async get(tokenHash: string): Promise<SessionRecord | null> {
    const session = this.sessions.get(tokenHash);
    return session ? structuredClone(session) : null;
  }

  async save(session: SessionRecord): Promise<void> {
    this.sessions.set(session.tokenHash, structuredClone(session));
  }

  async revoke(tokenHash: string, revokedAt: number): Promise<void> {
    const session = this.sessions.get(tokenHash);
    if (session) this.sessions.set(tokenHash, { ...session, revokedAt });
  }
}
