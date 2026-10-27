import { randomUUID } from 'node:crypto';
import express, { type Express, type Response } from 'express';
import type { GameCommandRequest, CommandResult } from '../gameCommands';
import { executeGameCommand } from '../gameCommands';
import type { PlayerState, Race } from '../../engine/types';
import { requestId, jsonOnly, securityHeaders, createRateLimitMiddleware, requireBearer } from './middleware';
import { registerCommandRoutes, type GameCommandExecutor } from './commandRoutes';
import { registerCraftingRoutes } from './craftingRoutes';
import type { CraftingService } from '../../rpg/crafting-service.js';
import type { AuthenticatedRequest } from './httpTypes';

const RACES: readonly Race[] = ['asgard', 'goauld', 'replicator', 'tauri', 'tollan'];

export interface ApiServices {
  auth: {
    register(username: string, password: string, player: PlayerState): Promise<{ playerId: string; username: string; sessionToken: string; expiresAt: number }>;
    login(username: string, password: string): Promise<{ playerId: string; username: string; sessionToken: string; expiresAt: number }>;
    logout(token: string): Promise<void>;
    validateSession(token: string): Promise<{ id: string; playerId: string; username: string }>;
  };
  initializeAuthoritativeState?: (player: PlayerState) => Promise<void>;
  initializeResources?: (playerId: string, resources: PlayerState['resources']) => Promise<void>;
  getPlayer?: (playerId: string) => Promise<unknown>;
  getResources?: (playerId: string) => Promise<unknown>;
  getPlanets?: (playerId: string) => Promise<unknown>;
  getFleets?: (playerId: string) => Promise<unknown>;
  getResearch?: (playerId: string) => Promise<unknown>;
  executeCommand?: GameCommandExecutor;
  crafting?: CraftingService;
}

function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message, requestId: res.locals.requestId } });
}
function requireService<T>(service: T | undefined, res: Response, name: string): service is T {
  if (!service) { sendError(res, 501, 'NOT_IMPLEMENTED', `${name} is not configured.`); return false; }
  return true;
}
function isRace(value: unknown): value is Race { return typeof value === 'string' && RACES.includes(value as Race); }
function createInitialPlayer(commanderName: string, race: Race): PlayerState {
  return { id: randomUUID(), commanderName, race, turns: 4000, maxTurns: 10000, resources: { naquadah: 10000, metal: 1000, crystal: 1000, deuterium: 1000, energy: 100, darkMatter: 0 }, bankedNaquadah: 0, researchPoints: 0 };
}

export function createApiApp(services: ApiServices): Express {
  const app = express(); app.disable('x-powered-by'); app.use(requestId); app.use(securityHeaders); app.use(createRateLimitMiddleware()); app.use(express.json({ limit: '64kb', strict: true })); app.use(jsonOnly);
  app.get('/healthz', (_req, res) => res.status(200).json({ ok: true, service: 'universe-civilization-api' }));
  app.get('/readyz', (_req, res) => res.status(200).json({ ok: true }));
  app.get('/api/v1/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'universe-civilization-api', version: '1.0.0' }));
  app.post('/api/v1/auth/register', async (req, res) => {
    const { username, password, commanderName, race } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string' || typeof commanderName !== 'string' || !isRace(race) || !/^[a-z0-9_]{3,32}$/i.test(username.trim()) || password.length < 8 || commanderName.trim().length < 2 || commanderName.trim().length > 64) { sendError(res, 400, 'INVALID_REGISTRATION_REQUEST', 'Username, password, commander name, or race is invalid.'); return; }
    const player = createInitialPlayer(commanderName.trim(), race);
    try { const result = await services.auth.register(username, password, player); if (services.initializeAuthoritativeState) await services.initializeAuthoritativeState(player); if (services.initializeResources) await services.initializeResources(player.id, player.resources); res.status(201).json(result); }
    catch (error) { const message = error instanceof Error ? error.message : ''; if (message === 'USERNAME_EXISTS') { sendError(res, 409, 'USERNAME_EXISTS', 'That username is already registered.'); return; } if (message === 'INVALID_USERNAME') { sendError(res, 400, 'INVALID_USERNAME', 'Username must contain only letters, numbers, and underscores.'); return; } sendError(res, 500, 'REGISTRATION_FAILED', 'Unable to create the player account.'); }
  });
  app.post('/api/v1/auth/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string' || username.trim().length < 3 || password.length < 8) { sendError(res, 400, 'INVALID_AUTH_REQUEST', 'Username and password are invalid.'); return; }
    try { res.status(200).json(await services.auth.login(username, password)); } catch (error) { const code = error instanceof Error && error.message === 'INVALID_CREDENTIALS' ? 'INVALID_CREDENTIALS' : 'AUTH_FAILED'; sendError(res, 401, code, 'Authentication failed.'); }
  });
  app.post('/api/v1/auth/logout', async (req, res) => { const header = req.header('authorization') || ''; const match = /^Bearer\s+([^\s]+)$/i.exec(header); if (match) await services.auth.logout(match[1]); res.status(204).send(); });

  const protectedRouter = express.Router(); protectedRouter.use(requireBearer((token) => services.auth.validateSession(token)));
  protectedRouter.get('/player', async (req: AuthenticatedRequest, res) => { if (!requireService(services.getPlayer, res, 'Player service')) return; res.json(await services.getPlayer(req.auth!.playerId)); });
  protectedRouter.get('/commander', async (req: AuthenticatedRequest, res) => { if (!requireService(services.getPlayer, res, 'Player service')) return; res.json(await services.getPlayer(req.auth!.playerId)); });
  protectedRouter.get('/resources', async (req: AuthenticatedRequest, res) => { if (!requireService(services.getResources, res, 'Resource service')) return; res.json(await services.getResources(req.auth!.playerId)); });
  protectedRouter.get('/planets', async (req: AuthenticatedRequest, res) => { if (!requireService(services.getPlanets, res, 'Planet service')) return; res.json(await services.getPlanets(req.auth!.playerId)); });
  protectedRouter.get('/fleets', async (req: AuthenticatedRequest, res) => { if (!requireService(services.getFleets, res, 'Fleet service')) return; res.json(await services.getFleets(req.auth!.playerId)); });
  protectedRouter.get('/fleet', async (req: AuthenticatedRequest, res) => { if (!requireService(services.getFleets, res, 'Fleet service')) return; res.json(await services.getFleets(req.auth!.playerId)); });
  protectedRouter.get('/research', async (req: AuthenticatedRequest, res) => { if (!requireService(services.getResearch, res, 'Research service')) return; res.json(await services.getResearch(req.auth!.playerId)); });
  if (services.executeCommand) registerCommandRoutes(protectedRouter, services.executeCommand);
  if (services.crafting) registerCraftingRoutes(protectedRouter, { crafting: services.crafting });
  app.use('/api/v1', protectedRouter);

  app.use((err: unknown, _req: AuthenticatedRequest, res: Response, _next: unknown) => { if (err instanceof SyntaxError) { sendError(res, 400, 'INVALID_JSON', 'Request body contains invalid JSON.'); return; } sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected server error occurred.'); });
  return app;
}
export function createInMemoryCommandExecutor(contextFactory: (playerId: string) => Parameters<typeof executeGameCommand>[1]): GameCommandExecutor { return async (request: GameCommandRequest, principal): Promise<CommandResult> => executeGameCommand(request, contextFactory(principal.userId)); }
