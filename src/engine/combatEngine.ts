export interface Combatant {
  id: string;
  attack: number;
  defense: number;
  units: number;
  damageMultiplier?: number;
  defenseMultiplier?: number;
}

export interface CombatConfig {
  attackerTurnCost: number;
  lootPercent: number;
  attackerLossPercent: number;
  defenderLossPercent: number;
}

export interface CombatResult {
  victory: boolean;
  attackerPower: number;
  defenderPower: number;
  attackerCasualties: number;
  defenderCasualties: number;
  loot: number;
  turnsSpent: number;
}

export const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  attackerTurnCost: 1,
  lootPercent: 0.25,
  attackerLossPercent: 0.1,
  defenderLossPercent: 0.45,
};

function positive(value: number | undefined): number {
  return Math.max(0, Number.isFinite(value ?? 0) ? value ?? 0 : 0);
}

function casualtyCount(units: number, percentage: number): number {
  if (units <= 0) return 0;
  return Math.min(Math.floor(units), Math.max(0, Math.ceil(units * percentage)));
}

/**
 * Deterministic combat resolver. Randomness is deliberately excluded from
 * the authoritative calculation so the server can replay and audit a battle.
 */
export function resolveCombat(
  attacker: Combatant,
  defender: Combatant,
  defenderNaquadah: number,
  config: CombatConfig = DEFAULT_COMBAT_CONFIG,
): CombatResult {
  const attackerPower =
    positive(attacker.attack) *
    Math.max(1, positive(attacker.units)) *
    Math.max(0.1, attacker.damageMultiplier ?? 1);

  const defenderPower =
    positive(defender.defense) *
    Math.max(1, positive(defender.units)) *
    Math.max(0.1, defender.defenseMultiplier ?? 1);

  const victory = attackerPower > defenderPower;
  const attackerCasualties = casualtyCount(
    positive(attacker.units),
    victory ? config.attackerLossPercent : Math.min(1, config.attackerLossPercent * 2.5),
  );
  const defenderCasualties = casualtyCount(
    positive(defender.units),
    victory ? config.defenderLossPercent : Math.min(1, config.defenderLossPercent * 0.35),
  );

  const loot = victory
    ? Math.max(0, Math.floor(Math.max(0, defenderNaquadah) * Math.min(1, Math.max(0, config.lootPercent))))
    : 0;

  return {
    victory,
    attackerPower,
    defenderPower,
    attackerCasualties,
    defenderCasualties,
    loot,
    turnsSpent: Math.max(0, Math.floor(config.attackerTurnCost)),
  };
}
