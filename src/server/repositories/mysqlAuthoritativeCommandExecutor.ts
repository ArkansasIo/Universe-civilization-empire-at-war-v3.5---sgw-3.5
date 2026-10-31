import type { AuthenticatedPrincipal, CommandResult, GameCommandRequest, GameState } from '../gameCommands';
import { executeGameCommand, InMemoryGameStateStore, InMemoryIdempotencyStore } from '../gameCommands';
import { hashCommandRequest } from './commandHash';
import { withSqlTransaction, type SqlTransaction } from './sqlTransaction';
import { MySqlAuthoritativeStateRepository } from './mysqlAuthoritativeStateRepository';
import { MySqlCommandEventRepository, MySqlCommandIdempotencyRepository } from './mysqlCommandRepository';

export class MySqlAuthoritativeCommandExecutor {
  private readonly stateRepository: MySqlAuthoritativeStateRepository;
  private readonly idempotencyRepository: MySqlCommandIdempotencyRepository;
  private readonly eventRepository: MySqlCommandEventRepository;

  constructor(private readonly db: SqlTransaction) {
    this.stateRepository = new MySqlAuthoritativeStateRepository(db);
    this.idempotencyRepository = new MySqlCommandIdempotencyRepository(db);
    this.eventRepository = new MySqlCommandEventRepository(db);
  }

  async execute(request: GameCommandRequest, principal: AuthenticatedPrincipal): Promise<CommandResult> {
    const requestHash = hashCommandRequest(request.command, request.commandId, request.payload);

    return withSqlTransaction(this.db, async (tx) => {
      const existing = await this.idempotencyRepository.get(principal.userId, request.idempotencyKey, tx);
      if (existing) {
        if (existing.requestHash !== requestHash) return rejected(request, 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST');
        if (existing.response) return existing.response;
        return rejected(request, 'COMMAND_ALREADY_IN_PROGRESS');
      }

      const existingCommand = await this.idempotencyRepository.getByCommandId(principal.userId, request.commandId, tx);
      if (existingCommand) {
        // A command ID belongs to exactly one idempotency key; reusing it under a new key is a different request.
        if (existingCommand.requestHash !== requestHash || existingCommand.idempotencyKey !== request.idempotencyKey) return rejected(request, 'COMMAND_ID_REUSED_WITH_DIFFERENT_REQUEST');
        if (existingCommand.response) return existingCommand.response;
        return rejected(request, 'COMMAND_ALREADY_IN_PROGRESS');
      }

      const claimed = await this.idempotencyRepository.claim(tx, {
        playerId: principal.userId,
        idempotencyKey: request.idempotencyKey,
        commandId: request.commandId,
        command: request.command,
        requestHash,
        status: 'pending',
        createdAt: Date.now(),
      });

      if (!claimed) {
        const duplicateKey = await this.idempotencyRepository.get(principal.userId, request.idempotencyKey, tx);
        if (duplicateKey?.requestHash !== requestHash) return rejected(request, 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST');
        if (duplicateKey?.response) return duplicateKey.response;

        const duplicateCommand = await this.idempotencyRepository.getByCommandId(principal.userId, request.commandId, tx);
        if (duplicateCommand?.requestHash !== requestHash || duplicateCommand.idempotencyKey !== request.idempotencyKey) return rejected(request, 'COMMAND_ID_REUSED_WITH_DIFFERENT_REQUEST');
        if (duplicateCommand?.response) return duplicateCommand.response;
        return rejected(request, 'COMMAND_ALREADY_IN_PROGRESS');
      }

      const state = await loadState(tx, principal.userId);
      if (!state) {
        const result = rejected(request, 'Player state not found');
        await this.idempotencyRepository.fail(tx, principal.userId, request.idempotencyKey, result, Date.now());
        return result;
      }

      const result = executeGameCommand(request, {
        principal,
        stateStore: new InMemoryGameStateStore([state]),
        idempotencyStore: new InMemoryIdempotencyStore(),
        now: () => new Date().toISOString(),
      });

      if (!result.accepted) {
        await this.idempotencyRepository.fail(tx, principal.userId, request.idempotencyKey, result, Date.now());
        return result;
      }

      const nextState = result.state!;
      await this.stateRepository.saveIfVersion(tx, nextState, state.version);
      await this.eventRepository.append(tx, {
        eventId: result.eventId,
        playerId: principal.userId,
        commandId: request.commandId,
        command: request.command,
        stateVersionBefore: state.version,
        stateVersionAfter: nextState.version,
        payload: request.payload,
        result,
        createdAt: Date.now(),
      });
      await this.idempotencyRepository.complete(tx, principal.userId, request.idempotencyKey, result, Date.now());
      return result;
    });
  }
}

async function loadState(tx: SqlTransaction, playerId: string): Promise<GameState | null> {
  const rows = await tx.execute<Array<{ player_id: string; state_version: number | string; state_json: string }>>(
    `SELECT player_id, state_version, state_json
       FROM game_authoritative_state
      WHERE player_id = ?
      FOR UPDATE`,
    [playerId],
  );
  if (!rows[0]) return null;
  const state = JSON.parse(rows[0].state_json) as GameState;
  return { ...state, playerId, version: Number(rows[0].state_version) };
}

function rejected(request: GameCommandRequest, reason: string): CommandResult {
  return {
    accepted: false,
    commandId: request.commandId,
    idempotencyKey: request.idempotencyKey,
    eventId: `evt_rejected_${request.commandId}`,
    reason,
  };
}
