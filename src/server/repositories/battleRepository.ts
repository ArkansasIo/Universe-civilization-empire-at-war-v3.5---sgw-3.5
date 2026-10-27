export interface BattleRecord {
  id: string;
  attackerId: string;
  defenderId: string;
  startedAt: number;
  resolvedAt?: number;
  status: 'pending' | 'resolved' | 'cancelled';
  winnerId?: string;
  attackerLosses: Record<string, number>;
  defenderLosses: Record<string, number>;
}

export interface BattleRepository {
  getById(id: string): Promise<BattleRecord | null>;
  save(battle: BattleRecord): Promise<void>;
}

export class InMemoryBattleRepository implements BattleRepository {
  private readonly battles = new Map<string, BattleRecord>();

  async getById(id: string): Promise<BattleRecord | null> {
    const battle = this.battles.get(id);
    return battle ? structuredClone(battle) : null;
  }

  async save(battle: BattleRecord): Promise<void> {
    this.battles.set(battle.id, structuredClone(battle));
  }
}
