import type { ID, PlayerState } from '../../engine/types';

export interface PlayerRepository {
  getById(id: ID): Promise<PlayerState | null>;
  save(player: PlayerState): Promise<void>;
}

export class InMemoryPlayerRepository implements PlayerRepository {
  private readonly players = new Map<ID, PlayerState>();

  constructor(seed: PlayerState[] = []) {
    for (const player of seed) this.players.set(player.id, structuredClone(player));
  }

  async getById(id: ID): Promise<PlayerState | null> {
    const player = this.players.get(id);
    return player ? structuredClone(player) : null;
  }

  async save(player: PlayerState): Promise<void> {
    this.players.set(player.id, structuredClone(player));
  }
}
