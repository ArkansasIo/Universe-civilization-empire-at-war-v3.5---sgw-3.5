export const TURN_INTERVAL_MS = 30 * 60 * 1000;
export const MAX_STORED_TURNS = 10_000;
export const TURN_GENERATION_THRESHOLD = 4_000;
export interface TurnState { stored: number; lastProcessedAt: number; }
/** Computes elapsed whole turns without mutating state. Persistence and locking belong to the server. */
export function calculateElapsedTurns(state: TurnState, now: number): number {
  if (!Number.isFinite(now) || now < state.lastProcessedAt) throw new RangeError("now must be >= lastProcessedAt");
  if (!Number.isInteger(state.stored) || state.stored < 0) throw new RangeError("stored turns must be a non-negative integer");
  if (state.stored >= TURN_GENERATION_THRESHOLD) return 0;
  const elapsed = Math.floor((now - state.lastProcessedAt) / TURN_INTERVAL_MS);
  return Math.max(0, Math.min(elapsed, MAX_STORED_TURNS - state.stored));
}
export function consumeTurns(state: TurnState, amount: number): TurnState {
  if (!Number.isInteger(amount) || amount < 0) throw new RangeError("amount must be a non-negative integer");
  if (amount > state.stored) throw new Error("Insufficient stored turns");
  return { ...state, stored: state.stored - amount };
}
