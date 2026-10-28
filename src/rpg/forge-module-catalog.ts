/**
 * Forge & Masterworks Anvil — modular crafting taxonomy.
 *
 * These are original game-system definitions, not EVE Online data. The EVE-inspired
 * reference is limited to blueprint/research workflow conventions.
 */
export type ForgeModuleClass =
  | 'tempering' | 'masterworking' | 'runes' | 'affixes' | 'socketing'
  | 'reforging' | 'salvage' | 'stability' | 'automation' | 'attunement';

export type ForgeModuleType =
  | 'power' | 'precision' | 'warding' | 'elemental' | 'void' | 'support'
  | 'recovery' | 'efficiency' | 'control';

export interface ForgeModuleDefinition {
  id: string;
  name: string;
  class: ForgeModuleClass;
  subclass: string;
  type: ForgeModuleType;
  subtype: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  slot: 'core' | 'matrix' | 'utility';
  requiredForgeLevel: number;
  requiredMasterworkRank: number;
  stats: Record<string, number>;
  subsets: string[];
  mechanics: string;
  drawbacks: string[];
}

const MODULE_BLUEPRINTS: Array<{
  class: ForgeModuleClass;
  subclasses: string[];
  type: ForgeModuleType;
  subtypes: string[];
  stat: string;
  base: number;
  mechanic: string;
  drawback: string;
}> = [
  { class: 'tempering', subclasses: ['Thermal Hammer', 'Phase Quench', 'Grain Refiner'], type: 'power', subtypes: ['Impact', 'Deep Heat', 'Rapid Cycle'], stat: 'temperPower', base: 2, mechanic: 'Raises temper effectiveness; each installed module adds a small multiplicative bonus, subject to the global cap.', drawback: 'Raises heat accumulation per attempt.' },
  { class: 'masterworking', subclasses: ['Astral Crucible', 'Master Seal', 'Perfecting Die'], type: 'precision', subtypes: ['Rank Yield', 'Perfect Finish', 'Rank Stability'], stat: 'masterworkPower', base: 1.5, mechanic: 'Improves masterwork stat yield and reduces the penalty from failed attempts.', drawback: 'Consumes more refined alloys.' },
  { class: 'runes', subclasses: ['Warding Glyph', 'Runic Conduit', 'Glyph Scribe'], type: 'warding', subtypes: ['Failure Guard', 'Seal Strength', 'Rune Duration'], stat: 'failureProtection', base: 1, mechanic: 'Improves protection-rune efficiency; never guarantees success unless a recipe explicitly says so.', drawback: 'Uses rune charge on each protected attempt.' },
  { class: 'affixes', subclasses: ['Edge Etcher', 'Suffix Loom', 'Prefix Lens'], type: 'elemental', subtypes: ['Prefix Quality', 'Suffix Quality', 'Affix Control'], stat: 'affixQuality', base: 1.25, mechanic: 'Improves the quality budget for one affix family and supports controlled rerolls.', drawback: 'Rerolls still obey item-family and rarity limits.' },
  { class: 'socketing', subclasses: ['Socket Borer', 'Gem Resonator', 'Prismatic Clamp'], type: 'support', subtypes: ['Socket Yield', 'Gem Resonance', 'Socket Lock'], stat: 'socketEfficiency', base: 1, mechanic: 'Improves socket crafting, gem compatibility checks, and socket preservation.', drawback: 'High-tier sockets require rare catalysts.' },
  { class: 'reforging', subclasses: ['Molecular Recast', 'Pattern Memory', 'Trait Reclaimer'], type: 'control', subtypes: ['Trait Retain', 'Material Yield', 'Recast Precision'], stat: 'reforgeControl', base: 1.1, mechanic: 'Lets eligible recipes retain one selected trait or improve material recovery.', drawback: 'Retained traits increase the reforge cost.' },
  { class: 'salvage', subclasses: ['Remains Separator', 'Scrap Magnet', 'Core Extractor'], type: 'recovery', subtypes: ['Ore Recovery', 'Core Recovery', 'Remains Yield'], stat: 'salvageYield', base: 1.5, mechanic: 'Increases salvage return from recorded item investment without duplicating unique materials.', drawback: 'Salvage destroys the source item.' },
  { class: 'stability', subclasses: ['Flux Dampener', 'Lattice Brace', 'Resonance Sink'], type: 'warding', subtypes: ['Heat Control', 'Failure Buffer', 'Integrity Lock'], stat: 'stability', base: 1.2, mechanic: 'Reduces heat and limits failure downgrade depth within the configured protection rules.', drawback: 'Slightly increases cycle duration.' },
  { class: 'automation', subclasses: ['Queue Governor', 'Batch Loader', 'Predictive Calibrator'], type: 'efficiency', subtypes: ['Queue Speed', 'Batch Cost', 'Forecast Accuracy'], stat: 'automationEfficiency', base: 1, mechanic: 'Improves queue management, batch throughput, and cost previews; it cannot bypass material checks.', drawback: 'Requires power upkeep while the queue is active.' },
  { class: 'attunement', subclasses: ['Faction Harmonizer', 'Elemental Lens', 'Void Tuner'], type: 'void', subtypes: ['Faction Match', 'Element Match', 'Void Resonance'], stat: 'attunement', base: 1.3, mechanic: 'Adds a small bonus when item, recipe, and catalyst tags match; mismatched tags grant no bonus.', drawback: 'Specialization reduces flexibility for mismatched recipes.' },
];

export const FORGE_MODULE_CATALOG: ForgeModuleDefinition[] = MODULE_BLUEPRINTS.flatMap((blueprint) =>
  blueprint.subclasses.flatMap((subclass, subclassIndex) =>
    blueprint.subtypes.map((subtype, subtypeIndex) => {
      const tier = (subclassIndex * 3 + subtypeIndex + 1) as ForgeModuleDefinition['tier'];
      const requiredForgeLevel = (tier - 1) * 10;
      return {
        id: `forge-${blueprint.class}-${subclassIndex + 1}-${subtypeIndex + 1}`,
        name: `${subclass} · ${subtype}`,
        class: blueprint.class,
        subclass,
        type: blueprint.type,
        subtype,
        tier,
        slot: (tier >= 7 ? 'core' : tier >= 4 ? 'matrix' : 'utility') as ForgeModuleDefinition['slot'],
        requiredForgeLevel,
        requiredMasterworkRank: Math.max(0, (tier - 1) * 8),
        stats: { [blueprint.stat]: +(blueprint.base * tier).toFixed(2) },
        subsets: [
          `tier-${tier}`,
          `class-${blueprint.class}`,
          `type-${blueprint.type}`,
          ...(tier >= 7 ? ['endgame'] : []),
          ...(subtypeIndex === 0 ? ['specialist'] : []),
        ],
        mechanics: blueprint.mechanic,
        drawbacks: [blueprint.drawback],
      };
    }),
  ),
);

export const FORGE_MODULES_BY_CLASS = FORGE_MODULE_CATALOG.reduce<Record<ForgeModuleClass, ForgeModuleDefinition[]>>((groups, module) => {
  groups[module.class].push(module);
  return groups;
}, {
  tempering: [], masterworking: [], runes: [], affixes: [], socketing: [],
  reforging: [], salvage: [], stability: [], automation: [], attunement: [],
});

export function getForgeModuleUnlocks(forgeLevel: number, masterworkRank: number): ForgeModuleDefinition[] {
  return FORGE_MODULE_CATALOG.filter((module) =>
    forgeLevel >= module.requiredForgeLevel && masterworkRank >= module.requiredMasterworkRank
  );
}

export function validateForgeModuleCatalog(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const module of FORGE_MODULE_CATALOG) {
    if (ids.has(module.id)) errors.push(`Duplicate module ID: ${module.id}`);
    ids.add(module.id);
    if (!module.name || !module.mechanics || module.subsets.length === 0) errors.push(`Incomplete module: ${module.id}`);
    if (module.tier < 1 || module.tier > 9) errors.push(`Invalid tier: ${module.id}`);
    if (Object.values(module.stats).some((value) => !Number.isFinite(value) || value < 0)) errors.push(`Invalid stat: ${module.id}`);
  }
  if (FORGE_MODULE_CATALOG.length !== 90) errors.push(`Expected 90 forge modules; found ${FORGE_MODULE_CATALOG.length}`);
  return errors;
}
