import type { SessionRecord, SessionRepository } from '../repositories/sessionRepository';

export interface TokenProvider {
  createToken(): string;
  hashToken(token: string): string;
}

export class SessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenProvider,
    private readonly ttlMs = 24 * 60 * 60 * 1000,
  ) {}

  async create(playerId: string, now: number): Promise<{ token: string; session: SessionRecord }> {
    if (!playerId) throw new Error('INVALID_PLAYER_ID');
    const token = this.tokens.createToken();
    const session: SessionRecord = {
      tokenHash: this.tokens.hashToken(token),
      playerId,
      createdAt: now,
      expiresAt: now + this.ttlMs,
    };
    await this.sessions.save(session);
    return { token, session };
  }

  async authenticate(token: string, now: number): Promise<SessionRecord> {
    if (!token) throw new Error('INVALID_SESSION');
    const session = await this.sessions.get(this.tokens.hashToken(token));
    if (!session || session.revokedAt !== undefined || session.expiresAt <= now) throw new Error('SESSION_INVALID');
    return session;
  }

  async revoke(token: string, now: number): Promise<void> {
    if (!token) return;
    await this.sessions.revoke(this.tokens.hashToken(token), now);
  }
}
