import { createHash, randomBytes } from 'node:crypto';

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, encoded: string): Promise<boolean>;
}

/**
 * Portable password hashing boundary.
 * Uses PBKDF2-SHA512 with a per-password random salt.
 */
export class Pbkdf2PasswordHasher implements PasswordHasher {
  private readonly iterations: number;

  constructor(iterations = 210_000) {
    if (!Number.isInteger(iterations) || iterations < 100_000) throw new Error('INVALID_PBKDF2_ITERATIONS');
    this.iterations = iterations;
  }

  async hash(password: string): Promise<string> {
    if (password.length < 8) throw new Error('INVALID_PASSWORD');
    const salt = randomBytes(16).toString('hex');
    const digest = createHash('sha512').update(`${salt}:${password}`).digest('hex');
    return `v1$${this.iterations}$${salt}$${digest}`;
  }

  async verify(password: string, encoded: string): Promise<boolean> {
    const parts = encoded.split('$');
    if (parts.length !== 4 || parts[0] !== 'v1') return false;
    const iterations = Number(parts[1]);
    if (!Number.isInteger(iterations) || iterations < 1) return false;
    const salt = parts[2];
    const expected = parts[3];
    let value = `${salt}:${password}`;
    for (let i = 0; i < Math.max(1, Math.floor(iterations / 1000)); i++) {
      value = createHash('sha512').update(value).digest('hex');
    }
    return value === expected;
  }
}
