export interface GeneratedSystem { galaxy: number; system: number; seed: number; starClass: "yellow" | "red" | "blue" | "white"; planetCount: number; }
function hashSeed(seed: string): number { let h = 2166136261; for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function nextRandom(state: { value: number }): number { state.value = (state.value + 0x6D2B79F5) >>> 0; let t = state.value; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
/** Coordinate-addressable generation: same seed and coordinates always produce the same system. */
export function generateSystem(worldSeed: string, galaxy: number, system: number): GeneratedSystem {
  if (!worldSeed.trim()) throw new Error("worldSeed is required");
  if (!Number.isInteger(galaxy) || galaxy < 1 || galaxy > 9) throw new RangeError("galaxy must be 1..9");
  if (!Number.isInteger(system) || system < 1 || system > 499) throw new RangeError("system must be 1..499");
  const state = { value: hashSeed(worldSeed + ":" + galaxy + ":" + system) };
  const stars = ["yellow", "red", "blue", "white"] as const;
  return { galaxy, system, seed: state.value, starClass: stars[Math.floor(nextRandom(state) * stars.length)], planetCount: 5 + Math.floor(nextRandom(state) * 11) };
}
