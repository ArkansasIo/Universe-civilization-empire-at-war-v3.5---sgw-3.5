import { chunkDistance, chunkId, isWithinGalaxyBounds, type ChunkCoord, type ChunkStreamingConfig, DEFAULT_CHUNK_STREAMING_CONFIG, neighboringChunks } from "./chunk";

export interface ChunkGenerator<T>{generate(coord:ChunkCoord):T;}
export interface LoadedChunk<T>{coord:ChunkCoord; value:T; lastAccessTick:number;}
export interface ChunkSnapshot<T>{id:string;coord:ChunkCoord;value:T;lastAccessTick:number;}
export interface ChunkStore<T>{get(id:string):Promise<ChunkSnapshot<T>|undefined>;put(snapshot:ChunkSnapshot<T>):Promise<void>;delete(id:string):Promise<void>;}
export class MemoryChunkStore<T> implements ChunkStore<T>{private readonly data=new Map<string,ChunkSnapshot<T>>();async get(id:string){return this.data.get(id);}async put(snapshot:ChunkSnapshot<T>){this.data.set(snapshot.id,snapshot);}async delete(id:string){this.data.delete(id);}size(){return this.data.size;}}
export interface ExplorationRecord{factionId:string;chunkId:string;discoveredTick:number;explored:boolean;}
export class ExplorationState{private readonly records=new Map<string,ExplorationRecord>();private key(factionId:string,id:string){return `${factionId}|${id}`;}discover(factionId:string,coord:ChunkCoord,tick=0){const id=chunkId(coord);const key=this.key(factionId,id);const old=this.records.get(key);this.records.set(key,{factionId,chunkId:id,discoveredTick:old?.discoveredTick??tick,explored:true});}isDiscovered(factionId:string,coord:ChunkCoord){return this.records.has(this.key(factionId,chunkId(coord)));}isExplored(factionId:string,coord:ChunkCoord){return this.records.get(this.key(factionId,chunkId(coord)))?.explored===true;}recordsFor(factionId:string){return [...this.records.values()].filter(x=>x.factionId===factionId);}}

export interface StreamingStats{loaded:number;cacheLimit:number;tick:number;loads:number;unloads:number;cacheHits:number;cacheMisses:number;}

export class UniverseChunkStreamer<T>{
  private readonly loaded=new Map<string,LoadedChunk<T>>();
  private tick=0; private loads=0; private unloads=0; private cacheHits=0; private cacheMisses=0;
  constructor(private readonly generator:ChunkGenerator<T>, private readonly config:ChunkStreamingConfig=DEFAULT_CHUNK_STREAMING_CONFIG, private readonly store?:ChunkStore<T>){}

  update(center:ChunkCoord):{loaded:string[];unloaded:string[]} {
    this.tick++;
    const required=neighboringChunks(center,this.config.loadRadius).filter(c=>isWithinGalaxyBounds(c,this.config.galaxyChunkRadius??0));
    const requiredIds=new Set(required.map(chunkId));
    const loaded:string[]=[]; const unloaded:string[]=[];
    for(const coord of required){const id=chunkId(coord);const existing=this.loaded.get(id);if(existing){existing.lastAccessTick=this.tick;this.cacheHits++;continue;}this.cacheMisses++;const value=this.generator.generate(coord);this.loaded.set(id,{coord,value,lastAccessTick:this.tick});this.loads++;loaded.push(id);}
    for(const [id,item] of this.loaded){if(requiredIds.has(id))continue;if(chunkDistance(item.coord,center)>this.config.unloadRadius){this.loaded.delete(id);this.unloads++;unloaded.push(id);void this.store?.put({id,coord:item.coord,value:item.value,lastAccessTick:item.lastAccessTick});}}
    this.enforceCacheLimit(requiredIds);
    return {loaded,unloaded};
  }

  private enforceCacheLimit(requiredIds:Set<string>){const limit=Math.max(1,this.config.maxCachedChunks??4096);while(this.loaded.size>limit){let victim:LoadedChunk<T>|undefined;let victimId="";for(const [id,item] of this.loaded){if(requiredIds.has(id))continue;if(!victim||item.lastAccessTick<victim.lastAccessTick){victim=item;victimId=id;}}if(!victim)break;this.loaded.delete(victimId);this.unloads++;void this.store?.put({id:victimId,coord:victim.coord,value:victim.value,lastAccessTick:victim.lastAccessTick});}}
  get(coord:ChunkCoord):T|undefined{const item=this.loaded.get(chunkId(coord));if(item)item.lastAccessTick=this.tick;return item?.value;}
  has(coord:ChunkCoord):boolean{return this.loaded.has(chunkId(coord));}
  entries():LoadedChunk<T>[] {return [...this.loaded.values()];}
  size():number{return this.loaded.size;}
  stats():StreamingStats{return {loaded:this.loaded.size,cacheLimit:this.config.maxCachedChunks??4096,tick:this.tick,loads:this.loads,unloads:this.unloads,cacheHits:this.cacheHits,cacheMisses:this.cacheMisses};}
  clear():void{this.loaded.clear();}
  async restore(coord:ChunkCoord):Promise<boolean>{if(!this.store)return false;const id=chunkId(coord);const snapshot=await this.store.get(id);if(!snapshot)return false;this.loaded.set(id,{coord:snapshot.coord,value:snapshot.value,lastAccessTick:this.tick});return true;}
  async persistAll():Promise<void>{if(!this.store)return;for(const [id,item] of this.loaded)await this.store.put({id,coord:item.coord,value:item.value,lastAccessTick:item.lastAccessTick});}
}
