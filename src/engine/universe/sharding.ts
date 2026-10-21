import { hashCombine, hashSeed } from "./rng";
import { chunkId, type ChunkCoord } from "./chunk";

export interface ShardConfig {
  shardCount:number;
  universeId:string;
}

export interface ChunkAuthority {
  chunkId:string;
  shardId:number;
  authorityKey:string;
}

export function shardForChunk(universeSeed:number|string, coord:ChunkCoord, shardCount:number):number {
  const count=Math.max(1,Math.floor(shardCount));
  return hashCombine(hashSeed(universeSeed),coord.galaxy,coord.x,coord.y,coord.z) % count;
}

export function chunkAuthority(universeSeed:number|string, coord:ChunkCoord, config:ShardConfig):ChunkAuthority {
  const id=chunkId(coord);
  const shardId=shardForChunk(universeSeed,coord,config.shardCount);
  return {chunkId:id,shardId,authorityKey:`${config.universeId}:shard-${shardId}`};
}

export function ownsChunk(universeSeed:number|string,coord:ChunkCoord,shardId:number,shardCount:number):boolean {
  return shardForChunk(universeSeed,coord,shardCount)===Math.floor(shardId);
}
