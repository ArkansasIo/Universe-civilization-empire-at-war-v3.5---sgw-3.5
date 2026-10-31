// Card art for catalog items lives in public/images/game/<kind>/<id>.webp.
// Resolved by id so it also works for state restored from localStorage.

export type GameImageKind = 'ships' | 'buildings' | 'research' | 'defenses' | 'megastructures' | 'resources';

const AVAILABLE: Record<GameImageKind, ReadonlySet<string>> = {
  ships: new Set([
    'small_cargo', 'large_cargo', 'colony_ship', 'recycler', 'espionage_probe', 'light_fighter', 'heavy_fighter',
    'cruiser', 'battleship', 'battlecruiser', 'fleet_carrier', 'dreadnought', 'titan_flagship',
  ]),
  buildings: new Set([
    'metal_mine', 'crystal_mine', 'deuterium_synthesizer', 'solar_plant', 'fusion_reactor', 'robotics_factory',
    'nanite_factory', 'shipyard_facility', 'research_lab',
  ]),
  research: new Set([
    'basic_engineering', 'mineral_processing', 'deep_core_mining', 'asteroid_mining', 'energy_science', 'solar_energy',
    'fusion_energy', 'antimatter_tech', 'zero_point_energy', 'computer_technology', 'quantum_computing',
    'artificial_intelligence', 'chemical_propulsion', 'ion_propulsion', 'hyperspace_drive', 'dimensional_propulsion',
    'kinetic_weapons', 'laser_technology', 'plasma_technology', 'shield_technology', 'armor_technology',
    'phase_shields', 'espionage_technology', 'astrophysics', 'stellar_engineering',
  ]),
  defenses: new Set([
    'rocket_launcher', 'light_laser', 'heavy_laser', 'gauss_cannon', 'plasma_turret', 'small_shield_dome',
    'large_shield_dome',
  ]),
  megastructures: new Set(['dyson_swarm', 'orbital_ring', 'galactic_gateway']),
  resources: new Set(['naquadah', 'metal', 'crystal', 'deuterium', 'energy', 'darkMatter']),
};

// Interface art (title screen, backgrounds, section banners, race portraits)
// lives in public/images/ui-art/.
export function getUiArt(name: string): string {
  return `${import.meta.env.BASE_URL}images/ui-art/${name}.webp`;
}

export function getGameImage(kind: GameImageKind, id: string): string | undefined {
  if (!AVAILABLE[kind].has(id)) return undefined;
  return `${import.meta.env.BASE_URL}images/game/${kind}/${id}.webp`;
}

// Menu button icons in public/images/ui-art/buttons: painted WebP where made, vector SVG otherwise.
const NAV_ICONS_PAINTED: ReadonlySet<string> = new Set(['civilization', 'codex-doc', 'dashboard', 'government-system', 'missions', 'resources']);
const NAV_ICONS_VECTOR: ReadonlySet<string> = new Set(['academy-drills', 'academy-enlistment', 'academy-wings', 'account-profiles', 'account-settings', 'add-worlds-bosses', 'admin-bans', 'admin-cheats', 'admin-crown', 'admin-dashboard', 'admin-debris', 'admin-empire-history', 'admin-events', 'admin-fleets', 'admin-maintenance', 'admin-operations', 'admin-planets', 'admin-security', 'admin-tickets', 'admin-universe', 'admin-users', 'aic-system', 'alliances', 'armors', 'ascension', 'attack-log', 'bank-vault', 'colonial-plunge', 'commander-gacha', 'commander-hq', 'construction-yard', 'cron-cli', 'cron-jobs', 'defenses', 'diplomacy', 'enemy-intelligence', 'eve-blueprints', 'expeditions', 'exploration', 'factories', 'galactic-news', 'gate-tokens', 'hazards', 'hyperspace-systems', 'income', 'intel-codex', 'life-support', 'master-upgrades', 'megastructures', 'mercenary-market', 'messages', 'military-stats', 'miners', 'mmorpg-ogame', 'modules', 'moon-bases', 'nemesis-system', 'planet-bonuses', 'planet-defenses', 'planet-list', 'planet-power', 'player-profile', 'population', 'power-grid', 'race', 'rankings', 'repair', 'resource-exchange', 'sabotage', 'shields', 'ship-fitting', 'ship', 'shipyard', 'space-stations', 'spy-log', 'spy', 'stargate-network', 'stargate-npc-races', 'stargate-relics', 'stargate-system-lords', 'stash-vaults', 'stellar-encyclopedia', 'storage-upgrades', 'store-battlepass', 'super-units', 'targets', 'tech-anti-covert', 'tech-archive', 'tech-covert', 'tech-defense', 'tech-library', 'tech-offense', 'tech-tree', 'tempering-forge', 'turn-system', 'unit-production', 'unit-roster-90', 'units', 'universe', 'vacation', 'weapon-market', 'weapons', 'workforce-academy', 'workforce-roster']);

export function getNavIcon(route: string): string | undefined {
  const ext = NAV_ICONS_PAINTED.has(route) ? 'webp' : NAV_ICONS_VECTOR.has(route) ? 'svg' : undefined;
  return ext && `${import.meta.env.BASE_URL}images/ui-art/buttons/${route}.${ext}`;
}
