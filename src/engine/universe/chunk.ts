import type { Vec3 } from "./types";

export interface ChunkCoord { galaxy:number; x:number; y:number; z:number; }
export interface SectorCoord { galaxy:number; x:number; y:number; z:number; }
export interface UniverseChunkBounds { min:Vec3; max:Vec3; }
export interface UniverseChunk {
  id:string; coord:ChunkCoord; sector:SectorCoord; seed:number; version:number;
  bounds:UniverseChunkBounds; systemIds:string[]; generatedAtTick:number;
}
export interface ChunkStreamingConfig {
  chunkSize:number; sectorSizeInChunks:number; loadRadius:number; unloadRadius:number;
  generatorVersion:number; maxCachedChunks?:number; galaxyChunkRadius?:number;
}
export const DEFAULT_CHUNK_STREAMING_CONFIG:ChunkStreamingConfig={
  chunkSize:400, sectorSizeInChunks:8, loadRadius:2, unloadRadius:3,
  generatorVersion:1, maxCachedChunks:4096, galaxyChunkRadius:0
};
export function chunkId(c:ChunkCoord):string{return `g${c.galaxy}:c${c.x},${c.y},${c.z}`;}
export function sectorId(c:SectorCoord):string{return `g${c.galaxy}:s${c.x},${c.y},${c.z}`;}
export function sectorOf(c:ChunkCoord,size=8):SectorCoord{return {galaxy:c.galaxy,x:Math.floor(c.x/size),y:Math.floor(c.y/size),z:Math.floor(c.z/size)};}
export function worldToChunk(position:Vec3,galaxy=0,chunkSize=400):ChunkCoord{return {galaxy,x:Math.floor(position.x/chunkSize),y:Math.floor(position.y/chunkSize),z:Math.floor(position.z/chunkSize)};}
export function chunkCenter(c:ChunkCoord,chunkSize=400):Vec3{return {x:(c.x+0.5)*chunkSize,y:(c.y+0.5)*chunkSize,z:(c.z+0.5)*chunkSize};}
export function chunkBounds(c:ChunkCoord,chunkSize=400):UniverseChunkBounds{const min={x:c.x*chunkSize,y:c.y*chunkSize,z:c.z*chunkSize};return {min,max:{x:min.x+chunkSize,y:min.y+chunkSize,z:min.z+chunkSize}};}
export function chunkDistance(a:ChunkCoord,b:ChunkCoord):number{return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.z-b.z));}
export function neighboringChunks(center:ChunkCoord,radius:number):ChunkCoord[]{const out:ChunkCoord[]=[];for(let z=-radius;z<=radius;z++)for(let y=-radius;y<=radius;y++)for(let x=-radius;x<=radius;x++)out.push({galaxy:center.galaxy,x:center.x+x,y:center.y+y,z:center.z+z});return out;}
export function isWithinGalaxyBounds(c:ChunkCoord,radius:number):boolean{return radius<=0||Math.max(Math.abs(c.x),Math.abs(c.y),Math.abs(c.z))<=radius;}
export function compareChunkCoords(a:ChunkCoord,b:ChunkCoord):number{return a.galaxy-b.galaxy||a.x-b.x||a.y-b.y||a.z-b.z;}
