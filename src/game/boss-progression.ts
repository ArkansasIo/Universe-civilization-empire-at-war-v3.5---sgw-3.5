/** Story-gated Galaxy and Arc boss encounter sheet.
 * Encounter titles and thresholds are a first-pass design baseline and need balance testing.
 * Keep galaxy/planet discovery visible in the Galaxy view; these records gate boss encounters only.
 */
import { TIER_SHEET } from './progression-tiers';

export type BossEncounterKind = 'galaxy' | 'arc';
export interface BossEncounterDefinition {
  id: string;
  name: string;
  kind: BossEncounterKind;
  tier: number;
  chapterId: string;
  minimumPlayerLevel: number;
  prerequisiteBossIds: readonly string[];
  requiredQuestIds: readonly string[];
  recommendedPower: number;
  rewardTierId: string;
}
const bossTitles = [
  'The Shattered Gate Warden','The Ashen Star Devourer','The Riftbound Admiral',
  'The Ancient World Sentinel','The Replicator Nexus','The Goa’uld System Lord',
  'The Asgard Exile','The Tau’ri War Engine','The Void Leviathan','The Fractured Galaxy Core',
  'The Precursor Sovereign','The Dominion Breaker','The Starforge Colossus','The Eternal Rift Dragon',
  'The Cosmic Architect','The Null-Sun Harbinger','The Last Arc Tyrant','The Eternal Ascendant',
] as const;
export const BOSS_ENCOUNTERS: readonly BossEncounterDefinition[] = bossTitles.map((name, index) => {
  const tier = (index + 1) * 4;
  const tierRow = TIER_SHEET.find((row) => row.tier === tier)!;
  return {
    id: `boss-${String(index + 1).padStart(2, '0')}`,
    name,
    kind: index % 3 === 2 ? 'arc' : 'galaxy',
    tier,
    chapterId: tierRow.storyChapterId,
    minimumPlayerLevel: tierRow.suggestedMinPlayerLevel,
    prerequisiteBossIds: index === 0 ? [] : [`boss-${String(index).padStart(2, '0')}`],
    requiredQuestIds: [`quest-boss-${String(index + 1).padStart(2, '0')}-unlocked`],
    recommendedPower: Math.round(1000 * Math.pow(1.8, index)),
    rewardTierId: tierRow.id,
  };
});

export interface BossProgressState {
  playerLevel: number;
  completedChapterIds: ReadonlySet<string>;
  completedQuestIds: ReadonlySet<string>;
  defeatedBossIds: ReadonlySet<string>;
  unlockedTierIds: ReadonlySet<string>;
}
export interface BossAccessResult { allowed: boolean; reasons: string[]; }
export function evaluateBossAccess(
  boss: BossEncounterDefinition,
  state: BossProgressState,
): BossAccessResult {
  const reasons: string[] = [];
  if (state.playerLevel < boss.minimumPlayerLevel) reasons.push(`Reach player level ${boss.minimumPlayerLevel}.`);
  if (!state.completedChapterIds.has(boss.chapterId)) reasons.push(`Complete story chapter ${boss.chapterId}.`);
  for (const questId of boss.requiredQuestIds) {
    if (!state.completedQuestIds.has(questId)) reasons.push(`Complete prerequisite quest ${questId}.`);
  }
  for (const prerequisiteBossId of boss.prerequisiteBossIds) {
    if (!state.defeatedBossIds.has(prerequisiteBossId)) reasons.push(`Defeat prerequisite boss ${prerequisiteBossId}.`);
  }
  if (!state.unlockedTierIds.has(boss.rewardTierId)) reasons.push(`Unlock progression tier ${boss.rewardTierId}.`);
  return { allowed: reasons.length === 0, reasons };
}
export function validateBossEncounterSheet(rows: readonly BossEncounterDefinition[] = BOSS_ENCOUNTERS): string[] {
  const errors: string[] = [];
  const ids = new Set(rows.map((row) => row.id));
  if (ids.size !== rows.length) errors.push('Duplicate boss encounter IDs.');
  for (const row of rows) {
    if (!TIER_SHEET.some((tier) => tier.storyChapterId === row.chapterId)) errors.push(`Unknown story chapter ${row.chapterId} for ${row.id}.`);
    if (!TIER_SHEET.some((tier) => tier.id === row.rewardTierId)) errors.push(`Unknown reward tier ${row.rewardTierId} for ${row.id}.`);
    for (const prerequisite of row.prerequisiteBossIds) if (!ids.has(prerequisite)) errors.push(`Unknown prerequisite boss ${prerequisite} for ${row.id}.`);
  }
  return errors;
}
