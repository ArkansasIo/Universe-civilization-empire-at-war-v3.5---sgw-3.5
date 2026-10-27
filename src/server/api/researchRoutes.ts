import type { ResearchService } from '../services/researchService';
import type { ApiContext, ApiResponse } from './apiTypes';
import { failure, success } from './apiTypes';
import type { ResearchProgress } from '../repositories/researchRepository';

export async function getResearch(context: ApiContext, technologyId: string, service: ResearchService): Promise<ApiResponse<ResearchProgress | null>> {
  if (!context.playerId) return failure('UNAUTHORIZED', 'Authentication required.', context.requestId);
  if (!technologyId) return failure('INVALID_TECHNOLOGY', 'Technology ID is required.', context.requestId);
  return success(await service.get(context.playerId, technologyId), context.requestId);
}
