/** Data-driven tier sheet: 18 base tiers plus three 18-tier expansions (72 total).
 * Character level (1-100) is separate from tier. Expansion level bands are placeholders:
 * expansions require both their story gates and expansion availability, not level alone.
 */
export type ExpansionId = 'base' | 'ancients' | 'dominion' | 'ascendancy';
export interface TierSheetRow {
  id: string; tier: number; name: string; expansion: ExpansionId; expansionName: string;
  stage: 'early' | 'mid' | 'late'; suggestedMinPlayerLevel: number; suggestedMaxPlayerLevel: number;
  storyChapterId: string; previousTierId?: string; description: string;
}
const EXPANSIONS = [
  {
    "id": "base",
    "name": "Base Game",
    "start": 1,
    "names": [
      "Frontier Awakening",
      "Foundations",
      "First Contact",
      "Colony Charter",
      "Resource Stabilization",
      "Industrial Base",
      "Research Initiative",
      "Fleet Readiness",
      "Orbital Defense",
      "Diplomatic Contact",
      "Colonial Expansion",
      "Advanced Industry",
      "Gateway Discovery",
      "Elite Command",
      "Relic Research",
      "Megastructure Initiative",
      "Frontier Crisis",
      "Base Game Ascendant"
    ],
    "description": "Core empire progression and the original campaign."
  },
  {
    "id": "ancients",
    "name": "Rise of the Ancients",
    "start": 19,
    "names": [
      "Ancient Echoes",
      "Relic Hunters",
      "Lost Archives",
      "Ancient Materials",
      "Precursor Signals",
      "Relic Synthesis",
      "Ancestral Engineering",
      "Gateway Mastery",
      "Artifact Forging",
      "Ancient Guardians",
      "Legacy Fleets",
      "Forgotten Worlds",
      "Precursor Conflict",
      "Ancient Ascension",
      "Relic Convergence",
      "Elder Threat",
      "Ancient Warfront",
      "Ancient Legacy"
    ],
    "description": "Ancient civilizations, relics, and precursor technology."
  },
  {
    "id": "dominion",
    "name": "Galactic Dominion",
    "start": 37,
    "names": [
      "Dominion Rising",
      "Faction Assembly",
      "Border Campaigns",
      "Galactic Logistics",
      "War Economy",
      "Alliance Command",
      "Conquest Doctrine",
      "Advanced Starbases",
      "Sector Governance",
      "Fleet Legions",
      "Planetary Hegemony",
      "Megastructure Networks",
      "Intergalactic Front",
      "Dominion Crisis",
      "Supreme Command",
      "Galactic Siege",
      "War of Sectors",
      "Dominion Ascendant"
    ],
    "description": "Intergalactic warfare, alliances, and territorial control."
  },
  {
    "id": "ascendancy",
    "name": "Eternal Ascendancy",
    "start": 55,
    "names": [
      "Cosmic Threshold",
      "Anomaly Survey",
      "Exotic Matter",
      "Apex Research",
      "Cosmic Forging",
      "Legendary Fleets",
      "Dimensional Frontiers",
      "World Engine",
      "Cosmic Diplomacy",
      "Apex Defenses",
      "Mythic Artifacts",
      "Reality Engines",
      "Extinction Protocol",
      "Eternal Warfront",
      "Ascendant Trials",
      "Final Convergence",
      "Last Bastion",
      "Eternal Ascendancy"
    ],
    "description": "Cosmic threats, apex technology, and the final campaign."
  }
] as const;
export const TIER_SHEET: readonly TierSheetRow[] = EXPANSIONS.flatMap((expansion) =>
  expansion.names.map((name, index): TierSheetRow => {
    const tier = expansion.start + index;
    const stage = index < 6 ? 'early' : index < 12 ? 'mid' : 'late';
    const suggestedMinPlayerLevel = expansion.id === 'base' ? Math.max(1, Math.ceil((index + 1) * 100 / 18) - 5) : 100;
    const suggestedMaxPlayerLevel = expansion.id === 'base' ? Math.min(100, Math.ceil((index + 1) * 100 / 18)) : 100;
    return {
      id: `tier-${String(tier).padStart(2, '0')}`, tier, name,
      expansion: expansion.id, expansionName: expansion.name, stage,
      suggestedMinPlayerLevel, suggestedMaxPlayerLevel,
      storyChapterId: `chapter-${String(tier).padStart(2, '0')}`,
      ...(tier > 1 ? { previousTierId: `tier-${String(tier - 1).padStart(2, '0')}` } : {}),
      description: expansion.description,
    };
  }),
);
export const TIER_BY_ID: ReadonlyMap<string, TierSheetRow> = new Map(TIER_SHEET.map((tier) => [tier.id, tier]));
export const TIER_BY_NUMBER: ReadonlyMap<number, TierSheetRow> = new Map(TIER_SHEET.map((tier) => [tier.tier, tier]));
export function validateTierSheet(rows: readonly TierSheetRow[] = TIER_SHEET): string[] {
  const errors: string[] = []; const ids = new Set<string>(); const numbers = new Set<number>();
  for (const row of rows) {
    if (ids.has(row.id)) errors.push(`Duplicate tier ID: ${row.id}`);
    if (numbers.has(row.tier)) errors.push(`Duplicate tier number: ${row.tier}`);
    ids.add(row.id); numbers.add(row.tier);
    if (!Number.isInteger(row.tier) || row.tier < 1 || row.tier > 72) errors.push(`Invalid tier number: ${row.tier}`);
    if (!row.storyChapterId.trim()) errors.push(`Missing story chapter for ${row.id}`);
    if (row.previousTierId && !rows.some((candidate) => candidate.id === row.previousTierId)) errors.push(`Missing prerequisite ${row.previousTierId} for ${row.id}`);
  }
  for (let tier = 1; tier <= 72; tier++) if (!numbers.has(tier)) errors.push(`Missing tier number: ${tier}`);
  return errors;
}
