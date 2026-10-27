import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedRequest } from './httpTypes';
import { MemoryRateLimiter } from '../rateLimit';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = req.header('x-request-id')?.trim() || randomUUID();
  res.locals.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}

export function jsonOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }
  const contentType = req.header('content-type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    res.status(415).json({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Requests must use application/json.', requestId: res.locals.requestId } });
    return;
  }
  next();
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'no-referrer');
  next();
}

export function createRateLimitMiddleware(limiter = new MemoryRateLimiter(120, 60_000)) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const forwarded = req.header('x-forwarded-for');
    const key = (forwarded ? forwarded.split(',')[0] : req.ip) || 'unknown';
    const decision = limiter.check(key.trim());
    res.setHeader('x-ratelimit-remaining', decision.remaining.toString());
    if (!decision.allowed) {
      res.setHeader('retry-after', Math.ceil(decision.retryAfterMs / 1000).toString());
      res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests.', requestId: res.locals.requestId } });
      return;
    }
    next();
  };
}

export function requireBearer(validate: (token: string) => Promise<{ playerId: string; username: string; id: string }>) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const header = req.header('authorization') || '';
    const match = /^Bearer\s+([^\s]+)$/i.exec(header);
    if (!match) {
      res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'A Bearer session token is required.', requestId: res.locals.requestId } });
      return;
    }
    try {
      const session = await validate(match[1]);
      req.auth = { playerId: session.playerId, username: session.username, sessionId: session.id };
      next();
    } catch {
      res.status(401).json({ error: { code: 'SESSION_INVALID', message: 'The session is invalid or expired.', requestId: res.locals.requestId } });
    }
  };
}
