import type { FleetService } from '../services/fleetService';
import type { FleetState } from '../../engine/types';
import type { ApiContext, ApiResponse } from './apiTypes';
import { failure, success } from './apiTypes';

export async function getFleets(context: ApiContext, service: FleetService): Promise<ApiResponse<FleetState[]>> {
  if (!context.playerId) return failure('UNAUTHORIZED', 'Authentication required.', context.requestId);
  return success(await service.listPlayerFleets(context.playerId), context.requestId);
}
