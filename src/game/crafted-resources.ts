/** Craftable intermediate-resource catalog for the StargateWars / OGame-style economy.
 * Resource recipes are original project data. Costs and yields are provisional balance values.
 */
export type CraftedResourceClass =
  | 'alloys' | 'crystals' | 'isotopes' | 'gases' | 'polymers'
  | 'electronics' | 'components' | 'energy-cells' | 'nanomaterials'
  | 'biomaterials' | 'relics' | 'runes' | 'catalysts' | 'forge-materials'
  | 'masterwork-materials' | 'ship-components' | 'defense-components'
  | 'research-reagents' | 'blueprint-media' | 'terraforming' | 'strategic-supplies'
  | 'commander-gear' | 'ascension-matrices';

export type CraftedResourceTier = 1 | 2 | 3 | 4 | 5;
export type BaseResourceId = 'metal' | 'crystal' | 'deuterium' | 'naquadah' | 'energy' | 'food' | 'water';

export interface CraftedResourceDefinition {
  id: string;
  name: string;
  class: CraftedResourceClass;
  subclass: string;
  type: string;
  subtype: string;
  tier: CraftedResourceTier;
  description: string;
  inputs: Partial<Record<BaseResourceId | string, number>>;
  outputQuantity: number;
  craftSeconds: number;
  requiredFacility: 'refinery' | 'laboratory' | 'forge' | 'shipyard' | 'biofoundry' | 'ascension-chamber';
  tags: string[];
  usedFor: string[];
}

type RecipeSeed = {
  class: CraftedResourceClass;
  subclasses: string[];
  types: string[];
  subtypes: string[];
  baseInputs: Partial<Record<BaseResourceId, number>>;
  outputQuantity: number;
  facility: CraftedResourceDefinition['requiredFacility'];
  usedFor: string[];
  description: string;
};

const SEEDS: RecipeSeed[] = [
  { class: 'alloys', subclasses: ['Structural', 'Reinforced', 'Exotic'], types: ['Hull Alloy', 'Armour Alloy', 'Precision Alloy'], subtypes: ['Plate', 'Mesh', 'Ingot'], baseInputs: { metal: 120, crystal: 20 }, outputQuantity: 5, facility: 'refinery', usedFor: ['ships', 'buildings', 'commander-armor'], description: 'Refined structural metals for hulls, buildings, and protective gear.' },
  { class: 'crystals', subclasses: ['Optical', 'Resonant', 'Quantum'], types: ['Lens', 'Lattice', 'Prism'], subtypes: ['Clear', 'Charged', 'Fractured'], baseInputs: { crystal: 100, deuterium: 10 }, outputQuantity: 4, facility: 'laboratory', usedFor: ['research', 'sensors', 'blueprints'], description: 'Engineered crystal matrices for research and precision systems.' },
  { class: 'isotopes', subclasses: ['Stable', 'Fissionable', 'Exotic'], types: ['Fuel Isotope', 'Reactor Isotope', 'Ancient Isotope'], subtypes: ['Pellet', 'Rod', 'Capsule'], baseInputs: { deuterium: 90, crystal: 15 }, outputQuantity: 4, facility: 'refinery', usedFor: ['reactors', 'ships', 'ascension'], description: 'Controlled isotopes used in propulsion, power, and high-tier reactions.' },
  { class: 'gases', subclasses: ['Cryogenic', 'Noble', 'Reactive'], types: ['Coolant Gas', 'Noble Gas', 'Reactive Gas'], subtypes: ['Canister', 'Blend', 'Concentrate'], baseInputs: { deuterium: 75, energy: 10 }, outputQuantity: 4, facility: 'refinery', usedFor: ['reactors', 'engines', 'research'], description: 'Processed gases for cooling, propulsion, and industrial chemistry.' },
  { class: 'polymers', subclasses: ['Flexible', 'Ceramic', 'Adaptive'], types: ['Polymer', 'Ceramite', 'Smart Material'], subtypes: ['Sheet', 'Composite', 'Filament'], baseInputs: { metal: 40, crystal: 40, deuterium: 10 }, outputQuantity: 4, facility: 'refinery', usedFor: ['armor', 'modules', 'habitats'], description: 'Composite materials for light structures, seals, and adaptable equipment.' },
  { class: 'electronics', subclasses: ['Control', 'Sensor', 'Quantum'], types: ['Control Board', 'Sensor Array', 'Quantum Circuit'], subtypes: ['Basic', 'Hardened', 'Miniaturized'], baseInputs: { metal: 35, crystal: 70, energy: 15 }, outputQuantity: 3, facility: 'laboratory', usedFor: ['ships', 'defenses', 'research', 'gear'], description: 'Electronic assemblies for command, targeting, and computation.' },
  { class: 'components', subclasses: ['Mechanical', 'Hydraulic', 'Actuator'], types: ['Gear Assembly', 'Servo Pack', 'Actuator Core'], subtypes: ['Standard', 'Precision', 'Heavy-duty'], baseInputs: { metal: 90, crystal: 15 }, outputQuantity: 5, facility: 'refinery', usedFor: ['buildings', 'ships', 'forge'], description: 'Reusable mechanical components for production systems.' },
  { class: 'energy-cells', subclasses: ['Capacitor', 'Fusion', 'Zero-point'], types: ['Power Cell', 'Fusion Cell', 'Zero-point Cell'], subtypes: ['Compact', 'High-output', 'Stabilized'], baseInputs: { crystal: 50, deuterium: 60, energy: 25 }, outputQuantity: 2, facility: 'refinery', usedFor: ['modules', 'ships', 'research', 'ascension'], description: 'Stored energy packages for high-demand systems.' },
  { class: 'nanomaterials', subclasses: ['Nanite', 'Self-healing', 'Programmable'], types: ['Nanite Paste', 'Repair Swarm', 'Smart Lattice'], subtypes: ['Dust', 'Gel', 'Matrix'], baseInputs: { metal: 100, crystal: 60, deuterium: 35 }, outputQuantity: 2, facility: 'laboratory', usedFor: ['repairs', 'masterworking', 'shipyard'], description: 'Microscale materials that repair, reinforce, or reconfigure equipment.' },
  { class: 'biomaterials', subclasses: ['Nutrient', 'Genetic', 'Symbiotic'], types: ['Nutrient Gel', 'Gene Culture', 'Symbiote Matrix'], subtypes: ['Base', 'Refined', 'Stable'], baseInputs: { food: 80, water: 50, energy: 10 }, outputQuantity: 4, facility: 'biofoundry', usedFor: ['population', 'medicine', 'commander-implants'], description: 'Bio-industrial inputs for life support and bio-compatible enhancements.' },
  { class: 'relics', subclasses: ['Ancient', 'Precursor', 'Paradox'], types: ['Relic Fragment', 'Ancient Inscription', 'Paradox Shard'], subtypes: ['Dormant', 'Awakened', 'Bound'], baseInputs: { naquadah: 300, crystal: 150, energy: 50 }, outputQuantity: 1, facility: 'laboratory', usedFor: ['research', 'ascension', 'gear'], description: 'Stabilized relic derivatives; actual ancient relic drops remain unique loot.' },
  { class: 'runes', subclasses: ['Warding', 'Resonance', 'Binding'], types: ['Warding Rune', 'Resonance Rune', 'Binding Rune'], subtypes: ['Etched', 'Charged', 'Greater'], baseInputs: { crystal: 80, naquadah: 100, energy: 15 }, outputQuantity: 2, facility: 'forge', usedFor: ['tempering-protection', 'affixes', 'sockets'], description: 'Crafted glyphs used to stabilize risky forging and equipment enchantments.' },
  { class: 'catalysts', subclasses: ['Thermal', 'Void', 'Elemental'], types: ['Thermal Catalyst', 'Void Catalyst', 'Elemental Catalyst'], subtypes: ['Weak', 'Concentrated', 'Pure'], baseInputs: { deuterium: 70, crystal: 70, naquadah: 120 }, outputQuantity: 1, facility: 'laboratory', usedFor: ['crafting', 'invention', 'masterworking'], description: 'Reaction catalysts for high-tier recipes and blueprint invention.' },
  { class: 'forge-materials', subclasses: ['Tempering', 'Refining', 'Primordial'], types: ['Tempering Stone', 'Refined Ore', 'Primordial Ingot'], subtypes: ['Crude', 'Refined', 'Perfected'], baseInputs: { metal: 150, crystal: 60, energy: 20 }, outputQuantity: 3, facility: 'forge', usedFor: ['tempering', 'reforging', 'salvage'], description: 'Forge feedstock used to improve item quality and recover crafted remains.' },
  { class: 'masterwork-materials', subclasses: ['Core', 'Seal', 'Astral'], types: ['Masterwork Core', 'Masterwork Seal', 'Astral Core'], subtypes: ['Cracked', 'Stable', 'Perfect'], baseInputs: { metal: 180, crystal: 160, naquadah: 100 }, outputQuantity: 1, facility: 'forge', usedFor: ['masterworking', 'protection', 'legendary-gear'], description: 'Rare components that support masterwork ranks and protection.' },
  { class: 'ship-components', subclasses: ['Propulsion', 'Navigation', 'Weapon'], types: ['Engine Assembly', 'Nav Computer', 'Weapon Mount'], subtypes: ['Light', 'Medium', 'Capital'], baseInputs: { metal: 240, crystal: 100, deuterium: 100 }, outputQuantity: 2, facility: 'shipyard', usedFor: ['ships', 'fleet-refits', 'blueprints'], description: 'Shipyard assemblies for propulsion, navigation, and weapons.' },
  { class: 'defense-components', subclasses: ['Barrier', 'Turret', 'Interceptor'], types: ['Shield Emitter', 'Turret Assembly', 'Interceptor Node'], subtypes: ['Planetary', 'Orbital', 'Fortress'], baseInputs: { metal: 180, crystal: 130, deuterium: 45 }, outputQuantity: 2, facility: 'shipyard', usedFor: ['planetary-defense', 'fortress', 'fleet-defense'], description: 'Assemblies for defensive platforms and interception networks.' },
  { class: 'research-reagents', subclasses: ['Data', 'Exotic', 'Cognitive'], types: ['Research Data Pack', 'Exotic Reagent', 'Cognitive Matrix'], subtypes: ['Surveyed', 'Validated', 'Advanced'], baseInputs: { crystal: 120, naquadah: 90, energy: 30 }, outputQuantity: 2, facility: 'laboratory', usedFor: ['technology', 'research', 'commander-talents'], description: 'Prepared research inputs that turn raw discoveries into repeatable lab work.' },
  { class: 'blueprint-media', subclasses: ['Archive', 'Quantum', 'Encrypted'], types: ['Blueprint Data Core', 'Quantum Schematic', 'Encrypted Pattern'], subtypes: ['Blank', 'Encoded', 'Verified'], baseInputs: { crystal: 90, metal: 40, naquadah: 60 }, outputQuantity: 1, facility: 'laboratory', usedFor: ['blueprints', 'copying', 'invention'], description: 'Media for storing, copying, validating, and inventing manufacturing blueprints.' },
  { class: 'terraforming', subclasses: ['Atmospheric', 'Hydrological', 'Ecological'], types: ['Atmosphere Kit', 'Hydroponic Module', 'Eco-seed Bank'], subtypes: ['Starter', 'Balanced', 'Resilient'], baseInputs: { metal: 100, crystal: 60, food: 60, water: 60 }, outputQuantity: 2, facility: 'biofoundry', usedFor: ['planetary-development', 'biomes', 'colonies'], description: 'Planetary kits for atmosphere management, water cycles, and biosphere restoration.' },
  { class: 'strategic-supplies', subclasses: ['Fleet', 'Colony', 'Expedition'], types: ['Fleet Ration Pack', 'Colony Supply Crate', 'Expedition Kit'], subtypes: ['Standard', 'Extended', 'Emergency'], baseInputs: { metal: 40, food: 80, water: 80, naquadah: 30 }, outputQuantity: 3, facility: 'refinery', usedFor: ['fleet-upkeep', 'colonies', 'exploration'], description: 'Packaged supplies for fleets, settlement logistics, and expeditions.' },
  { class: 'commander-gear', subclasses: ['Armor', 'Weapon', 'Utility'], types: ['Commander Armor Kit', 'Commander Weapon Kit', 'Commander Utility Kit'], subtypes: ['Field', 'Elite', 'Mythic'], baseInputs: { metal: 140, crystal: 90, naquadah: 80 }, outputQuantity: 1, facility: 'forge', usedFor: ['commander-equipment', 'talents', 'loadouts'], description: 'Base kits for the twelve commander equipment slots; gear quality is then improved at the anvil.' },
  { class: 'ascension-matrices', subclasses: ['Warfare', 'Knowledge', 'Paradox'], types: ['Ascension Matrix', 'Knowledge Matrix', 'Paradox Matrix'], subtypes: ['Dormant', 'Attuned', 'Transcendent'], baseInputs: { naquadah: 500, crystal: 250, deuterium: 200, energy: 100 }, outputQuantity: 1, facility: 'ascension-chamber', usedFor: ['commander-ascension', 'paragon', 'late-game-upgrades'], description: 'High-tier crafted matrices for commander ascension and paragon progression; gated by progression and facility access.' },
];

const TIER_MULTIPLIERS: Record<CraftedResourceTier, number> = { 1: 1, 2: 2.5, 3: 6, 4: 14, 5: 32 };
const TIER_NAMES: Record<CraftedResourceTier, string> = { 1: 'Basic', 2: 'Refined', 3: 'Advanced', 4: 'Rare', 5: 'Exotic' };

export const CRAFTED_RESOURCE_CATALOG: CraftedResourceDefinition[] = SEEDS.flatMap((seed, seedIndex) =>
  seed.subclasses.flatMap((subclass, subclassIndex) =>
    seed.types.map((type, typeIndex) => {
      const tier = (typeIndex + 1) as CraftedResourceTier;
      const multiplier = TIER_MULTIPLIERS[tier];
      const inputs = Object.fromEntries(Object.entries(seed.baseInputs).map(([key, amount]) => [key, Math.ceil((amount ?? 0) * multiplier * (1 + subclassIndex * 0.25))]));
      return {
        id: `crafted-${seed.class}-${subclassIndex + 1}-${typeIndex + 1}`,
        name: `${TIER_NAMES[tier]} ${subclass} ${type}`,
        class: seed.class,
        subclass,
        type,
        subtype: seed.subtypes[(typeIndex + subclassIndex) % seed.subtypes.length],
        tier,
        description: seed.description,
        inputs,
        outputQuantity: Math.max(1, Math.floor(seed.outputQuantity / Math.max(1, tier - 1))),
        craftSeconds: Math.round((15 + seedIndex * 2) * TIER_MULTIPLIERS[tier]),
        requiredFacility: seed.facility,
        tags: [seed.class, subclass.toLowerCase().replace(/\s+/g, '-'), `tier-${tier}`],
        usedFor: seed.usedFor,
      };
    }),
  ),
);

export const CRAFTED_RESOURCE_BY_ID: ReadonlyMap<string, CraftedResourceDefinition> = new Map(CRAFTED_RESOURCE_CATALOG.map((resource) => [resource.id, resource]));

export function validateCraftedResourceCatalog(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const resource of CRAFTED_RESOURCE_CATALOG) {
    if (ids.has(resource.id)) errors.push(`Duplicate crafted resource ID: ${resource.id}`);
    ids.add(resource.id);
    if (!resource.name || !resource.description || resource.usedFor.length === 0) errors.push(`Incomplete resource definition: ${resource.id}`);
    if (resource.outputQuantity < 1 || resource.craftSeconds < 1) errors.push(`Invalid yield or duration: ${resource.id}`);
    for (const [input, amount] of Object.entries(resource.inputs)) {
      if (amount === undefined || !Number.isFinite(amount) || amount <= 0) errors.push(`Invalid recipe input ${input} in ${resource.id}`);
    }
  }
  if (CRAFTED_RESOURCE_CATALOG.length !== 207) errors.push(`Expected 207 recipes (23 classes × 3 subclasses × 3 types); found ${CRAFTED_RESOURCE_CATALOG.length}`);
  return errors;
}
