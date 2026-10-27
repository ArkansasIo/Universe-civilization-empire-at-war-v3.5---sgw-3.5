import type { ApiContext, ApiResponse } from './apiTypes';
import { failure, success } from './apiTypes';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthSession {
  playerId: string;
  sessionToken: string;
  expiresAt: number;
}

export function validateAuthRequest(request: AuthRequest, context: ApiContext): ApiResponse<AuthRequest> {
  if (request.username.trim().length < 3) return failure('INVALID_USERNAME', 'Username must contain at least 3 characters.', context.requestId);
  if (request.password.length < 8) return failure('INVALID_PASSWORD', 'Password must contain at least 8 characters.', context.requestId);
  return success({ username: request.username.trim(), password: request.password }, context.requestId);
}
