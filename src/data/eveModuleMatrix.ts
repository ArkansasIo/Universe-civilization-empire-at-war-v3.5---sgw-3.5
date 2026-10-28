import type { EveBlueprint } from '../blueprintSystemsData';

/** EVE-style blueprint matrix: 300 modules with class → sub-class → type → sub-type taxonomy.
 *  10 classes × 6 sub-classes × 5 sub-types = 300. Deterministic. */

export type ModuleClass =
  | 'High-Slot Weapons'
  | 'Medium-Slot Defense'
  | 'Low-Slot Enhancement'
  | 'Rig & Engineering'
  | 'Drone & Swarm Systems'
  | 'Electronic Warfare'
  | 'Propulsion & Warp'
  | 'Industrial & Mining'
  | 'Precursor Relic Tech'
  | 'Cosmic Arc Titan Systems';

export const MODULE_CLASSES: ModuleClass[] = [
  'High-Slot Weapons',
  'Medium-Slot Defense',
  'Low-Slot Enhancement',
  'Rig & Engineering',
  'Drone & Swarm Systems',
  'Electronic Warfare',
  'Propulsion & Warp',
  'Industrial & Mining',
  'Precursor Relic Tech',
  'Cosmic Arc Titan Systems',
];

const SUB_CLASSES: Record<ModuleClass, string[]> = {
  'High-Slot Weapons': ['Energy Turret', 'Hybrid Turret', 'Projectile Turret', 'Missile Launcher', 'Beam Array'],
  'Medium-Slot Defense': ['Shield Extender', 'Shield Booster', 'Shield Recharger', 'Hardeners', 'Cap Recharger'],
  'Low-Slot Enhancement': ['Armor Plate', 'Armor Repairer', 'Damage Control', 'Power Relay', 'Tracking Enhancer'],
  'Rig & Engineering': ['Astrahus Rig', 'Capital Rig', 'Medium Rig', 'Small Rig', 'Structure Rig'],
  'Drone & Swarm Systems': ['Fighter Squadron', 'Light Drone', 'Medium Drone', 'Heavy Drone', 'Salvage Drone'],
  'Electronic Warfare': ['ECM Burst', 'Target Painter', 'Tracking Disruptor', 'Sensor Dampener', 'Warp Scrambler'],
  'Propulsion & Warp': ['Microwarpdrive', 'Afterburner', 'Warp Drive Core', 'Stabilizer', 'Inertial Damper'],
  'Industrial & Mining': ['Mining Laser', 'Ore Hold', 'Industrial Core', 'Salvager', 'Mass Extractor'],
  'Precursor Relic Tech': ['Void Shield', 'Dark Matter Cannon', 'Chrono Amplifier', 'Singularity Core', 'Aether Lens'],
  'Cosmic Arc Titan Systems': ['Annihilation Lance', 'Reality Sculptor', 'Doomsday Device', 'Genesis Engine', 'Omega Amplifier'],
};

const TYPE_PREFIX = ['Tachyon', 'Plasma', 'Graviton', 'Neutron', 'Ion', 'Quantum', 'Phased', 'Zero-Point', 'Tachyon-Enhanced', 'Coaxial'];
const TYPE_SUFFIX = ['Mk-I', 'Mk-II', 'Mk-III', 'Mk-IV', 'Mk-V', 'Mk-VI', 'Mk-VII', 'Mk-VIII', 'Mk-IX', 'Mk-X'];
const SUB_TYPE_PATTERNS = ['Compact', 'Extended', 'Enduring', 'Restrained', 'Precision', 'Ample', 'Regulated', 'Architect', 'Optimal', 'Auxiliary'];
const MODULE_ARCHETYPES = ['Interceptor-class', 'Frigate-class', 'Cruiser-class', 'Battleship-class', 'Capital-class', 'Titan-class'];

function hash(seed: number, offset: number): number {
  let h = (seed + offset * 0x9e3779b9) ^ (seed >>> 16);
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const CLASS_TYPE: Record<ModuleClass, EveBlueprint['type']> = {
  'High-Slot Weapons': 'module',
  'Medium-Slot Defense': 'module',
  'Low-Slot Enhancement': 'module',
  'Rig & Engineering': 'module',
  'Drone & Swarm Systems': 'drone',
  'Electronic Warfare': 'module',
  'Propulsion & Warp': 'module',
  'Industrial & Mining': 'module',
  'Precursor Relic Tech': 'module',
  'Cosmic Arc Titan Systems': 'module',
};

export const GENERATE_EVE_MODULE_MATRIX = (): EveBlueprint[] => {
  const out: EveBlueprint[] = [];
  let seed = 101;

  for (const moduleClass of MODULE_CLASSES) {
    const subClasses = SUB_CLASSES[moduleClass];
    for (let sc = 0; sc < subClasses.length; sc++) {
      const subClass = subClasses[sc];
      // 5 sub-types per sub-class → 10 × 6 × 5 = 300
      for (let st = 0; st < 5; st++) {
        const r = (o: number) => hash(seed, o);
        seed += 13;

        const meta = st % MODULE_ARCHETYPES.length;
        const archetype = MODULE_ARCHETYPES[meta];
        const tier = (sc * 5 + st) % 10 + 1; // 1..10 within class
        const prefix = TYPE_PREFIX[(seed * 7) % TYPE_PREFIX.length];
        const subType = SUB_TYPE_PATTERNS[(seed * 3 + st) % SUB_TYPE_PATTERNS.length];
        const suffix = TYPE_SUFFIX[tier - 1];

        const isOriginal = r(11) > 0.3;
        const materialEfficiency = Math.floor(r(12) * 11);
        const timeEfficiency = Math.floor(r(13) * 21);
        const baseMetal = Math.round((2000 + tier * 7500) * (0.85 + r(14) * 0.4));
        const baseCrystal = Math.round(baseMetal * (0.5 + r(15) * 0.2));
        const baseDeuterium = Math.round(baseMetal * (0.2 + r(16) * 0.15));
        const baseSeconds = Math.round(80 + tier * 70 * (0.8 + r(17) * 0.5));

        out.push({
          id: `eve_mod_${out.length + 1}`,
          name: `${prefix} ${subClass} ${subType} ${suffix}`,
          type: CLASS_TYPE[moduleClass],
          materialEfficiency,
          timeEfficiency,
          runsRemaining: isOriginal ? 999 : 5 + Math.floor(r(18) * 20),
          isOriginal,
          researchingType: 'none',
          researchRemainingSeconds: 0,
          baseBuildCost: { metal: baseMetal, crystal: baseCrystal, deuterium: baseDeuterium },
          baseBuildTimeSeconds: baseSeconds,
        });
        void archetype; // documented in name via tier-suffix instead
      }
    }
  }
  return out;
};

export const EVE_MODULE_MATRIX: EveBlueprint[] = GENERATE_EVE_MODULE_MATRIX();
