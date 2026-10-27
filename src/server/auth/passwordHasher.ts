import { pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2Async = promisify(pbkdf2);

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, encoded: string): Promise<boolean>;
}

export class Pbkdf2PasswordHasher implements PasswordHasher {
  constructor(
    private readonly iterations = 210_000,
    private readonly keyLength = 64,
  ) {
    if (!Number.isInteger(iterations) || iterations < 100_000) throw new Error('INVALID_PBKDF2_ITERATIONS');
  }

  async hash(password: string): Promise<string> {
    if (password.length < 8) throw new Error('INVALID_PASSWORD');
    const salt = randomBytes(16).toString('hex');
    const derived = await pbkdf2Async(password, salt, this.iterations, this.keyLength, 'sha512');
    return `v1$pbkdf2-sha512$${this.iterations}$${salt}$${derived.toString('hex')}`;
  }

  async verify(password: string, encoded: string): Promise<boolean> {
    const parts = encoded.split('$');
    if (parts.length !== 5 || parts[0] !== 'v1' || parts[1] !== 'pbkdf2-sha512') return false;
    const iterations = Number(parts[2]);
    if (!Number.isInteger(iterations) || iterations < 100_000) return false;
    const derived = await pbkdf2Async(password, parts[3], iterations, this.keyLength, 'sha512');
    return derived.toString('hex') === parts[4];
  }
}
