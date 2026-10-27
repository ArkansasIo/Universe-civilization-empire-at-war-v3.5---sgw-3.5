import type { ID, PlayerState } from '../../engine/types';
import type { PlayerRepository } from '../repositories/playerRepository';

export class PlayerService {
  constructor(private readonly players: PlayerRepository) {}

  async getPlayer(id: ID): Promise<PlayerState> {
    const player = await this.players.getById(id);
    if (!player) throw new Error('PLAYER_NOT_FOUND');
    return player;
  }

  async savePlayer(player: PlayerState): Promise<void> {
    if (!player.id || !player.commanderName) throw new Error('INVALID_PLAYER');
    await this.players.save(player);
  }
}
