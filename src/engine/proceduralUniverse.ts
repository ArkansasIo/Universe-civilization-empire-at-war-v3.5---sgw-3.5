/**
 * Seeded procedural universe generation for Universe: Civilization — Empire at War.
 *
 * Pure TypeScript: no browser APIs or runtime dependencies. A seed and a config
 * deterministically produce the same universe, suitable for client previews and
 * authoritative server generation. Persist the seed + generatorVersion so worlds
 * can be reconstructed after deployments.
 */

export type GalaxyShape = "spiral" | "barred-spiral" | "elliptical" | "ring" | "irregular" | "nebula";
export type StarClass = "O" | "B" | "A" | "F" | "G" | "K" | "M" | "X";
export type PlanetBiome =
  | "terran" | "oceanic" | "desert" | "tundra" | "volcanic" | "jungle"
  | "toxic" | "barren" | "ice" | "crystalline" | "radiated" | "shattered";
export type ResourceType = "naquadah" | "metal" | "crystal" | "deuterium" | "dark-matter";
export type AnomalyType = "ancient-ruins" | "wormhole" | "derelict-fleet" | "precursor-beacon" | "spatial-rift" | "resource-rich-nebula";
export type FactionArchetype = "industrial" | "scientific" | "military" | "exploration" | "ancient" | "raider";

export interface UniverseGenerationConfig {
  /** Stable numeric or string seed. */
  seed: number | string;
  /** Generator schema version; change only when generated outputs intentionally change. */
  generatorVersion?: number;
  universeName?: string;
  galaxyCount?: number;
  systemsPerGalaxy?: number;
  minPlanetsPerSystem?: number;
  maxPlanetsPerSystem?: number;
  factionCount?: number;
  /** Coordinate-space radius for each galaxy. */
  galaxyRadius?: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ResourceDeposit {
  type: ResourceType;
  abundance: number; // 0..100
  richness: "trace" | "low" | "moderate" | "high" | "exceptional";
}

export interface GeneratedPlanet {
  id: string;
  index: number;
  name: string;
  biome: PlanetBiome;
  habitability: number; // 0..100
  sizeClass: "small" | "standard" | "large" | "super";
  orbitalDistance: number;
  populationCapacity: number;
  resources: ResourceDeposit[];
  hasStargate: boolean;
  isHomeworld: boolean;
}

export interface GeneratedStarSystem {
  id: string;
  index: number;
  name: string;
  position: Vec3;
  starClass: StarClass;
  starTemperatureKelvin: number;
  dangerLevel: number; // 0..9; game difficulty contract
  controllingFactionId: string | null;
  planets: GeneratedPlanet[];
  anomalies: AnomalyType[];
  links: string[];
}

export interface GeneratedGalaxy {
  id: string;
  index: number;
  name: string;
  shape: GalaxyShape;
  position: Vec3;
  radius: number;
  systemCount: number;
  dominantResource: ResourceType;
  dangerLevel: number;
  systems: GeneratedStarSystem[];
}

export interface GeneratedFaction {
  id: string;
  name: string;
  archetype: FactionArchetype;
  color: string;
  homeSystemId: string;
  homePlanetId: string;
  startingResources: Record<ResourceType, number>;
  expansionBias: number;
}

export interface GeneratedUniverse {
  schemaVersion: number;
  seed: number;
  name: string;
  generatedAt: string;
  summary: {
    galaxyCount: number;
    systemCount: number;
    planetCount: number;
    factionCount: number;
    anomalyCount: number;
  };
  galaxies: GeneratedGalaxy[];
  factions: GeneratedFaction[];
}

const GALAXY_SHAPES: GalaxyShape[] = ["spiral", "barred-spiral", "elliptical", "ring", "irregular", "nebula"];
const STAR_CLASSES: StarClass[] = ["O", "B", "A", "F", "G", "K", "M", "X"];
const BIOMES: PlanetBiome[] = ["terran", "oceanic", "desert", "tundra", "volcanic", "jungle", "toxic", "barren", "ice", "crystalline", "radiated", "shattered"];
const RESOURCES: ResourceType[] = ["naquadah", "metal", "crystal", "deuterium", "dark-matter"];
const ANOMALIES: AnomalyType[] = ["ancient-ruins", "wormhole", "derelict-fleet", "precursor-beacon", "spatial-rift", "resource-rich-nebula"];
const ARCHETYPES: FactionArchetype[] = ["industrial", "scientific", "military", "exploration", "ancient", "raider"];
const FACTION_NAMES = ["Terran Coalition", "Asgard Stellar Accord", "Goa'uld System Lords", "Replicator Nexus", "Jaffa Free Alliance", "Ori Ascendancy", "Ancient Custodians", "Independent Worlds", "Tau'ri Expeditionary Fleet", "Void Corsairs", "Crystal Directorate", "Naquadah Consortium"];
const COLORS = ["#35b9ff", "#58d68d", "#e74c3c", "#a66bff", "#f5b041", "#ecf0f1", "#00d1b2", "#ff5da2", "#7ed6df", "#c8d6e5", "#f368e0", "#ff9f43"];
const RESOURCE_NAMES: Record<ResourceType, string> = {
  naquadah: "Naquadah", metal: "Heavy Metal", crystal: "Silicate Crystal",
  deuterium: "Cryo-Deuterium", "dark-matter": "Dark Matter",
};
const BIOME_HABITABILITY: Record<PlanetBiome, number> = {
  terran: 92, oceanic: 78, desert: 43, tundra: 38, volcanic: 20, jungle: 76,
  toxic: 8, barren: 12, ice: 27, crystalline: 31, radiated: 5, shattered: 2,
};
const STAR_TEMPERATURE: Record<StarClass, number> = {
  O: 35000, B: 20000, A: 8500, F: 6500, G: 5600, K: 4400, M: 3000, X: 1200,
};

function hashSeed(seed: number | string): number {
  const value = typeof seed === "number" ? String(seed) : seed;
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG. Only local state is mutated, never Math.random(). */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function intBetween(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}
function pick<T>(random: () => number, values: readonly T[]): T {
  return values[Math.floor(random() * values.length)]!;
}
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function systemName(galaxyIndex: number, systemIndex: number, random: () => number): string {
  const prefixes = ["Aether", "Avalon", "Cynos", "Draconis", "Erebus", "Helios", "Khepri", "Meridian", "Nexus", "Orion", "Pegasus", "Sagan", "Tantalus", "Vesper", "Zeta"];
  const suffix = ["Prime", "Reach", "Gate", "Haven", "Crown", "Rift", "Station", "Delta", "Vigil", "Pulsar"];
  return `${pick(random, prefixes)}-${pick(random, suffix)}-${String(galaxyIndex + 1).padStart(2, "0")}${String(systemIndex + 1).padStart(3, "0")}`;
}

function positionInGalaxy(shape: GalaxyShape, radius: number, random: () => number, index: number, count: number): Vec3 {
  const angle = (index / Math.max(count, 1)) * Math.PI * 2 + (random() - 0.5) * 0.22;
  const r = Math.sqrt(random()) * radius;
  const arm = Math.floor(random() * 4);
  let x = Math.cos(angle) * r;
  let y = (random() - 0.5) * radius * 0.15;
  let z = Math.sin(angle) * r;
  if (shape === "spiral" || shape === "barred-spiral") {
    const spiralAngle = angle + r / Math.max(radius, 1) * Math.PI * 2.2 + arm * Math.PI / 2;
    x = Math.cos(spiralAngle) * r;
    z = Math.sin(spiralAngle) * r;
    if (shape === "barred-spiral") x *= 0.72;
  } else if (shape === "elliptical") {
    z *= 0.58;
    y = (random() - 0.5) * radius * 0.3;
  } else if (shape === "ring") {
    const ringRadius = radius * (0.72 + random() * 0.22);
    x = Math.cos(angle) * ringRadius;
    z = Math.sin(angle) * ringRadius;
    y = (random() - 0.5) * radius * 0.05;
  } else if (shape === "irregular") {
    x += (random() - 0.5) * radius * 0.4;
    z += (random() - 0.5) * radius * 0.4;
    y = (random() - 0.5) * radius * 0.25;
  } else {
    y = (random() - 0.5) * radius * 0.5;
  }
  return { x: round(x), y: round(y), z: round(z) };
}
function round(value: number): number { return Math.round(value * 1000) / 1000; }

function generateResources(random: () => number): ResourceDeposit[] {
  const shuffled = [...RESOURCES].sort(() => random() - 0.5);
  const count = intBetween(random, 1, 4);
  return shuffled.slice(0, count).map((type) => {
    const abundance = intBetween(random, 5, 100);
    const richness = abundance >= 90 ? "exceptional" : abundance >= 70 ? "high" : abundance >= 45 ? "moderate" : abundance >= 20 ? "low" : "trace";
    return { type, abundance, richness };
  });
}

function generatePlanet(
  random: () => number, galaxyIndex: number, systemIndex: number, planetIndex: number,
  isHomeworld: boolean, stargateChance: number,
): GeneratedPlanet {
  const biome = isHomeworld ? "terran" : pick(random, BIOMES);
  const sizeClass = isHomeworld ? "large" : pick(random, ["small", "standard", "large", "super"] as const);
  const habitability = isHomeworld ? 95 : Math.max(0, Math.min(100, BIOME_HABITABILITY[biome] + intBetween(random, -15, 15)));
  const systemPrefix = `g${galaxyIndex + 1}-s${systemIndex + 1}`;
  return {
    id: `planet-${systemPrefix}-p${planetIndex + 1}`,
    index: planetIndex + 1,
    name: `${systemName(galaxyIndex, systemIndex, random)} ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][planetIndex % 9]}`,
    biome,
    habitability,
    sizeClass,
    orbitalDistance: round(0.4 + (planetIndex + 1) * (0.35 + random() * 0.3)),
    populationCapacity: sizeClass === "super" ? 90000000000 : sizeClass === "large" ? 30000000000 : sizeClass === "standard" ? 12000000000 : 4000000000,
    resources: generateResources(random),
    hasStargate: isHomeworld || random() < stargateChance,
    isHomeworld,
  };
}

/**
 * Generate a universe. Defaults intentionally stay small enough for a local browser
 * preview; server jobs can raise systemsPerGalaxy after profiling and persistence planning.
 */
export function generateProceduralUniverse(config: UniverseGenerationConfig): GeneratedUniverse {
  if (!config || (typeof config.seed !== "number" && typeof config.seed !== "string")) {
    throw new TypeError("A numeric or string seed is required.");
  }
  const normalized = {
    galaxyCount: config.galaxyCount ?? 6,
    systemsPerGalaxy: config.systemsPerGalaxy ?? 24,
    minPlanetsPerSystem: config.minPlanetsPerSystem ?? 2,
    maxPlanetsPerSystem: config.maxPlanetsPerSystem ?? 8,
    factionCount: config.factionCount ?? 6,
    galaxyRadius: config.galaxyRadius ?? 1200,
  };
  for (const [name, value] of Object.entries(normalized)) {
    if (!Number.isFinite(value) || value < 1) throw new RangeError(`${name} must be a positive finite number.`);
  }
  if (!Number.isInteger(normalized.galaxyCount) || normalized.galaxyCount > 250) throw new RangeError("galaxyCount must be an integer from 1 to 250.");
  if (!Number.isInteger(normalized.systemsPerGalaxy) || normalized.systemsPerGalaxy > 5000) throw new RangeError("systemsPerGalaxy must be an integer from 1 to 5000.");
  if (!Number.isInteger(normalized.factionCount) || normalized.factionCount > 12) throw new RangeError("factionCount must be an integer from 1 to 12.");
  if (!Number.isInteger(normalized.minPlanetsPerSystem) || !Number.isInteger(normalized.maxPlanetsPerSystem)
    || normalized.minPlanetsPerSystem > normalized.maxPlanetsPerSystem || normalized.maxPlanetsPerSystem > 20) {
    throw new RangeError("Planet limits must be integers, min <= max, and max <= 20.");
  }

  const seed = hashSeed(config.seed);
  const random = createRandom(seed);
  const universeName = config.universeName?.trim() || "The Aetherion Expanse";
  const galaxyNames = ["Avalon Reach", "Pegasus Veil", "Orion Spur", "Epsilon Rift", "Helios Crown", "Khepri Expanse", "Meridian Deep", "Tantalus Arm", "Vesper Nebula", "Sagan Frontier"];
  const factionCount = Math.min(normalized.factionCount, normalized.galaxyCount * normalized.systemsPerGalaxy);
  const factionDrafts: Omit<GeneratedFaction, "homeSystemId" | "homePlanetId">[] = Array.from({ length: factionCount }, (_, index) => ({
    id: `faction-${String(index + 1).padStart(3, "0")}`,
    name: FACTION_NAMES[index],
    archetype: ARCHETYPES[index % ARCHETYPES.length],
    color: COLORS[index],
    startingResources: { naquadah: 50000, metal: 125000, crystal: 80000, deuterium: 65000, "dark-matter": 250 },
    expansionBias: round(0.75 + random() * 0.5),
  }));

  const galaxies: GeneratedGalaxy[] = [];
  const homeworldByFaction: Array<{ systemId: string; planetId: string }> = [];
  let systemTotal = 0;
  let planetTotal = 0;
  let anomalyTotal = 0;
  for (let gi = 0; gi < normalized.galaxyCount; gi += 1) {
    const shape = pick(random, GALAXY_SHAPES);
    const galaxyPosition = {
      x: round((random() - 0.5) * 12000),
      y: round((random() - 0.5) * 3000),
      z: round((random() - 0.5) * 12000),
    };
    const dominantResource = pick(random, RESOURCES);
    const systems: GeneratedStarSystem[] = [];
    for (let si = 0; si < normalized.systemsPerGalaxy; si += 1) {
      const id = `galaxy-${String(gi + 1).padStart(3, "0")}-system-${String(si + 1).padStart(5, "0")}`;
      const isHomeSystem = systemTotal < factionCount;
      const factionIndex = isHomeSystem ? systemTotal : -1;
      const planetCount = intBetween(random, normalized.minPlanetsPerSystem, normalized.maxPlanetsPerSystem);
      const planets = Array.from({ length: planetCount }, (_, pi) => {
        const home = isHomeSystem && pi === 0;
        const planet = generatePlanet(random, gi, si, pi, home, 0.08);
        if (home) homeworldByFaction[factionIndex] = { systemId: id, planetId: planet.id };
        return planet;
      });
      const anomalies = random() < 0.22 ? [pick(random, ANOMALIES)] : [];
      const controllingFactionId = factionIndex >= 0 ? factionDrafts[factionIndex]!.id : null;
      systems.push({
        id, index: si + 1, name: systemName(gi, si, random),
        position: positionInGalaxy(shape, normalized.galaxyRadius, random, si, normalized.systemsPerGalaxy),
        starClass: pick(random, STAR_CLASSES),
        starTemperatureKelvin: STAR_TEMPERATURE[pick(random, STAR_CLASSES)],
        dangerLevel: intBetween(random, 0, 9),
        controllingFactionId, planets, anomalies, links: [],
      });
      systemTotal += 1;
      planetTotal += planets.length;
      anomalyTotal += anomalies.length;
    }
    // Connect each system to up to 3 nearest systems by deterministic topology.
    for (let si = 0; si < systems.length; si += 1) {
      const candidates = systems
        .filter((other) => other.id !== systems[si]!.id)
        .map((other) => ({ id: other.id, distance: distance(systems[si]!.position, other.position) }))
        .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
      systems[si]!.links = candidates.slice(0, Math.min(3, candidates.length)).map((entry) => entry.id);
    }
    galaxies.push({
      id: `galaxy-${String(gi + 1).padStart(3, "0")}`,
      index: gi + 1,
      name: galaxyNames[gi % galaxyNames.length] + (gi >= galaxyNames.length ? ` ${Math.floor(gi / galaxyNames.length) + 1}` : ""),
      shape, position: galaxyPosition, radius: normalized.galaxyRadius,
      systemCount: systems.length, dominantResource,
      dangerLevel: intBetween(random, 0, 9), systems,
    });
  }

  const factions: GeneratedFaction[] = factionDrafts.map((faction, index) => ({
    ...faction,
    homeSystemId: homeworldByFaction[index]!.systemId,
    homePlanetId: homeworldByFaction[index]!.planetId,
  }));
  return {
    schemaVersion: config.generatorVersion ?? 1,
    seed,
    name: universeName,
    generatedAt: new Date(0).toISOString(), // Stable serialization; use server metadata for actual creation time.
    summary: { galaxyCount: galaxies.length, systemCount: systemTotal, planetCount: planetTotal, factionCount: factions.length, anomalyCount: anomalyTotal },
    galaxies, factions,
  };
}

function distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x; const dy = a.y - b.y; const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function validateGeneratedUniverse(universe: GeneratedUniverse): string[] {
  const issues: string[] = [];
  if (universe.galaxies.length !== universe.summary.galaxyCount) issues.push("Galaxy summary count does not match generated data.");
  const systems = universe.galaxies.flatMap((galaxy) => galaxy.systems);
  const planets = systems.flatMap((system) => system.planets);
  if (systems.length !== universe.summary.systemCount) issues.push("System summary count does not match generated data.");
  if (planets.length !== universe.summary.planetCount) issues.push("Planet summary count does not match generated data.");
  const systemIds = new Set(systems.map((system) => system.id));
  const planetIds = new Set(planets.map((planet) => planet.id));
  if (systemIds.size !== systems.length) issues.push("System IDs are not unique.");
  if (planetIds.size !== planets.length) issues.push("Planet IDs are not unique.");
  for (const system of systems) {
    if (system.links.some((link) => !systemIds.has(link))) issues.push(`System ${system.id} links to a missing system.`);
    if (system.planets.length === 0) issues.push(`System ${system.id} has no planets.`);
  }
  for (const faction of universe.factions) {
    const homeSystem = systems.find((system) => system.id === faction.homeSystemId);
    if (!homeSystem) issues.push(`Faction ${faction.id} has no valid home system.`);
    if (!planetIds.has(faction.homePlanetId)) issues.push(`Faction ${faction.id} has no valid home planet.`);
  }
  return [...new Set(issues)];
}

export function getResourceDisplayName(type: ResourceType): string {
  return RESOURCE_NAMES[type];
}
