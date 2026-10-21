/**
 * OGame-style strategic galaxy layout for every generated universe.
 *
 * Layout contract:
 *   Universe -> 90 galaxies -> 499 solar systems -> 15 planetary positions.
 *
 * Position 16 is intentionally modeled as an expedition slot rather than a
 * normal planet position. The full grid is generated lazily so a universe can
 * expose the complete coordinate space without allocating 673,650 objects.
 */

export const OGAME_GALAXIES_PER_UNIVERSE = 90;
export const OGAME_SYSTEMS_PER_GALAXY = 499;
export const OGAME_PLANET_POSITIONS_PER_SYSTEM = 15;
export const OGAME_EXPEDITION_POSITION = 16;

export type OGamePositionClass =
  | "inner-orbit"
  | "habitable-orbit"
  | "outer-orbit"
  | "deep-orbit";

export interface OGameGalaxyCoordinate {
  universeId: number;
  galaxy: number;
  system: number;
}

export interface OGamePlanetSlot extends OGameGalaxyCoordinate {
  position: number;
  slotClass: OGamePositionClass;
  occupied: boolean;
  planetId: string | null;
  moonId: string | null;
  debrisFieldId: string | null;
  expeditionOnly: false;
}

export interface OGameSystem extends OGameGalaxyCoordinate {
  id: string;
  starSeed: number;
  starClass: "O" | "B" | "A" | "F" | "G" | "K" | "M";
  activityLevel: number;
  dangerLevel: number;
  expeditionPosition: number;
  slots: OGamePlanetSlot[];
}

export interface OGameGalaxy {
  universeId: number;
  galaxy: number;
  name: string;
  systemCount: number;
  planetSlotsPerSystem: number;
  expeditionPosition: number;
  systems: OGameSystem[];
}

export interface OGameGalaxyLayout {
  universeId: number;
  galaxiesPerUniverse: number;
  systemsPerGalaxy: number;
  planetPositionsPerSystem: number;
  expeditionPosition: number;
  totalSystems: number;
  totalPlanetSlots: number;
}

function hash32(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random01(seed: number, offset: number): number {
  let x = (seed + Math.imul(offset + 1, 0x9e3779b9)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function starClass(seed: number): OGameSystem["starClass"] {
  const r = random01(seed, 17);
  if (r < 0.01) return "O";
  if (r < 0.04) return "B";
  if (r < 0.10) return "A";
  if (r < 0.20) return "F";
  if (r < 0.35) return "G";
  if (r < 0.58) return "K";
  return "M";
}

function slotClass(position: number): OGamePositionClass {
  if (position <= 3) return "inner-orbit";
  if (position <= 6) return "habitable-orbit";
  if (position <= 12) return "outer-orbit";
  return "deep-orbit";
}

export function createOGameGalaxyLayout(universeId: number): OGameGalaxyLayout {
  if (!Number.isInteger(universeId) || universeId < 1) {
    throw new RangeError("universeId must be a positive integer.");
  }
  return {
    universeId,
    galaxiesPerUniverse: OGAME_GALAXIES_PER_UNIVERSE,
    systemsPerGalaxy: OGAME_SYSTEMS_PER_GALAXY,
    planetPositionsPerSystem: OGAME_PLANET_POSITIONS_PER_SYSTEM,
    expeditionPosition: OGAME_EXPEDITION_POSITION,
    totalSystems: OGAME_GALAXIES_PER_UNIVERSE * OGAME_SYSTEMS_PER_GALAXY,
    totalPlanetSlots:
      OGAME_GALAXIES_PER_UNIVERSE *
      OGAME_SYSTEMS_PER_GALAXY *
      OGAME_PLANET_POSITIONS_PER_SYSTEM,
  };
}

export function getOGameSystem(
  universeId: number,
  galaxy: number,
  system: number,
): OGameSystem {
  if (!Number.isInteger(galaxy) || galaxy < 1 || galaxy > OGAME_GALAXIES_PER_UNIVERSE) {
    throw new RangeError(`galaxy must be between 1 and ${OGAME_GALAXIES_PER_UNIVERSE}.`);
  }
  if (!Number.isInteger(system) || system < 1 || system > OGAME_SYSTEMS_PER_GALAXY) {
    throw new RangeError(`system must be between 1 and ${OGAME_SYSTEMS_PER_GALAXY}.`);
  }

  const id = `u${universeId}-g${galaxy}-s${system}`;
  const seed = hash32(id);
  const slots: OGamePlanetSlot[] = [];

  for (let position = 1; position <= OGAME_PLANET_POSITIONS_PER_SYSTEM; position += 1) {
    // Occupancy is deterministic but intentionally sparse. Actual player/AI
    // ownership must be supplied by authoritative game state.
    const occupied = random01(seed, position + 100) < 0.23;
    const planetId = occupied ? `${id}-p${position}` : null;
    slots.push({
      universeId,
      galaxy,
      system,
      position,
      slotClass: slotClass(position),
      occupied,
      planetId,
      moonId: occupied && random01(seed, position + 200) < 0.18 ? `${id}-m${position}` : null,
      debrisFieldId: occupied && random01(seed, position + 300) < 0.28 ? `${id}-d${position}` : null,
      expeditionOnly: false,
    });
  }

  return {
    universeId,
    galaxy,
    system,
    id,
    starSeed: seed,
    starClass: starClass(seed),
    activityLevel: Math.floor(random01(seed, 401) * 100),
    dangerLevel: Math.floor(random01(seed, 402) * 10),
    expeditionPosition: OGAME_EXPEDITION_POSITION,
    slots,
  };
}

export function getOGameGalaxy(universeId: number, galaxy: number): OGameGalaxy {
  if (!Number.isInteger(galaxy) || galaxy < 1 || galaxy > OGAME_GALAXIES_PER_UNIVERSE) {
    throw new RangeError(`galaxy must be between 1 and ${OGAME_GALAXIES_PER_UNIVERSE}.`);
  }
  const systems = Array.from(
    { length: OGAME_SYSTEMS_PER_GALAXY },
    (_, index) => getOGameSystem(universeId, galaxy, index + 1),
  );
  return {
    universeId,
    galaxy,
    name: `Galaxy ${galaxy}`,
    systemCount: OGAME_SYSTEMS_PER_GALAXY,
    planetSlotsPerSystem: OGAME_PLANET_POSITIONS_PER_SYSTEM,
    expeditionPosition: OGAME_EXPEDITION_POSITION,
    systems,
  };
}

export function getOGameCoordinate(
  universeId: number,
  galaxy: number,
  system: number,
  position?: number,
): string {
  getOGameSystem(universeId, galaxy, system);
  if (position === undefined) return `${universeId}:${galaxy}:${system}`;
  if (!Number.isInteger(position) || position < 1 || position > OGAME_EXPEDITION_POSITION) {
    throw new RangeError(`position must be between 1 and ${OGAME_EXPEDITION_POSITION}.`);
  }
  return `${universeId}:${galaxy}:${system}:${position}`;
}

export function forEachOGameSystem(
  universeId: number,
  callback: (system: OGameSystem) => void,
): void {
  for (let galaxy = 1; galaxy <= OGAME_GALAXIES_PER_UNIVERSE; galaxy += 1) {
    for (let system = 1; system <= OGAME_SYSTEMS_PER_GALAXY; system += 1) {
      callback(getOGameSystem(universeId, galaxy, system));
    }
  }
}
