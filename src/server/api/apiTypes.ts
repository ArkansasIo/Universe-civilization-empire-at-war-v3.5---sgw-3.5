export interface ApiContext {
  playerId?: string;
  requestId: string;
  now: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
  requestId: string;
}

export function success<T>(data: T, requestId: string): ApiResponse<T> {
  return { ok: true, data, requestId };
}

export function failure(code: string, message: string, requestId: string): ApiResponse<never> {
  return { ok: false, error: { code, message }, requestId };
}
