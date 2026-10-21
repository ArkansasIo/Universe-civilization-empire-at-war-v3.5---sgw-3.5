import { hashCombine, hashSeed } from "./rng";
import type { ChunkCoord } from "./chunk";
import { chunkId } from "./chunk";

export interface ChunkGateway { id:string; from:string; to:string; type:"stargate"|"wormhole"; }

function canonical(a:ChunkCoord,b:ChunkCoord):[ChunkCoord,ChunkCoord]{
  return chunkId(a)<chunkId(b)?[a,b]:[b,a];
}

export function crossChunkGateway(seed:number|string,a:ChunkCoord,b:ChunkCoord,threshold=0.08):ChunkGateway|null {
  if(a.galaxy!==b.galaxy)return null;
  const distance=Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.z-b.z));
  if(distance!==1)return null;
  const [left,right]=canonical(a,b);
  const h=hashCombine(hashSeed(seed),left.galaxy,left.x,left.y,left.z,right.x,right.y,right.z);
  const roll=(h>>>0)/4294967296;
  if(roll>=threshold)return null;
  const type=(h&1)===0?"stargate":"wormhole";
  const from=chunkId(left);const to=chunkId(right);
  return {id:`gateway:${from}:${to}`,from,to,type};
}

export function neighboringGateways(seed:number|string,coord:ChunkCoord,threshold=0.08):ChunkGateway[]{
  const out:ChunkGateway[]=[];
  for(const axis of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
    const other={galaxy:coord.galaxy,x:coord.x+axis[0]!,y:coord.y+axis[1]!,z:coord.z+axis[2]!};
    const gateway=crossChunkGateway(seed,coord,other,threshold);if(gateway)out.push(gateway);
  }
  return out;
}
