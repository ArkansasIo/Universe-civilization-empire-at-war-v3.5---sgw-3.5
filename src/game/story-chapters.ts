/** Story chapter sheet aligned one-to-one with the 72 tier milestones.
 * These are stable IDs and planning titles; narrative objectives and rewards remain to be authored.
 */
import { TIER_SHEET } from './progression-tiers';
export interface StoryChapterRow {
  id: string; tierId: string; tier: number; title: string; expansion: string;
  prerequisiteChapterIds: readonly string[]; minimumPlayerLevel: number; objectivesStatus: 'planned';
}
export const STORY_CHAPTER_SHEET: readonly StoryChapterRow[] = TIER_SHEET.map((tier) => ({
  id: tier.storyChapterId,
  tierId: tier.id,
  tier: tier.tier,
  title: tier.name,
  expansion: tier.expansionName,
  prerequisiteChapterIds: tier.tier > 1 ? [`chapter-${String(tier.tier - 1).padStart(2, '0')}`] : [],
  minimumPlayerLevel: tier.suggestedMinPlayerLevel,
  objectivesStatus: 'planned',
}));
