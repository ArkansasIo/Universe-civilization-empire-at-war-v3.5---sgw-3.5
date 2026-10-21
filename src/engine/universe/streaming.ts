import { chunkDistance, chunkId, type ChunkCoord, type ChunkStreamingConfig, DEFAULT_CHUNK_STREAMING_CONFIG, neighboringChunks } from "./chunk";

export interface ChunkGenerator<T>{generate(coord:ChunkCoord):T;}
export interface LoadedChunk<T>{coord:ChunkCoord; value:T; lastAccessTick:number;}

export class UniverseChunkStreamer<T>{
  private readonly loaded=new Map<string,LoadedChunk<T>>();
  private tick=0;
  constructor(private readonly generator:ChunkGenerator<T>, private readonly config:ChunkStreamingConfig=DEFAULT_CHUNK_STREAMING_CONFIG){}

  update(center:ChunkCoord):{loaded:string[];unloaded:string[]} {
    this.tick++;
    const required=neighboringChunks(center,this.config.loadRadius);
    const requiredIds=new Set(required.map(chunkId));
    const loaded:string[]=[];
    const unloaded:string[]=[];
    for(const coord of required){
      const id=chunkId(coord); const existing=this.loaded.get(id);
      if(existing){existing.lastAccessTick=this.tick;continue;}
      this.loaded.set(id,{coord,value:this.generator.generate(coord),lastAccessTick:this.tick});
      loaded.push(id);
    }
    for(const [id,item] of this.loaded){
      if(requiredIds.has(id))continue;
      if(chunkDistance(item.coord,center)>this.config.unloadRadius){this.loaded.delete(id);unloaded.push(id);}
    }
    return {loaded,unloaded};
  }

  get(coord:ChunkCoord):T|undefined{return this.loaded.get(chunkId(coord))?.value;}
  has(coord:ChunkCoord):boolean{return this.loaded.has(chunkId(coord));}
  entries():LoadedChunk<T>[] { return [...this.loaded.values()]; }
  clear():void{this.loaded.clear();}
  size():number{return this.loaded.size;}
}
