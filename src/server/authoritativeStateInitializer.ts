import type { PlayerState } from '../engine/types';
import { createInitialAuthoritativeState } from './authoritativeStateFactory';
import { MySqlAuthoritativeStateRepository } from './repositories/mysqlAuthoritativeStateRepository';

export interface AuthoritativeStateInitializer {
  initialize(player: PlayerState): Promise<void>;
}

export class MySqlAuthoritativeStateInitializer implements AuthoritativeStateInitializer {
  constructor(private readonly repository: MySqlAuthoritativeStateRepository) {}

  async initialize(player: PlayerState): Promise<void> {
    await this.repository.initialize(createInitialAuthoritativeState(player));
  }
}
