import type { BattleRecord, BattleRepository } from '../repositories/battleRepository';

export class CombatService {
  constructor(private readonly battles: BattleRepository) {}

  async createBattle(attackerId: string, defenderId: string, now = Date.now()): Promise<BattleRecord> {
    if (!attackerId || !defenderId || attackerId === defenderId) throw new Error('INVALID_COMBAT_PARTICIPANTS');
    const battle: BattleRecord = {
      id: `battle-${now}-${Math.random().toString(36).slice(2, 10)}`,
      attackerId,
      defenderId,
      startedAt: now,
      status: 'pending',
      attackerLosses: {},
      defenderLosses: {},
    };
    await this.battles.save(battle);
    return battle;
  }

  async resolve(battle: BattleRecord, winnerId: string, now = Date.now()): Promise<BattleRecord> {
    if (battle.status !== 'pending') throw new Error('BATTLE_ALREADY_RESOLVED');
    if (winnerId !== battle.attackerId && winnerId !== battle.defenderId) throw new Error('INVALID_WINNER');
    const resolved = { ...battle, status: 'resolved' as const, winnerId, resolvedAt: now };
    await this.battles.save(resolved);
    return resolved;
  }
}
