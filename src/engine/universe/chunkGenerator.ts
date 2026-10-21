import { hashSeed, mulberry32, randomFloat, randomInt } from "./rng";
import { chunkBounds, chunkId, sectorOf, type ChunkCoord, type UniverseChunk } from "./chunk";
import { deriveChunkSeed } from "./chunkSeed";

export interface ChunkGenerationOptions { chunkSize?:number; sectorSizeInChunks?:number; generatorVersion?:number; maxSystemsPerChunk?:number; }

export function generateChunk(universeSeed:number|string, coord:ChunkCoord, options:ChunkGenerationOptions={}):UniverseChunk {
  const chunkSize=options.chunkSize??400;
  const sectorSize=options.sectorSizeInChunks??8;
  const version=options.generatorVersion??1;
  const maxSystems=options.maxSystemsPerChunk??12;
  if(!Number.isInteger(maxSystems)||maxSystems<0)throw new RangeError("maxSystemsPerChunk must be a non-negative integer");
  if(!Number.isInteger(sectorSize)||sectorSize<1)throw new RangeError("sectorSizeInChunks must be positive");
  const seed=deriveChunkSeed(universeSeed,coord,version);
  const rng=mulberry32(seed);
  const count=randomInt(rng,0,maxSystems);
  const systemIds:string[]=[];
  for(let i=0;i<count;i++){
    const localSeed=hashSeed(`${seed}:${i}`);
    const localRng=mulberry32(localSeed);
    const sx=Math.floor(randomFloat(localRng,coord.x*chunkSize,(coord.x+1)*chunkSize));
    const sy=Math.floor(randomFloat(localRng,coord.y*chunkSize,(coord.y+1)*chunkSize));
    const sz=Math.floor(randomFloat(localRng,coord.z*chunkSize,(coord.z+1)*chunkSize));
    systemIds.push(`G${coord.galaxy}-C${coord.x}_${coord.y}_${coord.z}-S${i}-${sx}_${sy}_${sz}`);
  }
  return {id:chunkId(coord),coord,sector:sectorOf(coord,sectorSize),seed,version,bounds:chunkBounds(coord,chunkSize),systemIds,generatedAtTick:0};
}
