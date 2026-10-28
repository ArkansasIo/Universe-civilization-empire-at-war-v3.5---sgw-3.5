/** Galactic Technology Archive — 90 tech modules with full taxonomy:
 *  9 classes × 10 sub-classes, each module carrying primary stats and sub-stats.
 *  Deterministic generation (Murmur-style hash, consistent with the rest of the data layer). */

export type TechClass =
  | 'Directed Energy'
  | 'Kinetic Ballistics'
  | 'Explosive Ordnance'
  | 'Deflector Shields'
  | 'Armor & Hull'
  | 'Signature & Stealth'
  | 'Warp & Navigation'
  | 'Resource Engineering'
  | 'Nanite Cybernetics';

export const TECH_CLASSES: TechClass[] = [
  'Directed Energy',
  'Kinetic Ballistics',
  'Explosive Ordnance',
  'Deflector Shields',
  'Armor & Hull',
  'Signature & Stealth',
  'Warp & Navigation',
  'Resource Engineering',
  'Nanite Cybernetics',
];

const SUB_CLASSES: Record<TechClass, string[]> = {
  'Directed Energy': ['Laser Amplifier', 'Plasma Emitter', 'Beam Focuser', 'Pulse Modulator', 'Ion Projector', 'Tachyon Lens', 'Photon Cascade', 'Thermal Lance', 'Prism Refractor', 'Starfire Coil'],
  'Kinetic Ballistics': ['Railgun Barrel', 'Gauss Accelerator', 'Autocannon Feed', 'Mass Driver', 'Coilgun Housing', 'Sabot Chamber', 'Recoil Damper', 'Muzzle Brake', 'Barrel Casing', 'Slug Forge'],
  'Explosive Ordnance': ['Torpedo Warhead', 'Missile Guidance', 'Bomb Rack', 'Mine Layer', 'Rocket Pod', 'Fusion Payload', 'Detonator Core', 'Propellant Cell', 'Seeker Array', 'Fragmentation Sleeve'],
  'Deflector Shields': ['Shield Emitter', 'Harmonic Buffer', 'Resonance Grid', 'Capacitor Bank', 'Deflection Dome', 'Phased Screen', 'Adaptive Field', 'Aegis Projector', 'Barrier Lattice', 'Ward Generator'],
  'Armor & Hull': ['Composite Plate', 'Reactive Layer', 'Ablative Panel', 'Trinium Frame', 'Bulkhead Brace', 'Nanite Weld', 'Ceramic Weave', 'Kinetic Foam', 'Sloped Plating', 'Keel Reinforcement'],
  'Signature & Stealth': ['Cloak Field', 'Radar Absorber', 'ECM Transmitter', 'Decoy Emitter', 'Thermal Masker', 'Sensor Jammer', 'Hologram Veil', 'Phase Shifter', 'Quiet Drive', 'Echo Canceller'],
  'Warp & Navigation': ['Warp Coil', 'Jump Drive', 'Inertial Compensator', 'Thruster Array', 'Gyro Stabilizer', 'Astrogation Core', 'Slipstream Nozzle', 'Fold Engine', 'Beacon Resolver', 'Autopilot Matrix'],
  'Resource Engineering': ['Ore Scanner', 'Refinery Valve', 'Cargo Compressor', 'Fabricator Arm', 'Smelter Core', 'Salvage Claw', 'Silo Pump', 'Asteroid Tether', 'Recycler Bay', 'Yield Booster'],
  'Nanite Cybernetics': ['Repair Swarm', 'Neural Uplink', 'Adaptive Cortex', 'Self-Heal Lattice', 'Overclock Chip', 'Drone Hive Node', 'Replicator Seed', 'Logic Weaver', 'Synapse Relay', 'Evolution Core'],
};

export type StatKey =
  | 'attack' | 'defense' | 'shield' | 'accuracy' | 'evasion' | 'critChance' | 'critDamage'
  | 'attackSpeed' | 'castSpeed' | 'moveSpeed' | 'armorPenetration' | 'magicPenetration'
  | 'damageReduction' | 'blockChance' | 'parryChance' | 'dodgeChance' | 'tenacity' | 'poise'
  | 'hpRegen' | 'mpRegen' | 'cooldownReduction' | 'threatMultiplier' | 'shieldPower' | 'energyCost';

export const PRIMARY_STATS: StatKey[] = ['attack', 'defense', 'shield', 'accuracy', 'evasion'];
export const SUB_STATS: StatKey[] = [
  'critChance', 'critDamage', 'attackSpeed', 'castSpeed', 'moveSpeed', 'armorPenetration',
  'magicPenetration', 'damageReduction', 'blockChance', 'parryChance', 'dodgeChance',
  'tenacity', 'poise', 'hpRegen', 'mpRegen', 'cooldownReduction', 'threatMultiplier', 'shieldPower',
];

const STAT_LABELS: Record<StatKey, string> = {
  attack: 'Attack', defense: 'Defense', shield: 'Shield', accuracy: 'Accuracy', evasion: 'Evasion',
  critChance: 'Crit Chance', critDamage: 'Crit Damage', attackSpeed: 'Attack Speed', castSpeed: 'Cast Speed',
  moveSpeed: 'Move Speed', armorPenetration: 'Armor Pen.', magicPenetration: 'Magic Pen.',
  damageReduction: 'Damage Reduction', blockChance: 'Block Chance', parryChance: 'Parry Chance',
  dodgeChance: 'Dodge Chance', tenacity: 'Tenacity', poise: 'Poise', hpRegen: 'HP Regen',
  mpRegen: 'MP Regen', cooldownReduction: 'CDR', threatMultiplier: 'Threat Mult.', shieldPower: 'Shield Power',
  energyCost: 'Energy Cost',
};

export interface TechModule {
  id: string;
  classId: number; // 1..9
  techClass: TechClass;
  subClassId: number; // 1..10
  subClass: string;
  typeId: number; // 1..3 within sub-class
  type: string;
  subTypeId: number; // 1..2 within type
  subType: string;
  name: string;
  tier: number; // 1..10
  stats: Partial<Record<StatKey, number>>;
  subStats: Partial<Record<StatKey, number>>;
  energyCost: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  description: string;
}

const TYPE_NAMES = ['Coaxial', 'Phased', 'Overcharged'];
const SUB_TYPE_NAMES = ['Compact', 'Extended'];
const RARITIES: TechModule['rarity'][] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const PRIMARY_POOL: StatKey[] = ['attack', 'defense', 'shield', 'accuracy', 'evasion'];
const SUB_POOL: StatKey[] = ['critChance', 'critDamage', 'attackSpeed', 'armorPenetration', 'damageReduction', 'dodgeChance', 'cooldownReduction', 'poise', 'tenacity', 'shieldPower', 'hpRegen', 'moveSpeed'];

function hash(seed: number, offset: number): number {
  let h = (seed + offset * 0x9e3779b9) ^ (seed >>> 16);
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TECH_PREFIX = ['Tachyon', 'Ion', 'Plasma', 'Graviton', 'Quantum', 'Neutron', 'Zero-Point', 'Void', 'Astral', 'Chrono'];

export const GENERATE_TECH_ARCHIVE = (): TechModule[] => {
  const out: TechModule[] = [];
  let seed = 901;

  for (let c = 0; c < TECH_CLASSES.length; c++) {
    const techClass = TECH_CLASSES[c];
    for (let sc = 0; sc < 10; sc++) {
      const subClass = SUB_CLASSES[techClass][sc];
      // 3 types × 2 sub-types = 6 modules per sub-class → 9 × 10 × 6 = 540? No — cap to 90 total:
      // each class contributes 10 modules (one per sub-class), each with 2 type/sub-type variants folded in.
      for (let v = 0; v < 1; v++) {
        const r = (o: number) => hash(seed, o);
        seed += 17;

        const tier = sc + 1; // tier 1..10 within each class
        const typeIdx = sc % 3;
        const subTypeIdx = sc % 2;
        const prefix = TECH_PREFIX[Math.floor(r(1) * TECH_PREFIX.length)];
        const rarity = RARITIES[Math.min(RARITIES.length - 1, Math.floor(tier / 2) + (r(2) > 0.7 ? 1 : 0))];

        const primaryStat = PRIMARY_POOL[Math.floor(r(3) * PRIMARY_POOL.length)];
        const primaryValue = Math.round((40 + tier * 55) * (0.85 + r(4) * 0.35));

        const subA = SUB_POOL[Math.floor(r(5) * SUB_POOL.length)];
        let subB = SUB_POOL[Math.floor(r(6) * SUB_POOL.length)];
        if (subB === subA) subB = SUB_POOL[(SUB_POOL.indexOf(subA) + 1) % SUB_POOL.length];

        const pct = (v: number) => +(v).toFixed(3);
        const subStats: Partial<Record<StatKey, number>> = {
          [subA]: pct(tier * (0.004 + r(7) * 0.004)),
          [subB]: pct(tier * (1.5 + r(8) * 2.5)),
        };

        const name = `${prefix} ${subClass} ${TYPE_NAMES[typeIdx]} ${SUB_TYPE_NAMES[subTypeIdx]} Mk-${tier}`;
        const energyCost = Math.round(8 + tier * 7 * (0.8 + r(9) * 0.5));

        out.push({
          id: `tech_${out.length + 1}`,
          classId: c + 1,
          techClass,
          subClassId: sc + 1,
          subClass,
          typeId: typeIdx + 1,
          type: TYPE_NAMES[typeIdx],
          subTypeId: subTypeIdx + 1,
          subType: SUB_TYPE_NAMES[subTypeIdx],
          name,
          tier,
          stats: { [primaryStat]: primaryValue, energyCost },
          subStats,
          energyCost,
          rarity,
          description: `${techClass} module · Tier ${tier} · ${rarity}. Primary boost to ${STAT_LABELS[primaryStat]} (+${primaryValue}), with sub-stat scaling on ${STAT_LABELS[subA]} and ${STAT_LABELS[subB]}.`,
        });
      }
    }
  }
  return out;
};

export const TECH_ARCHIVE: TechModule[] = GENERATE_TECH_ARCHIVE();

export { STAT_LABELS };
