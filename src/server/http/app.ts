import express, { type Express, type Response } from 'express';
import { requestId, jsonOnly, securityHeaders, createRateLimitMiddleware, requireBearer } from './middleware';
import type { AuthenticatedRequest } from './httpTypes';

export interface ApiServices {
  auth: {
    register(username: string, password: string, player: any): Promise<{ playerId: string; username: string; sessionToken: string; expiresAt: number }>;
    login(username: string, password: string): Promise<{ playerId: string; username: string; sessionToken: string; expiresAt: number }>;
    logout(token: string): Promise<void>;
    validateSession(token: string): Promise<{ id: string; playerId: string; username: string }>;
  };
  getPlayer?: (playerId: string) => Promise<unknown>;
  getResources?: (playerId: string) => Promise<unknown>;
  getPlanets?: (playerId: string) => Promise<unknown>;
  getFleets?: (playerId: string) => Promise<unknown>;
  getResearch?: (playerId: string) => Promise<unknown>;
}

function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message, requestId: res.locals.requestId } });
}

function requireService<T>(service: T | undefined, res: Response, name: string): service is T {
  if (!service) {
    sendError(res, 501, 'NOT_IMPLEMENTED', `${name} is not configured.`);
    return false;
  }
  return true;
}

export function createApiApp(services: ApiServices): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(requestId);
  app.use(securityHeaders);
  app.use(createRateLimitMiddleware());
  app.use(express.json({ limit: '64kb', strict: true }));
  app.use(jsonOnly);

  app.get('/healthz', (_req, res) => res.status(200).json({ ok: true, service: 'universe-civilization-api' }));
  app.get('/readyz', (_req, res) => res.status(200).json({ ok: true }));

  app.post('/api/v1/auth/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string' || username.trim().length < 3 || password.length < 8) {
      sendError(res, 400, 'INVALID_AUTH_REQUEST', 'Username and password are invalid.');
      return;
    }
    try {
      res.status(200).json(await services.auth.login(username, password));
    } catch (error) {
      const code = error instanceof Error && error.message === 'INVALID_CREDENTIALS' ? 'INVALID_CREDENTIALS' : 'AUTH_FAILED';
      sendError(res, 401, code, 'Authentication failed.');
    }
  });

  app.post('/api/v1/auth/logout', async (req, res) => {
    const header = req.header('authorization') || '';
    const match = /^Bearer\s+([^\s]+)$/i.exec(header);
    if (match) await services.auth.logout(match[1]);
    res.status(204).send();
  });

  const protectedRouter = express.Router();
  protectedRouter.use(requireBearer((token) => services.auth.validateSession(token)));

  protectedRouter.get('/player', async (req: AuthenticatedRequest, res) => {
    if (!requireService(services.getPlayer, res, 'Player service')) return;
    res.json(await services.getPlayer(req.auth!.playerId));
  });
  protectedRouter.get('/resources', async (req: AuthenticatedRequest, res) => {
    if (!requireService(services.getResources, res, 'Resource service')) return;
    res.json(await services.getResources(req.auth!.playerId));
  });
  protectedRouter.get('/planets', async (req: AuthenticatedRequest, res) => {
    if (!requireService(services.getPlanets, res, 'Planet service')) return;
    res.json(await services.getPlanets(req.auth!.playerId));
  });
  protectedRouter.get('/fleets', async (req: AuthenticatedRequest, res) => {
    if (!requireService(services.getFleets, res, 'Fleet service')) return;
    res.json(await services.getFleets(req.auth!.playerId));
  });
  protectedRouter.get('/research', async (req: AuthenticatedRequest, res) => {
    if (!requireService(services.getResearch, res, 'Research service')) return;
    res.json(await services.getResearch(req.auth!.playerId));
  });

  app.use('/api/v1', protectedRouter);

  app.use((err: unknown, _req: AuthenticatedRequest, res: Response, _next: unknown) => {
    if (err instanceof SyntaxError) {
      sendError(res, 400, 'INVALID_JSON', 'Request body contains invalid JSON.');
      return;
    }
    sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected server error occurred.');
  });
  return app;
}
