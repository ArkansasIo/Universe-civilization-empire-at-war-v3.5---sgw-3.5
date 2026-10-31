import type { CombatResult, FleetUnit } from "./types";
function fleetPower(fleet: FleetUnit[]): number {
  return fleet.reduce((total, unit) => {
    if (!Number.isFinite(unit.quantity) || unit.quantity < 0 || !Number.isFinite(unit.attack) || unit.attack < 0 || !Number.isFinite(unit.hull) || unit.hull < 0) throw new RangeError("Invalid fleet unit");
    return total + unit.quantity * unit.attack;
  }, 0);
}
function fleetHull(fleet: FleetUnit[]): number { return fleet.reduce((sum, unit) => sum + unit.quantity * unit.hull, 0); }
/** Deterministic baseline resolution. Production battles must execute and persist on the trusted server. */
export function resolveFleetCombat(attacker: FleetUnit[], defender: FleetUnit[]): CombatResult {
  const ap = fleetPower(attacker), dp = fleetPower(defender);
  const ah = fleetHull(attacker), dh = fleetHull(defender);
  if (ap === 0 && dp === 0) return { winner: "draw", attackerRemaining: 0, defenderRemaining: 0, rounds: 0 };
  if (ap === dp) return { winner: "draw", attackerRemaining: ah, defenderRemaining: dh, rounds: 1 };
  const attackerWins = ap > dp;
  const winnerPower = attackerWins ? ap : dp;
  const loserHull = attackerWins ? dh : ah;
  const winnerHull = attackerWins ? ah : dh;
  const remaining = Math.max(0, winnerHull - loserHull * Math.min(1, (attackerWins ? dp : ap) / winnerPower));
  return { winner: attackerWins ? "attacker" : "defender", attackerRemaining: attackerWins ? remaining : 0, defenderRemaining: attackerWins ? 0 : remaining, rounds: 1 };
}
