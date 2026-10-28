import type { GalaxyAndArcBoss } from './universeBoss90Data';

/** Procedurally completes the boss roster: 90 total bosses for Galaxies 1–90,
 *  of which every 9th galaxy boss is additionally flagged as a Multiverse Arc Boss.
 *  Deterministic — the same roster on every load. */

const BOSS_FIRST = ['Aegis', 'Infernal', 'Cryo', 'Void', 'Chrono', 'Solar', 'Quantum', 'Obsidian', 'Storm', 'Iron', 'Frost', 'Ember', 'Gravity', 'Spectral', 'Titan', 'Helix', 'Nyx', 'Orion', 'Vulcan', 'Zephyr', 'Runic', 'Solaris', 'Nether', 'Corvus', 'Lyra', 'Draken', 'Fenrir', 'Basilisk', 'Manticore', 'Serpent'];
const BOSS_SECOND = ['Sentinel', 'Leviathan', 'Dreadnought', 'Weaver', 'Herald', 'Maw', 'Warden', 'Colossus', 'Tyrant', 'Wraith', 'Sovereign', 'Monolith', 'Reaper', 'Behemoth', 'Prelate', 'Archon', 'Executioner', 'Warlord', 'Ascendant', 'Devourer'];
const EPITHETS = ['of the Riven Core', 'the Unmaker', 'of Galaxy\'s End', 'the Star-Eater', 'of the Ninth Gate', 'the Light-Devourer', 'of Falling Skies', 'the World-Breaker', 'of Silent Void', 'the Tide of Iron', 'of the Broken Shield', 'the Ash-Tongued', 'of Eternal Night', 'the Phase-Walker', 'of the Deep Grid'];
const WEAKNESS_CLASSES = [
  'Category I: Light Interceptors', 'Category II: Heavy Corvettes & Frigates', 'Category III: Strike Destroyers & Cruisers',
  'Category IV: Heavy Battleships & Dreadnoughts', 'Category V: Mobile Carrier Hubs & Motherships',
  'Category VI: Stealth Recon & Covert Ops', 'Category VII: Industrial & Resource Titans',
  'Category VIII: Orbital Defenses & Satellites', 'Category IX: Precursor & Super-Capital Flagships',
];
const RESISTANCE_POOL = ['Kinetic Flak', 'Thermal Plasma', 'Cryo Glacial', 'Dark Matter Waves', 'Temporal Displacement', 'Solar Beams', 'Void Filaments', 'Graviton Shear', 'Neutron Flux', 'Volcanic Thermal'];
const PHASE_NAMES = ['Barrier Vigil', 'Rampage Protocol', 'Singularity Stance', 'Cataclysm Rebirth', 'Final Apotheosis'];
const DIALOGUES = [
  'This galaxy is under eternal guard. Turn back.',
  'Your fleets are stardust waiting to scatter.',
  'I have devoured armadas mightier than yours.',
  'The void itself answers to my command.',
  'COME, COMMANDER. FEED THE DARK.',
  'Every shield I raise is forged from your failures.',
  'You dare disturb the deep grid? So be it.',
  'My hull has outlived ten civilizations.',
];
const ABILITY_TEMPLATES = [
  { name: 'Gauss Barrage', type: 'damage' as const, base: 35000, cd: 3, desc: 'High-velocity mass-driver salvo into the vanguard line.' },
  { name: 'Shield Siphon', type: 'shield_heal' as const, base: 40000, cd: 4, desc: 'Drains attacker shields to reconstruct the boss barrier.' },
  { name: 'Stasis Lock', type: 'debuff' as const, base: 30000, cd: 5, desc: 'Locks leading capital ships; shields cannot regenerate.' },
  { name: 'Swarm Echo', type: 'swarm_summon' as const, base: 60000, cd: 6, desc: 'Summons phantom escort wings of destroyed ships.' },
  { name: 'Annihilation Nova', type: 'ultimate_annihilation' as const, base: 300000, cd: 9, desc: 'Universe-wide collapse blast against all battle lines.' },
];

function hash(seed: number, offset: number): number {
  let h = (seed + offset * 0x9e3779b9) ^ (seed >>> 16);
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Build a single procedural boss for a galaxy. */
function buildGalaxyBoss(galaxyId: number): GalaxyAndArcBoss {
  const r = (o: number) => hash(galaxyId * 7919, o);
  const isArc = galaxyId % 9 === 0; // 10 arc bosses across the 90 galaxies
  const arcNumber = isArc ? galaxyId / 9 : undefined;

  // Level scales 50 → 90 across the 90 galaxies
  const level = Math.round(50 + (galaxyId - 1) * (40 / 89));

  // Difficulty scaling — arc bosses are dramatically stronger
  const arcMult = isArc ? 6 : 1;
  const scale = 1 + (level - 50) / 40; // 1.0 → 2.0
  const maxHealth = Math.round((3_000_000 + r(1) * 2_000_000) * scale * arcMult);
  const maxShield = Math.round(maxHealth * (0.55 + r(2) * 0.25));
  const armor = Math.round((3500 + r(3) * 3000) * (isArc ? 2.2 : 1));
  const attackPower = Math.round((30000 + r(4) * 25000) * scale * (isArc ? 2.5 : 1));

  const first = BOSS_FIRST[Math.floor(r(5) * BOSS_FIRST.length)];
  const second = BOSS_SECOND[Math.floor(r(6) * BOSS_SECOND.length)];
  const epithet = EPITHETS[Math.floor(r(7) * EPITHETS.length)];
  const name = `${first} ${second} ${isArc ? 'Prime' : ''}`.trim();
  const title = isArc
    ? `Arc Boss #${arcNumber} · Multiverse Titan of Galaxy ${String(galaxyId).padStart(2, '0')}`
    : `Galaxy Boss · Galaxy ${String(galaxyId).padStart(2, '0')} Guardian`;

  // Phase plan: galaxy bosses get 2 phases, arc bosses get 4
  const thresholds = isArc ? [100, 65, 35, 15] : [100, 45];
  const phases = thresholds.map((threshold, idx) => ({
    phaseNumber: idx + 1,
    healthThresholdPercent: threshold,
    phaseName: PHASE_NAMES[idx % PHASE_NAMES.length],
    shieldMultiplier: +(1.8 - idx * 0.35).toFixed(2),
    bonusAttackMultiplier: +(1 + idx * 0.45).toFixed(2),
    unlockedAbilities: [`ability_g${galaxyId}_core`],
    dialogue: DIALOGUES[Math.floor(r(8 + idx) * DIALOGUES.length)],
  }));

  const abilityCount = isArc ? 5 : 2 + Math.floor(r(9) * 2); // arc: all 5, galaxy: 2–3
  const abilities = ABILITY_TEMPLATES.slice(0, abilityCount).map((tpl, idx) => ({
    id: `ability_g${galaxyId}_${idx + 1}`,
    name: `${first} ${tpl.name}`,
    type: tpl.type,
    power: Math.round(tpl.base * scale * (isArc ? 2.5 : 1) * (0.9 + r(10 + idx) * 0.3)),
    cooldownTicks: tpl.cd,
    description: tpl.desc,
  }));

  const lootMult = scale * arcMult;
  return {
    id: `galaxy_boss_g${galaxyId}`,
    name,
    title,
    type: isArc ? 'arc_boss' : 'galaxy_boss',
    universeId: ((galaxyId - 1) % 30) + 1,
    galaxyId,
    ...(arcNumber !== undefined ? { arcNumber } : {}),
    level,
    maxHealth,
    maxShield,
    armor,
    attackPower,
    enrageTicks: isArc ? 22 : 28 + Math.floor(r(11) * 6),
    weaknessClass: WEAKNESS_CLASSES[Math.floor(r(12) * WEAKNESS_CLASSES.length)],
    resistanceTypes: [RESISTANCE_POOL[Math.floor(r(13) * RESISTANCE_POOL.length)], RESISTANCE_POOL[Math.floor(r(14) * RESISTANCE_POOL.length)]],
    phases,
    abilities,
    loot: {
      metal: Math.round(8_000_000 * lootMult * (0.8 + r(15) * 0.5)),
      crystal: Math.round(5_000_000 * lootMult * (0.8 + r(16) * 0.5)),
      deuterium: Math.round(2_500_000 * lootMult * (0.8 + r(17) * 0.5)),
      darkMatter: Math.round(40_000 * lootMult * (0.8 + r(18) * 0.5)),
      precursorArtifacts: isArc ? 12 + Math.floor(r(19) * 10) : 3 + Math.floor(r(19) * 6),
      schematicDrop: `Class-${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][(galaxyId - 1) % 10]} ${first} Schematic`,
    },
    description: isArc
      ? `A multiverse-scale titan anchoring Arc ${arcNumber} of the campaign. Guards the heart of Galaxy ${galaxyId}; its fall reshapes the sector.`
      : `Automated sector guardian holding Galaxy ${galaxyId}. Level ${level} threat with layered shield phases.`,
  };
}

/** Full roster: 90 bosses, including the 10 arc bosses (galaxies 9, 18, 27, …, 90).
 *  The three hand-authored bosses from GALAXY_AND_ARC_BOSSES for g1/g12/g42 keep
 *  their authored names — procedural entries fill the remaining galaxies. */
export const GENERATE_BOSS_ROSTER = (authored: GalaxyAndArcBoss[]): GalaxyAndArcBoss[] => {
  const authoredGalaxies = new Set(authored.map((b) => b.galaxyId));
  const roster: GalaxyAndArcBoss[] = [...authored];
  for (let g = 1; g <= 90; g++) {
    if (!authoredGalaxies.has(g)) roster.push(buildGalaxyBoss(g));
  }
  return roster.sort((a, b) => a.galaxyId - b.galaxyId);
};
