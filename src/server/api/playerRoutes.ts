import type { PlayerState } from '../../engine/types';
import type { PlayerService } from '../services/playerService';
import type { ApiContext, ApiResponse } from './apiTypes';
import { failure, success } from './apiTypes';

export async function getPlayer(context: ApiContext, service: PlayerService): Promise<ApiResponse<PlayerState>> {
  if (!context.playerId) return failure('UNAUTHORIZED', 'Authentication required.', context.requestId);
  try {
    return success(await service.getPlayer(context.playerId), context.requestId);
  } catch {
    return failure('PLAYER_NOT_FOUND', 'Player does not exist.', context.requestId);
  }
}
