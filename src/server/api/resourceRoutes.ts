import type { ResourceService } from '../services/resourceService';
import type { ApiContext, ApiResponse } from './apiTypes';
import { failure, success } from './apiTypes';
import type { Resources } from '../../engine/types';

export async function getResources(context: ApiContext, service: ResourceService): Promise<ApiResponse<Resources>> {
  if (!context.playerId) return failure('UNAUTHORIZED', 'Authentication required.', context.requestId);
  try {
    return success(await service.get(context.playerId), context.requestId);
  } catch {
    return failure('RESOURCES_NOT_FOUND', 'Resource state does not exist.', context.requestId);
  }
}
