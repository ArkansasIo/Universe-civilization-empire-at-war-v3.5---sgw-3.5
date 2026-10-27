import type { Response } from 'express';
import type { AuthenticatedRequest } from './httpTypes';
import type { CommandResult, GameCommandName, GameCommandPayload, GameCommandRequest } from '../gameCommands';

export type GameCommandExecutor = (request: GameCommandRequest, principal: { userId: string; roles: string[] }) => CommandResult | Promise<CommandResult>;

const COMMANDS = new Set<GameCommandName>(['process-turn', 'purchase', 'attack', 'research', 'fleet']);

export function normalizeCommandRequest(body: unknown, headerIdempotencyKey: string | undefined, forcedCommand?: GameCommandName): GameCommandRequest | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  const commandId = typeof input.commandId === 'string' ? input.commandId.trim() : '';
  const idempotencyKey = typeof headerIdempotencyKey === 'string' && headerIdempotencyKey.trim().length > 0
    ? headerIdempotencyKey.trim()
    : typeof input.idempotencyKey === 'string' ? input.idempotencyKey.trim() : '';
  const commandValue = forcedCommand ?? (typeof input.command === 'string' ? input.command : '');
  if (!commandId || commandId.length > 128 || !idempotencyKey || idempotencyKey.length > 128 || !COMMANDS.has(commandValue as GameCommandName)) return null;
  const payload = (input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload) ? input.payload : {}) as GameCommandPayload;
  return { commandId, idempotencyKey, command: commandValue as GameCommandName, payload };
}

export function registerCommandRoutes(router: { post(path: string, handler: (req: AuthenticatedRequest, res: Response) => unknown): unknown }, execute: GameCommandExecutor): void {
  const handler = (forcedCommand?: GameCommandName) => async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const request = normalizeCommandRequest(req.body, req.header('idempotency-key'), forcedCommand);
    if (!request) {
      res.status(400).json({ error: { code: 'INVALID_COMMAND', message: 'commandId, idempotencyKey, command and payload are required.', requestId: res.locals.requestId } });
      return;
    }
    try {
      const result = await execute(request, { userId: req.auth!.playerId, roles: [] });
      if (!result.accepted) {
        res.status(409).json(result);
        return;
      }
      res.status(200).json(result);
    } catch {
      res.status(500).json({ error: { code: 'COMMAND_FAILED', message: 'The command could not be processed.', requestId: res.locals.requestId } });
    }
  };

  router.post('/commands', handler());
  router.post('/turn/process', handler('process-turn'));
  router.post('/production/purchase', handler('purchase'));
  router.post('/combat/attack', handler('attack'));
  router.post('/research/start', handler('research'));
  router.post('/fleets/move', handler('fleet'));
}
