import { hashCombine, hashSeed } from "./rng";
import type { ChunkCoord } from "./chunk";

export function deriveChunkSeed(universeSeed:number|string, coord:ChunkCoord, generatorVersion=1):number {
  return hashCombine(hashSeed(universeSeed), coord.galaxy, coord.x, coord.y, coord.z, generatorVersion);
}

export function deriveSectorSeed(universeSeed:number|string, galaxy:number, x:number, y:number, z:number, generatorVersion=1):number {
  return hashCombine(hashSeed(universeSeed), galaxy, x, y, z, generatorVersion, 0x53454354);
}
