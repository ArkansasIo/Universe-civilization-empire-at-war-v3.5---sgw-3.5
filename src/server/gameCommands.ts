import type { PlanetColony, PlayerResources } from '../types';
import { processTurns } from '../engine/turnEngine';
import { resolveCombat } from '../engine/combatEngine';
import { spendResources } from '../engine/resourceTransactions';

export type GameCommandName = 'process-turn' | 'purchase' | 'attack' | 'research' | 'fleet';

export interface AuthenticatedPrincipal { userId: string; roles: string[]; }

export interface GameState {
  playerId: string;
  resources: PlayerResources;
  colonies: PlanetColony[];
  technologies: Record<string, number>;
  inventory: Record<string, number>;
  fleets: Record<string, number>;
  version: number;
}

export interface AttackTarget { id: string; attack: number; defense: number; units: number; naquadah: number; }
export interface GameStateStore { load(playerId: string): GameState | undefined; save(nextState: GameState): void; }
export interface IdempotencyStore { get(key: string): CommandResult | undefined; set(key: string, result: CommandResult): void; }
export interface GameCommandContext {
  principal: AuthenticatedPrincipal;
  stateStore: GameStateStore;
  idempotencyStore: IdempotencyStore;
  now?: () => string;
  targets?: Record<string, AttackTarget>;
}

export interface ProcessTurnPayload { turns: number; }
export interface PurchasePayload { itemId: string; quantity: number; cost: Record<string, number>; }
export interface AttackPayload { targetId: string; }
export interface ResearchPayload { technologyId: string; cost: Record<string, number>; }
export interface FleetPayload { fleetId: string; quantity: number; cost?: Record<string, number>; }
export type GameCommandPayload = ProcessTurnPayload | PurchasePayload | AttackPayload | ResearchPayload | FleetPayload;
export interface GameCommandRequest { commandId: string; idempotencyKey: string; command: GameCommandName; payload: GameCommandPayload; }
export interface CommandResult {
  accepted: boolean;
  commandId: string;
  idempotencyKey: string;
  eventId: string;
  reason?: string;
  stateVersion?: number;
  state?: GameState;
  details?: Record<string, unknown>;
}

export class InMemoryGameStateStore implements GameStateStore {
  private readonly states = new Map<string, GameState>();
  constructor(initialStates: GameState[] = []) { for (const state of initialStates) this.states.set(state.playerId, structuredClone(state)); }
  load(playerId: string): GameState | undefined { const state = this.states.get(playerId); return state ? structuredClone(state) : undefined; }
  save(nextState: GameState): void { this.states.set(nextState.playerId, structuredClone(nextState)); }
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly results = new Map<string, CommandResult>();
  get(key: string): CommandResult | undefined { return this.results.get(key); }
  set(key: string, result: CommandResult): void { this.results.set(key, result); }
}

function positiveInteger(value: unknown): value is number { return typeof value === 'number' && Number.isInteger(value) && value > 0; }
function validCost(value: unknown): value is Record<string, number> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0);
}
function eventId(commandId: string, version: number): string { return `evt_${version}_${commandId}`; }
function reject(request: GameCommandRequest, reason: string): CommandResult {
  return { accepted: false, commandId: request.commandId, idempotencyKey: request.idempotencyKey, eventId: eventId(request.commandId, 0), reason };
}

/**
 * Deterministic server command boundary. The authenticated principal owns the
 * state; a client-supplied player ID is never trusted. A production adapter
 * must commit the state version, mutation, event and idempotency record in one
 * database transaction.
 */
export function executeGameCommand(request: GameCommandRequest, context: GameCommandContext): CommandResult {
  if (!request.commandId || !request.idempotencyKey) return reject(request, 'commandId and idempotencyKey are required');
  const previous = context.idempotencyStore.get(request.idempotencyKey);
  if (previous) return previous;

  const state = context.stateStore.load(context.principal.userId);
  if (!state) return reject(request, 'Player state not found');

  let nextState = structuredClone(state);
  let details: Record<string, unknown> = {};

  switch (request.command) {
    case 'process-turn': {
      const payload = request.payload as ProcessTurnPayload;
      if (!positiveInteger(payload.turns)) return reject(request, 'turns must be a positive integer');
      const result = processTurns(state.resources, state.colonies, payload.turns);
      if (result.processedTurns === 0) return reject(request, 'No turns available or turn transaction failed');
      nextState.resources = result.resources;
      details = { processedTurns: result.processedTurns, generatedNaquadah: result.generatedNaquadah };
      break;
    }
    case 'purchase': {
      const payload = request.payload as PurchasePayload;
      if (!payload.itemId || !positiveInteger(payload.quantity) || !validCost(payload.cost)) return reject(request, 'Invalid purchase payload');
      const cost = Object.fromEntries(Object.entries(payload.cost).map(([key, value]) => [key, value * payload.quantity]));
      const transaction = spendResources(state.resources, cost);
      if (!transaction.ok) return reject(request, transaction.reason ?? 'Purchase rejected');
      nextState.resources = transaction.resources;
      nextState.inventory[payload.itemId] = (nextState.inventory[payload.itemId] ?? 0) + payload.quantity;
      details = { itemId: payload.itemId, quantity: payload.quantity, cost };
      break;
    }
    case 'attack': {
      const payload = request.payload as AttackPayload;
      const target = context.targets?.[payload.targetId];
      if (!target) return reject(request, 'Target not found');
      if (target.id === state.playerId) return reject(request, 'Cannot attack yourself');
      const battle = resolveCombat(
        { id: state.playerId, attack: state.resources.attackUnits, defense: state.resources.defenseUnits, units: state.resources.attackUnits },
        { id: target.id, attack: target.attack, defense: target.defense, units: target.units },
        target.naquadah,
      );
      if (state.resources.attackTurns < battle.turnsSpent) return reject(request, 'Insufficient attack turns');
      nextState.resources = {
        ...state.resources,
        attackTurns: state.resources.attackTurns - battle.turnsSpent,
        naquadah: state.resources.naquadah + battle.loot,
        attackUnits: Math.max(0, state.resources.attackUnits - battle.attackerCasualties),
      };
      details = { targetId: target.id, ...battle };
      break;
    }
    case 'research': {
      const payload = request.payload as ResearchPayload;
      if (!payload.technologyId || !validCost(payload.cost)) return reject(request, 'Invalid research payload');
      const transaction = spendResources(state.resources, payload.cost);
      if (!transaction.ok) return reject(request, transaction.reason ?? 'Research rejected');
      nextState.resources = transaction.resources;
      nextState.technologies[payload.technologyId] = (nextState.technologies[payload.technologyId] ?? 0) + 1;
      details = { technologyId: payload.technologyId, newLevel: nextState.technologies[payload.technologyId] };
      break;
    }
    case 'fleet': {
      const payload = request.payload as FleetPayload;
      if (!payload.fleetId || !positiveInteger(payload.quantity) || (payload.cost && !validCost(payload.cost))) return reject(request, 'Invalid fleet payload');
      if (payload.cost) {
        const transaction = spendResources(state.resources, payload.cost);
        if (!transaction.ok) return reject(request, transaction.reason ?? 'Fleet command rejected');
        nextState.resources = transaction.resources;
      }
      nextState.fleets[payload.fleetId] = (nextState.fleets[payload.fleetId] ?? 0) + payload.quantity;
      details = { fleetId: payload.fleetId, quantity: payload.quantity, cost: payload.cost ?? {} };
      break;
    }
  }

  nextState.version = state.version + 1;
  context.stateStore.save(nextState);
  const result: CommandResult = {
    accepted: true,
    commandId: request.commandId,
    idempotencyKey: request.idempotencyKey,
    eventId: eventId(request.commandId, nextState.version),
    stateVersion: nextState.version,
    state: nextState,
    details: { ...details, committedAt: context.now?.() ?? new Date().toISOString() },
  };
  context.idempotencyStore.set(request.idempotencyKey, result);
  return result;
}
