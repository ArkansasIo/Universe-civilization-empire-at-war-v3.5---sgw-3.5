/** Commander progression, equipment and paragon framework. Balance values are provisional. */
import type { SeasonalCommander } from '../game/seasonal-commanders';

export const COMMANDER_LEVEL_CAP = 100 as const;
export const COMMANDER_ASCENSION_CAP = 23 as const;
export const PARAGON_CATEGORIES = ['Warfare', 'Command', 'Research', 'Logistics', 'Ascendancy'] as const;
export type ParagonCategory = typeof PARAGON_CATEGORIES[number];

export const COMMANDER_GEAR_SLOTS = [
  { id: 'head', label: 'Head / Crown', category: 'armor', statFocus: 'defense' },
  { id: 'shoulders', label: 'Shoulders', category: 'armor', statFocus: 'defense' },
  { id: 'chest', label: 'Chest / Body', category: 'armor', statFocus: 'command' },
  { id: 'hands', label: 'Hands / Gauntlets', category: 'armor', statFocus: 'attack' },
  { id: 'legs', label: 'Legs / Greaves', category: 'armor', statFocus: 'defense' },
  { id: 'feet', label: 'Boots / Mobility', category: 'armor', statFocus: 'exploration' },
  { id: 'mainhand', label: 'Main-hand Weapon', category: 'weapon', statFocus: 'attack' },
  { id: 'offhand', label: 'Off-hand / Shield', category: 'weapon', statFocus: 'defense' },
  { id: 'cloak', label: 'Cloak / Tactical Rig', category: 'utility', statFocus: 'covert' },
  { id: 'implant', label: 'Neural Implant', category: 'implant', statFocus: 'research' },
  { id: 'relic', label: 'Ancient Relic', category: 'relic', statFocus: 'command' },
  { id: 'accessory', label: 'Command Insignia', category: 'accessory', statFocus: 'logistics' },
] as const;

export type CommanderGearSlotId = typeof COMMANDER_GEAR_SLOTS[number]['id'];
export interface CommanderGearItem {
  id: string;
  name: string;
  slot: CommanderGearSlotId;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  itemLevel: number;
  temperLevel: number;
  masterworkRank: number;
  stats: Partial<Record<keyof SeasonalCommander['stats'], number>>;
  source: 'forge' | 'masterwork-anvil' | 'drop' | 'craft' | 'seasonal';
  boundCommanderId?: string;
}
export interface CommanderGearLoadout {
  commanderId: string;
  slots: Partial<Record<CommanderGearSlotId, CommanderGearItem>>;
}
export interface CommanderProgressionState {
  commanderId: string;
  level: number;
  experience: number;
  ascension: number;
  talentRanks: Record<string, number>;
  paragonRanks: Record<ParagonCategory, number>;
  gear: CommanderGearLoadout;
}

export interface CommanderTalentNode {
  id: string;
  category: ParagonCategory;
  name: string;
  description: string;
  maxRank: number;
  pointsPerRank: number;
  stat: keyof SeasonalCommander['stats'];
  valuePerRank: number;
  prerequisites: string[];
}
const TALENT_DEFS: Array<Omit<CommanderTalentNode, 'id' | 'category'>> = [
  { name: 'Battlefield Doctrine', description: 'Increases direct combat effectiveness.', maxRank: 10, pointsPerRank: 1, stat: 'attack', valuePerRank: 1.5, prerequisites: [] },
  { name: 'Fortress Protocol', description: 'Improves defensive command and survivability.', maxRank: 10, pointsPerRank: 1, stat: 'defense', valuePerRank: 1.5, prerequisites: [] },
  { name: 'Fleet Coordination', description: 'Improves command throughput for assigned forces.', maxRank: 10, pointsPerRank: 1, stat: 'command', valuePerRank: 1.25, prerequisites: [] },
  { name: 'Quantum Method', description: 'Improves research support and technology operations.', maxRank: 10, pointsPerRank: 1, stat: 'research', valuePerRank: 1.25, prerequisites: [] },
  { name: 'Supply Network', description: 'Improves logistics and expedition efficiency.', maxRank: 10, pointsPerRank: 1, stat: 'logistics', valuePerRank: 1.25, prerequisites: [] },
  { name: 'Shadow Operations', description: 'Improves covert mission capability.', maxRank: 10, pointsPerRank: 1, stat: 'covert', valuePerRank: 1.25, prerequisites: [] },
  { name: 'Frontier Survey', description: 'Improves exploration and discovery support.', maxRank: 10, pointsPerRank: 1, stat: 'exploration', valuePerRank: 1.25, prerequisites: [] },
];
export const COMMANDER_TALENT_TREES: Record<ParagonCategory, CommanderTalentNode[]> = {
  Warfare: TALENT_DEFS.filter((node) => ['Battlefield Doctrine', 'Fortress Protocol'].includes(node.name)).map((node) => ({ ...node, id: 'warfare-' + node.name.toLowerCase().replace(/[^a-z]+/g, '-') , category: 'Warfare' })),
  Command: TALENT_DEFS.filter((node) => node.name === 'Fleet Coordination').map((node) => ({ ...node, id: 'command-fleet-coordination', category: 'Command' })),
  Research: TALENT_DEFS.filter((node) => node.name === 'Quantum Method').map((node) => ({ ...node, id: 'research-quantum-method', category: 'Research' })),
  Logistics: TALENT_DEFS.filter((node) => ['Supply Network', 'Frontier Survey'].includes(node.name)).map((node) => ({ ...node, id: 'logistics-' + node.name.toLowerCase().replace(/[^a-z]+/g, '-'), category: 'Logistics' })),
  Ascendancy: [{ id: 'ascendancy-paradox-mastery', category: 'Ascendancy', name: 'Paradox Mastery', description: 'Improves all commander stat contributions slightly after ascension.', maxRank: 23, pointsPerRank: 1, stat: 'command', valuePerRank: 0.5, prerequisites: [] }],
};

export const commanderXpToNextLevel = (level: number): number => {
  const safeLevel = Math.max(1, Math.min(COMMANDER_LEVEL_CAP, Math.floor(level)));
  return safeLevel >= COMMANDER_LEVEL_CAP ? 0 : Math.floor(100 * Math.pow(safeLevel, 1.65));
};

export function createCommanderProgression(commanderId: string): CommanderProgressionState {
  return {
    commanderId,
    level: 1,
    experience: 0,
    ascension: 0,
    talentRanks: {},
    paragonRanks: { Warfare: 0, Command: 0, Research: 0, Logistics: 0, Ascendancy: 0 },
    gear: { commanderId, slots: {} },
  };
}

export function getCommanderGearStatBonuses(loadout: CommanderGearLoadout): SeasonalCommander['stats'] {
  const totals: SeasonalCommander['stats'] = { command: 0, attack: 0, defense: 0, research: 0, logistics: 0, covert: 0, exploration: 0 };
  for (const item of Object.values(loadout.slots)) {
    if (!item) continue;
    for (const [key, value] of Object.entries(item.stats)) {
      const stat = key as keyof SeasonalCommander['stats'];
      if (stat in totals && Number.isFinite(value)) totals[stat] += Math.max(0, value ?? 0);
    }
  }
  return totals;
}

export function canAscendCommander(state: CommanderProgressionState): { allowed: boolean; reason: string } {
  if (state.level < COMMANDER_LEVEL_CAP) return { allowed: false, reason: 'Reach commander level 100 first.' };
  if (state.ascension >= COMMANDER_ASCENSION_CAP) return { allowed: false, reason: 'Maximum ascension reached (23).' };
  return { allowed: true, reason: 'Eligible for ascension. Confirm the reset and reward preview before proceeding.' };
}

export function validateCommanderProgressionState(state: CommanderProgressionState): string[] {
  const errors: string[] = [];
  if (!state.commanderId) errors.push('Missing commander ID.');
  if (!Number.isInteger(state.level) || state.level < 1 || state.level > COMMANDER_LEVEL_CAP) errors.push('Commander level must be 1–100.');
  if (!Number.isInteger(state.ascension) || state.ascension < 0 || state.ascension > COMMANDER_ASCENSION_CAP) errors.push('Ascension must be 0–23.');
  for (const category of PARAGON_CATEGORIES) {
    const rank = state.paragonRanks[category];
    if (!Number.isInteger(rank) || rank < 0 || rank > COMMANDER_ASCENSION_CAP) errors.push(`Invalid ${category} paragon rank.`);
  }
  for (const slot of Object.keys(state.gear.slots) as CommanderGearSlotId[]) {
    const item = state.gear.slots[slot];
    if (item && item.slot !== slot) errors.push(`Gear slot mismatch: ${slot} contains ${item.slot} item.`);
  }
  return errors;
}
