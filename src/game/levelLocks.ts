/**
 * Commander level locks: the single table mapping every player-facing route to
 * the commander level that unlocks it, plus the XP curve that produces levels.
 *
 * The sidebar, the App route guard, the story campaign and the shared feature
 * registry in `progression.ts` all read from this table. Admin routes are not
 * listed here; they stay behind the administrator check instead.
 */

export type LevelLockTier =
  | 'foundation'
  | 'industry'
  | 'military'
  | 'expansion'
  | 'diplomacy'
  | 'gateway'
  | 'ascendant';

export interface RouteLevelLock {
  route: string;
  label: string;
  level: number;
  tier: LevelLockTier;
}

const lock = (route: string, label: string, level: number, tier: LevelLockTier): RouteLevelLock => ({
  route,
  label,
  level,
  tier,
});

export const ROUTE_LEVEL_LOCKS: readonly RouteLevelLock[] = [
  // Level 1 — the colony, its stockpiles and the commander's own records.
  lock('dashboard', 'Empire Overview', 1, 'foundation'),
  lock('missions', 'Missions & Chapter Quests', 1, 'foundation'),
  lock('codex-doc', 'Strategic Codex & GDD', 1, 'foundation'),
  lock('civilization', 'Civilization & Population', 1, 'foundation'),
  lock('resources', 'Resource Vault & Reserves', 1, 'foundation'),
  lock('stash-vaults', 'Protected, Inventory & Equipment Stash', 1, 'foundation'),
  lock('income', 'Resource Income & Mines', 1, 'foundation'),
  lock('messages', 'Communications & Messages', 1, 'foundation'),
  lock('galactic-news', 'Holonet News Network', 1, 'foundation'),
  lock('rankings', 'Galactic Leaderboards', 1, 'foundation'),
  lock('player-profile', 'Sovereign Realm Dossier', 1, 'foundation'),
  lock('account', 'Account', 1, 'foundation'),
  lock('account-info', 'Account Info', 1, 'foundation'),
  lock('account-settings', 'Account Settings', 1, 'foundation'),
  lock('account-profiles', 'Multi-Account Profiles', 1, 'foundation'),
  lock('race', 'Race & Government Faction', 1, 'foundation'),
  lock('vacation', 'Sanctuary / Vacation Shield', 1, 'foundation'),
  lock('store-battlepass', 'Store & Battle Pass', 1, 'foundation'),
  lock('dev-credits', 'Development Credits', 1, 'foundation'),

  // Levels 2-4 — industry: construction, power, research, workforce, trade.
  lock('construction-yard', 'Construction Yard', 2, 'industry'),
  lock('storage-upgrades', 'Storage Silos & Warehouses', 2, 'industry'),
  lock('power-grid', 'Power Grid & Energy Network', 2, 'industry'),
  lock('factories', 'Mines & Nanite Factories', 2, 'industry'),
  lock('tech-tree', 'Master Tech Tree', 2, 'industry'),
  lock('tech-library', 'Research Lab Facilities', 3, 'industry'),
  lock('population', 'Population & Rationing', 3, 'industry'),
  lock('life-support', 'Food & Water Life Support', 3, 'industry'),
  lock('workforce-academy', 'Workforce & Academy Hub', 3, 'industry'),
  lock('government-system', 'Government Systems', 4, 'industry'),
  lock('aic-system', 'Automated Industry (AIC)', 4, 'industry'),
  lock('academy-enlistment', 'Enlistment Terminal', 4, 'industry'),
  lock('workforce-roster', '90-Role Imperial Roster', 4, 'industry'),
  lock('resource-exchange', 'Resource Exchange Market', 4, 'industry'),
  lock('bank-vault', 'Imperial Bank & Vault', 4, 'industry'),

  // Levels 3-8 — military: shipyard, defenses, fleets, espionage.
  lock('shipyard', 'Orbital Shipyard Drydocks', 3, 'military'),
  lock('unit-production', 'Ship Production Lines', 5, 'military'),
  lock('miners', 'Industrial Miners & Transports', 5, 'military'),
  lock('defenses', 'Planetary Defense Grid', 5, 'military'),
  lock('shields', 'Shield Domes & Deflectors', 5, 'military'),
  lock('weapons', 'Ground Defense Batteries', 5, 'military'),
  lock('armors', 'Hardened Fortifications', 5, 'military'),
  lock('tempering-forge', 'Forge & Masterworks Anvil', 5, 'military'),
  lock('units', 'Fleet Combat Units', 6, 'military'),
  lock('targets', 'Fleet Dispatch & Targets', 6, 'military'),
  lock('attack-log', 'Combat Reports & Attack Log', 6, 'military'),
  lock('military-stats', 'Military Fleet Scores', 6, 'military'),
  lock('tech-offense', 'Weapons Technology', 6, 'military'),
  lock('tech-defense', 'Shield & Armor Tech', 6, 'military'),
  lock('spy', 'Espionage Probes & Scans', 7, 'military'),
  lock('spy-log', 'Espionage Reports & Intercepts', 7, 'military'),
  lock('tech-covert', 'Covert Espionage Tech', 7, 'military'),
  lock('tech-anti-covert', 'Anti-Covert Counter-Sensors', 7, 'military'),
  lock('weapon-market', 'Procurement Catalog', 7, 'military'),
  lock('academy-wings', '6 Specialized Wings', 7, 'military'),
  lock('academy-drills', 'Readiness Drills & Auto-Draft', 7, 'military'),
  lock('unit-roster-90', '90-Class Unit & Ship Roster', 8, 'military'),
  lock('ship-fitting', 'Ship Fitting & 6-Type Armor', 8, 'military'),

  // Levels 6-10 — expansion: colonies, moons, expeditions, the wider map.
  lock('planet-list', 'Colonial World Nexus', 6, 'expansion'),
  lock('planet-bonuses', 'All Worlds Comparison Matrix', 6, 'expansion'),
  lock('hazards', 'Planetary Hazards', 7, 'expansion'),
  lock('planet-power', 'Colonial Power Grid', 8, 'expansion'),
  lock('planet-defenses', 'Colonial Defenses Grid', 8, 'expansion'),
  lock('moon-bases', 'Moon Bases & Sensor Phalanx', 8, 'expansion'),
  lock('expeditions', 'Deep Space Expeditions', 8, 'expansion'),
  lock('colonial-plunge', 'Colonial Plunge System', 8, 'expansion'),
  lock('plunge', 'Colonial Plunge', 8, 'expansion'),
  lock('stellar-encyclopedia', 'A-Z Planetary Encyclopedia', 8, 'expansion'),
  lock('master-upgrades', 'Master Facilities Hub', 10, 'expansion'),
  lock('eve-blueprints', 'Blueprints and Research Lab', 10, 'expansion'),
  lock('tech-archive', 'Galactic Technology Archive', 10, 'expansion'),
  lock('sabotage', 'Covert Sabotage Ops', 10, 'expansion'),
  lock('enemy-intelligence', 'Enemy Intelligence Dossier', 10, 'expansion'),
  lock('intel-codex', 'Strategic Intel Codex', 10, 'expansion'),
  lock('mercenary-market', 'Mercenary Guild Market', 10, 'expansion'),
  lock('repair', 'Alliance Depot & Repair', 10, 'expansion'),
  lock('commander-hq', 'Commander HQ & Officers', 10, 'expansion'),

  // Levels 12-14 — diplomacy and the gate network.
  lock('stargate-network', 'Transit Gates & Jump Relays', 12, 'gateway'),
  lock('gate-tokens', 'Gate Tokens & Anomalies', 12, 'gateway'),
  lock('exploration', 'Deep Space Reconnaissance', 12, 'gateway'),
  lock('diplomacy', 'Diplomacy & Treaties', 12, 'diplomacy'),
  lock('alliances', 'Alliance Headquarters', 12, 'diplomacy'),
  lock('mmorpg-ogame', 'Guilds, Raids & Adventures', 14, 'diplomacy'),
  lock('space-stations', 'Orbital Starbases', 14, 'gateway'),
  lock('stargate-npc-races', 'Alien Races', 14, 'gateway'),
  lock('commander-gacha', 'Seasonal Commander Roster', 14, 'diplomacy'),

  // Levels 16-30 — ascendant: capital ships, warlords, megastructures, multiverse.
  lock('stargate-relics', 'Relics & Ancient Artifacts', 16, 'ascendant'),
  lock('hyperspace-systems', 'Hyperspace & Motherships', 16, 'ascendant'),
  lock('ship', 'Mothership Nexus Overview', 16, 'ascendant'),
  lock('modules', 'Mothership Modular Subsystems', 16, 'ascendant'),
  lock('super-units', 'Titan & Flagship Vessels', 16, 'ascendant'),
  lock('planetary-invasion', 'Planetary Invasion', 16, 'ascendant'),
  lock('stargate-system-lords', 'System Lords & PvE Raids', 18, 'ascendant'),
  lock('nemesis-system', 'Nemesis Warlord System', 18, 'ascendant'),
  lock('add-worlds-bosses', 'Galaxy & Arc Bosses', 18, 'ascendant'),
  lock('megastructures', 'Stellar Megastructures', 20, 'ascendant'),
  lock('nms-universe', 'Procedural Universe Explorer', 22, 'ascendant'),
  lock('universe', '30 Universes & 90 Galaxies', 24, 'ascendant'),
  lock('ascension', 'Ascension Chamber', 30, 'ascendant'),
];

/** Routes that are never level-locked because they sit behind the admin check. */
export const ADMIN_ONLY_ROUTES: readonly string[] = [
  'admin-dashboard',
  'admin-crown',
  'admin-empire-history',
  'empire-history',
  'admin-universe',
  'admin-users',
  'admin-bans',
  'admin-planets',
  'admin-fleets',
  'admin-debris',
  'admin-tickets',
  'admin-security',
  'admin-events',
  'admin-cheats',
  'admin-operations',
  'admin-maintenance',
  'cron-jobs',
  'cron-logs',
  'cron-cli',
  'turn-system',
];

export const MAX_COMMANDER_LEVEL = 50;

/** Commander XP for each turn the player settles manually (on top of glory earned). */
export const COMMANDER_XP_PER_TURN = 20;

const LOCKS_BY_ROUTE = new Map(ROUTE_LEVEL_LOCKS.map((entry) => [entry.route, entry]));

export function getRouteLevelLock(route: string): RouteLevelLock | undefined {
  return LOCKS_BY_ROUTE.get(route);
}

/** Commander level required for a route. Unknown routes default to level 1. */
export function getRouteUnlockLevel(route: string): number {
  return LOCKS_BY_ROUTE.get(route)?.level ?? 1;
}

export function isRouteUnlocked(route: string, commanderLevel: number, isAdmin = false): boolean {
  return isAdmin || commanderLevel >= getRouteUnlockLevel(route);
}

/** Routes that open exactly at the given level. */
export function getRoutesUnlockedAtLevel(level: number): RouteLevelLock[] {
  return ROUTE_LEVEL_LOCKS.filter((entry) => entry.level === level);
}

/** Every distinct level at which at least one route opens, ascending. */
export function getUnlockMilestoneLevels(): number[] {
  return [...new Set(ROUTE_LEVEL_LOCKS.map((entry) => entry.level))].sort((a, b) => a - b);
}

/** Total commander XP needed to reach a level (level 1 needs 0). */
export function xpForCommanderLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(150 * Math.pow(level - 1, 1.8));
}

export function commanderLevelFromXp(xp: number): number {
  let level = 1;
  while (level < MAX_COMMANDER_LEVEL && xp >= xpForCommanderLevel(level + 1)) level += 1;
  return level;
}

export interface CommanderLevelProgress {
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
  /** 0-1 progress through the current level. */
  fraction: number;
}

export function getCommanderLevelProgress(xp: number): CommanderLevelProgress {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  const level = commanderLevelFromXp(safeXp);
  const currentLevelXp = xpForCommanderLevel(level);
  const nextLevelXp = level >= MAX_COMMANDER_LEVEL ? null : xpForCommanderLevel(level + 1);
  const fraction = nextLevelXp === null ? 1 : (safeXp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  return { level, xp: safeXp, currentLevelXp, nextLevelXp, fraction };
}
