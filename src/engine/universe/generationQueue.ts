import type { ChunkCoord } from "./chunk";

export interface GenerationRequest { coord:ChunkCoord; priority:number; requestedAt:number; }
export interface GenerationResult<T> { coord:ChunkCoord; value:T; }

export class GenerationQueue<T>{
  private readonly queue:GenerationRequest[]=[];
  private sequence=0;
  constructor(private readonly generate:(coord:ChunkCoord)=>T,private readonly concurrency=1){}
  enqueue(coord:ChunkCoord,priority=0):void{this.queue.push({coord,priority,requestedAt:this.sequence++});this.queue.sort((a,b)=>b.priority-a.priority||a.requestedAt-b.requestedAt);}
  pending():number{return this.queue.length;}
  async drain():Promise<GenerationResult<T>[]> {const results:GenerationResult<T>[]=[];const width=Math.max(1,Math.floor(this.concurrency));while(this.queue.length){const batch=this.queue.splice(0,width);const generated=batch.map(request=>({coord:request.coord,value:this.generate(request.coord)}));results.push(...generated);await Promise.resolve();}return results;}
  clear():void{this.queue.length=0;}
}
