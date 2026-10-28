import type { EveBlueprint } from '../blueprintSystemsData';

/** Procedurally expands to exactly 140 constructible blueprints across the
 *  10 imperial ship categories (14 per category), tiered 1–10. */

export type BlueprintCategory =
  | 'Light Interceptor'
  | 'Heavy Corvette & Frigate'
  | 'Strike Destroyer & Cruiser'
  | 'Battleship & Dreadnought'
  | 'Carrier Hub & Mothership'
  | 'Stealth Recon & Covert Ops'
  | 'Industrial & Resource Titan'
  | 'Orbital Defense & Satellite'
  | 'Precursor & Super-Capital'
  | 'Cosmic Arc Titan';

export interface YardBlueprint extends EveBlueprint {
  category: BlueprintCategory;
  tier: number; // 1..10
  description: string;
}

export const BLUEPRINT_CATEGORIES: BlueprintCategory[] = [
  'Light Interceptor',
  'Heavy Corvette & Frigate',
  'Strike Destroyer & Cruiser',
  'Battleship & Dreadnought',
  'Carrier Hub & Mothership',
  'Stealth Recon & Covert Ops',
  'Industrial & Resource Titan',
  'Orbital Defense & Satellite',
  'Precursor & Super-Capital',
  'Cosmic Arc Titan',
];

const CATEGORY_KIND: Record<BlueprintCategory, EveBlueprint['type']> = {
  'Light Interceptor': 'drone',
  'Heavy Corvette & Frigate': 'ship',
  'Strike Destroyer & Cruiser': 'ship',
  'Battleship & Dreadnought': 'ship',
  'Carrier Hub & Mothership': 'ship',
  'Stealth Recon & Covert Ops': 'drone',
  'Industrial & Resource Titan': 'ship',
  'Orbital Defense & Satellite': 'module',
  'Precursor & Super-Capital': 'ship',
  'Cosmic Arc Titan': 'ship',
};

const HULL_NAMES: Record<BlueprintCategory, string[]> = {
  'Light Interceptor': ['Viper Scout', 'Dart Striker', 'Sting Swarm', 'Hornet Ace', 'Wasp Disruptor', 'Falcon Skimmer', 'Hawk Railer', 'Kestrel Tachyon', 'Swift Strafer', 'Talon Hunter', 'Mosquito Creeper', 'Raptor Vanguard', 'Serpent Flanker', 'Wyvern Squall'],
  'Heavy Corvette & Frigate': ['Gladiator Rail', 'Sentinel Flak', 'Bulwark Screen', 'Aegis Interdictor', 'Warden Picket', 'Centurion Lance', 'Phalanx Escort', 'Prestor Frigate', 'Trebuchet Slinger', 'Palisade Warden', 'Lorica Blockade', 'Scutum Bastion', 'Vexillum Herald', 'Pilum Skewer'],
  'Strike Destroyer & Cruiser': ['Manticore Torpedo', 'Hydra Battery', 'Chimera Interdictor', 'Basilisk Hunter', 'Cyclops Lance', 'Cerberus Pack', 'Griffin Storm', 'Sphinx Riddler', 'Minotaur Rampage', 'Kraken Tide', 'Leviathan Hammer', 'Nautilus Dive', 'Triton Trumpet', 'Proteus Shift'],
  'Battleship & Dreadnought': ['Imperator Siege', 'Colossus Array', 'Tyrant Maw', 'Sovereign Vanguard', 'Dominus Order', 'Regal Basilica', 'Grand Marshal', 'Archon Decree', 'Praetor Wall', 'Dictator Term', 'Rex Crown', 'Kaiser Iron', 'Autocrat Chain', 'Monarch Sun'],
  'Carrier Hub & Mothership': ['Ark Nexus', 'Hive Hangar', 'Roost Aerie', 'Nest Broodmother', 'Ferry Waystation', 'Bridge Overlord', 'Gate Warden', 'Dock Warden', 'Port Sovereign', 'Harbor Sentinel', 'Slipway Foreman', 'Berth Keeper', 'Quay Master', 'Wharf Director'],
  'Stealth Recon & Covert Ops': ['Wraith Veil', 'Shade Stalker', 'Umbra Phantom', 'Nocturne Whisper', 'Eclipse Ghost', 'Specter Wisp', 'Mirage Deceiver', 'Phantasm Drifter', 'Silhouette Fader', 'Shadow Broker', 'Twilight Skulker', 'Dusk Infiltrator', 'Obsidian Eye', 'Null Whisperer'],
  'Industrial & Resource Titan': ['Foundry Colossus', 'Smelter Behemoth', 'Refinery Monarch', 'Quarry Giant', 'Excavator Prime', 'Drill Sovereign', 'Loader Dominus', 'Hauler Supreme', 'Mill Overlord', 'Forge Titan', 'Crucible Master', 'Anvil Overseer', 'Gantry Herald', 'Silo Warden'],
  'Orbital Defense & Satellite': ['Ion Bastion', 'Laser Sentinel', 'Missile Citadel', 'Flak Dome', 'Rail Aegis', 'Beam Watchtower', 'Grid Warden', 'Orbital Bulwark', 'Planetary Saber', 'Horizon Lens', 'Skyfall Battery', 'Zenith Cannon', 'Apex Aperture', 'Vigil Spire'],
  'Precursor & Super-Capital': ['Ancient Monolith', 'Wrath Obelisk', 'Elder Reliquary', 'Precursor Aegis', 'First One Ark', 'Titan Relic', 'Vault Keeper', 'Ether Sentinel', 'Primeval Colossus', 'Timeworn Citadel', 'Sacred Lattice', 'Archaic Bulwark', 'Progenitor Vault', 'Primordial Anchor'],
  'Cosmic Arc Titan': ['Eternity Apex', 'Event Horizon Sovereign', 'Multiverse Overlord', 'Chrono Zero Titan', 'Void Ascendant', 'Reality Sculptor', 'Cosmic Genesis', 'Nebula Incarnate', 'Quasar Regent', 'Pulsar Crown', 'Galaxy Prime Mover', 'Star Weaver', 'Dimension Sovereign', 'Omega Absolute'],
};

const WEAPON_POOL = [
  'Dual Light Pulse Lasers', 'Superheated Plasma Cannon', 'Micro-Swarm Missiles', 'High-Velocity Autocannons',
  'EMP Pulse Cannon', 'Long-Range Optical Laser', 'Gauss Micro-Railguns', 'Tachyon Beam Emitter',
  'Heavy Thermite Cluster Bombs', 'Twin-Linked Heavy Railguns', 'Rotary Point-Defense Flak', 'Heavy Antimatter Torpedoes',
  'Quad Orbital Beam Array', 'Singularity Disruption Cannon', 'Multiverse Annihilation Cannon',
];

const ABILITY_POOL = [
  { name: 'Evasion Afterburner', effect: '+25% Dodge Chance vs Heavy Lasers' },
  { name: 'Plasma Burn', effect: 'Deals 10% thermal damage over 3 seconds' },
  { name: 'Swarm Overwhelm', effect: '+15% Crit Rate against single targets' },
  { name: 'Dogfight Ace', effect: '+40% Rapid Fire vs Light Fighters' },
  { name: 'Ion Disruption', effect: 'Drains 50 Shield Points per shot' },
  { name: 'Sensor Array Sweep', effect: 'Reveals cloaked fleet compositions' },
  { name: 'Hyper-Velocity Surge', effect: 'First strike attacks deal +30% damage' },
  { name: 'Tachyon Phase-Shift', effect: '30% chance to ignore incoming attack' },
  { name: 'Orbital Bombardment', effect: '+50% damage against planetary defense turrets' },
  { name: 'Vanguard Wall', effect: 'Absorbs 15% damage intended for allied fighters' },
  { name: 'Flak Screen', effect: 'Destroys incoming torpedoes and drone swarms' },
  { name: 'Imperator Aura', effect: '+10% attack power to all allied ships in fleet' },
  { name: 'Precursor Aegis', effect: 'Generates 5,000 shield points per round' },
  { name: 'Cosmic Reality Erasure', effect: 'Instantly vaporizes target enemy fleet stack' },
];

function hash(seed: number, offset: number): number {
  let h = (seed + offset * 0x9e3779b9) ^ (seed >>> 16);
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Deterministic expansion — the same 140 blueprints on every load. */
export const GENERATE_YARD_BLUEPRINTS = (): YardBlueprint[] => {
  const out: YardBlueprint[] = [];
  let seed = 1;
  for (const category of BLUEPRINT_CATEGORIES) {
    const names = HULL_NAMES[category];
    const kind = CATEGORY_KIND[category];
    for (let i = 0; i < 14; i++) {
      const tier = i + 1; // tier 1..14 capped at 10
      const displayTier = Math.min(10, tier);
      const r = (o: number) => hash(seed, o);
      seed += 17;

      const isOriginal = r(11) > 0.25; // 75% originals
      const materialEfficiency = Math.floor(r(12) * 11); // 0..10
      const timeEfficiency = Math.floor(r(13) * 21); // 0..20
      const baseMetal = Math.round((3000 + displayTier * 9500) * (0.85 + r(14) * 0.4));
      const baseCrystal = Math.round(baseMetal * (0.5 + r(15) * 0.2));
      const baseDeuterium = Math.round(baseMetal * (0.2 + r(16) * 0.15));
      const baseSeconds = Math.round(120 + displayTier * 90 * (0.8 + r(17) * 0.5));
      const ability = ABILITY_POOL[(seed + i) % ABILITY_POOL.length];
      const weapon = WEAPON_POOL[(seed * 3 + i) % WEAPON_POOL.length];

      out.push({
        id: `yard_bp_${out.length + 1}`,
        name: `${names[i]} Mk-${displayTier}`,
        type: kind,
        category,
        tier: displayTier,
        description: `${category} hull blueprint · Tier ${displayTier} · Armament: ${weapon} · Special: ${ability.name} (${ability.effect})`,
        materialEfficiency,
        timeEfficiency,
        runsRemaining: isOriginal ? Infinity : 5 + Math.floor(r(18) * 20),
        isOriginal,
        researchingType: 'none',
        researchRemainingSeconds: 0,
        baseBuildCost: { metal: baseMetal, crystal: baseCrystal, deuterium: baseDeuterium },
        baseBuildTimeSeconds: baseSeconds,
      });
    }
  }
  return out;
};

export const YARD_BLUEPRINTS: YardBlueprint[] = GENERATE_YARD_BLUEPRINTS();
