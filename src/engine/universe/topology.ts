import type { GeneratedStarSystem } from "./types";
import { distance } from "./geometry";
export function connectNearestSystems(systems:GeneratedStarSystem,maxLinks=3):void{
 const limit=Math.max(1,Math.floor(maxLinks));
 for(const system of systems){const nearest=systems.filter(s=>s.id!==system.id).map(s=>({id:s.id,d:distance(system.position,s.position)})).sort((a,b)=>a.d-b.d||a.id.localeCompare(b.id)).slice(0,limit).map(x=>x.id);system.links=nearest;}
 // Make links bidirectional; this produces a navigable undirected starmap.
 const byId=new Map(systems.map(s=>[s.id,s]));
 for(const system of systems)for(const targetId of [...system.links]){const target=byId.get(targetId);if(target&&!target.links.includes(system.id)&&target.links.length<limit)target.links.push(system.id);}
}
export function shortestPath(systems:GeneratedStarSystem[],from:string,to:string):string[]{if(from===to)return[from];const byId=new Map(systems.map(s=>[s.id,s]));const queue=[from];const prev=new Map<string,string|null>([[from,null]]);while(queue.length){const id=queue.shift()!;for(const next of byId.get(id)?.links??[]){if(prev.has(next))continue;prev.set(next,id);if(next===to){const path=[next];let p=prev.get(next);while(p){path.unshift(p);p=prev.get(p)??null;}return path;}queue.push(next);}}return[];}
export function topologyIsConnected(systems:GeneratedStarSystem[]):boolean{if(systems.length<2)return true;const seen=new Set<string>();const q=[systems[0]!.id];while(q.length){const id=q.pop()!;if(seen.has(id))continue;seen.add(id);q.push(...(systems.find(s=>s.id===id)?.links??[]));}return seen.size===systems.length;}
