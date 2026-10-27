import { createHash, randomBytes } from 'node:crypto';
import type { PlayerRepository } from '../repositories/playerRepository';
import type { SessionRepository, SessionRecord } from '../repositories/sessionRepository';
import type { PlayerState } from '../../engine/types';
import type { PasswordHasher } from './passwordHasher';

export interface AuthIdentity {
  playerId: string;
  username: string;
  passwordHash: string;
}

export interface IdentityRepository {
  getByUsername(username: string): Promise<AuthIdentity | null>;
  save(identity: AuthIdentity): Promise<void>;
}

export class InMemoryIdentityRepository implements IdentityRepository {
  private readonly identities = new Map<string, AuthIdentity>();
  async getByUsername(username: string): Promise<AuthIdentity | null> {
    const value = this.identities.get(username.toLowerCase());
    return value ? structuredClone(value) : null;
  }
  async save(identity: AuthIdentity): Promise<void> {
    this.identities.set(identity.username.toLowerCase(), structuredClone(identity));
  }
}

export class AuthService {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly players: PlayerRepository,
    private readonly sessions: SessionRepository,
    private readonly passwords: PasswordHasher,
    private readonly sessionTtlMs = 1000 * 60 * 60 * 24 * 7,
  ) {}

  async register(username: string, password: string, player: PlayerState, now = Date.now()): Promise<AuthSessionResult> {
    const normalized = normalizeUsername(username);
    if (await this.identities.getByUsername(normalized)) throw new Error('USERNAME_EXISTS');
    const passwordHash = await this.passwords.hash(password);
    await this.identities.save({ playerId: player.id, username: normalized, passwordHash });
    await this.players.save(player);
    return this.issueSession(player.id, normalized, now);
  }

  async login(username: string, password: string, now = Date.now()): Promise<AuthSessionResult> {
    const normalized = normalizeUsername(username);
    const identity = await this.identities.getByUsername(normalized);
    if (!identity || !(await this.passwords.verify(password, identity.passwordHash))) throw new Error('INVALID_CREDENTIALS');
    return this.issueSession(identity.playerId, normalized, now);
  }

  async validateSession(token: string, now = Date.now()): Promise<SessionRecord> {
    const session = await this.sessions.getByTokenHash(hashToken(token));
    if (!session || session.revokedAt || session.expiresAt <= now) throw new Error('SESSION_INVALID');
    return session;
  }

  async logout(token: string, now = Date.now()): Promise<void> {
    const session = await this.sessions.getByTokenHash(hashToken(token));
    if (session) await this.sessions.revoke(session.id, now);
  }

  private async issueSession(playerId: string, username: string, now: number): Promise<AuthSessionResult> {
    const token = randomBytes(32).toString('hex');
    const session: SessionRecord = {
      id: `session-${token.slice(0, 16)}`,
      playerId,
      username,
      tokenHash: hashToken(token),
      createdAt: now,
      expiresAt: now + this.sessionTtlMs,
    };
    await this.sessions.save(session);
    return { playerId, username, sessionToken: token, expiresAt: session.expiresAt };
  }
}

export interface AuthSessionResult {
  playerId: string;
  username: string;
  sessionToken: string;
  expiresAt: number;
}

function normalizeUsername(username: string): string {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,32}$/.test(normalized)) throw new Error('INVALID_USERNAME');
  return normalized;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
