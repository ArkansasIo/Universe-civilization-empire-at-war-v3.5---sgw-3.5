// Card art for catalog items lives in public/images/game/<kind>/<id>.webp.
// Resolved by id so it also works for state restored from localStorage.

export type GameImageKind = 'ships' | 'buildings' | 'research' | 'defenses' | 'megastructures' | 'resources' | 'planets';

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
  // Procedurally rendered by scripts/art/planets.py, one per galaxy-view biome.
  planets: new Set([
    'terrestrial', 'desert', 'ice', 'volcanic', 'ocean', 'gas_giant', 'jungle', 'tomb_world', 'metallic',
    'crystalline',
  ]),
};

// Galaxy banners, rendered by scripts/art/galaxies.py: 6 types x 3 colour variants.
const GALAXY_TYPES = new Set(['spiral', 'barred_spiral', 'elliptical', 'ring_cluster', 'irregular_rift', 'dwarf_nebula']);

// Galaxy type ("Barred Spiral") + number -> banner art; the number picks one of 3 variants.
export function getGalaxyImage(galaxyType: string, galaxyNumber: number): string | undefined {
  const slug = galaxyType.toLowerCase().replace(/\s+/g, '_');
  if (!GALAXY_TYPES.has(slug)) return undefined;
  const variant = ((Math.max(1, galaxyNumber) - 1) % 3) + 1;
  return `${import.meta.env.BASE_URL}images/game/galaxies/${slug}_${variant}.webp`;
}

// Galaxy-view biome name ("Gas Giant") -> planet art id ("gas_giant").
export function getPlanetImage(biome: string): string | undefined {
  return getGameImage('planets', biome.toLowerCase().replace(/\s+/g, '_'));
}

// Interface art (title screen, backgrounds, section banners, race portraits)
// lives in public/images/ui-art/.
export function getUiArt(name: string): string {
  return `${import.meta.env.BASE_URL}images/ui-art/${name}.webp`;
}

export function getGameImage(kind: GameImageKind, id: string): string | undefined {
  if (!AVAILABLE[kind].has(id)) return undefined;
  return `${import.meta.env.BASE_URL}images/game/${kind}/${id}.webp`;
}
