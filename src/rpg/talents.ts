export interface TalentNode { id: string; name: string; maxRank: number; costPerRank: number; requires: string[]; bonuses: Record<string, number>; }
export interface TalentState { ranks: Record<string, number>; points: number; }

export const STARTER_TALENTS: TalentNode[] = [
  { id: "vanguard", name: "Vanguard", maxRank: 5, costPerRank: 1, requires: [], bonuses: { armor: 3, maxHp: 10 } },
  { id: "weapon-mastery", name: "Weapon Mastery", maxRank: 5, costPerRank: 1, requires: [], bonuses: { physicalPower: 4 } },
  { id: "arcane-focus", name: "Arcane Focus", maxRank: 5, costPerRank: 1, requires: [], bonuses: { magicalPower: 5, maxMana: 8 } }
];

export function createTalentState(points = 0): TalentState { return { ranks: {}, points }; }

export function investTalent(state: TalentState, node: TalentNode): TalentState {
  const current = state.ranks[node.id] ?? 0;
  if (current >= node.maxRank) throw new Error("talent is maxed");
  if (state.points < node.costPerRank) throw new Error("insufficient talent points");
  return { points: state.points - node.costPerRank, ranks: { ...state.ranks, [node.id]: current + 1 } };
}

export function resetTalents(state: TalentState, nodes: TalentNode[], refundRatio = 1): TalentState {
  const spent = nodes.reduce((n, node) => n + (state.ranks[node.id] ?? 0) * node.costPerRank, 0);
  return { points: state.points + Math.floor(spent * refundRatio), ranks: {} };
}
