import type { CombatService } from '../services/combatService';
import type { ApiContext, ApiResponse } from './apiTypes';
import { failure, success } from './apiTypes';
import type { BattleRecord } from '../repositories/battleRepository';

export async function createBattle(context: ApiContext, defenderId: string, service: CombatService): Promise<ApiResponse<BattleRecord>> {
  if (!context.playerId) return failure('UNAUTHORIZED', 'Authentication required.', context.requestId);
  if (!defenderId) return failure('INVALID_DEFENDER', 'Defender ID is required.', context.requestId);
  try {
    return success(await service.createBattle(context.playerId, defenderId, context.now), context.requestId);
  } catch (error) {
    return failure('COMBAT_VALIDATION_FAILED', error instanceof Error ? error.message : 'Combat validation failed.', context.requestId);
  }
}
