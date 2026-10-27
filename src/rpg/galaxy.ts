export interface Coordinates { galaxy:number; system:number; position:number; }
export interface PlanetNode { id:string; ownerId?:string; name:string; coordinates:Coordinates; fields:number; temperature:number; moonId?:string; }
export interface GalaxyConfig { galaxies:number; systemsPerGalaxy:number; positionsPerSystem:number; seed:number; }

export function coordinateKey(c:Coordinates):string { return `${c.galaxy}:${c.system}:${c.position}`; }
export function validCoordinates(c:Coordinates, cfg:GalaxyConfig):boolean { return c.galaxy>=1&&c.galaxy<=cfg.galaxies&&c.system>=1&&c.system<=cfg.systemsPerGalaxy&&c.position>=1&&c.position<=cfg.positionsPerSystem; }
export function seededRandom(seed:number):()=>number { let x=seed>>>0; return ()=>{ x=(1664525*x+1013904223)>>>0; return x/4294967296; }; }
export function generateGalaxy(cfg:GalaxyConfig):PlanetNode[] {
  const rng=seededRandom(cfg.seed), planets:PlanetNode[]=[];
  for(let g=1;g<=cfg.galaxies;g++) for(let s=1;s<=cfg.systemsPerGalaxy;s++) for(let p=1;p<=cfg.positionsPerSystem;p++) {
    if(rng()>0.72) continue;
    planets.push({id:`planet-${g}-${s}-${p}`,name:`Colony ${g}-${s}-${p}`,coordinates:{galaxy:g,system:s,position:p},fields:150+Math.floor(rng()*250),temperature:-100+Math.floor(rng()*180)});
  }
  return planets;
}
export function distance(a:Coordinates,b:Coordinates):number { if(a.galaxy!==b.galaxy)return Math.abs(a.galaxy-b.galaxy)*20000; if(a.system!==b.system)return Math.abs(a.system-b.system)*2000; return Math.abs(a.position-b.position)*100; }
