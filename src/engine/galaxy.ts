import { seededRng } from './rng';
import type { Coordinates } from './types';
export interface StarSystem { id:string; name:string; coordinates:Coordinates; starClass:string; planets:number; }
export interface Galaxy { seed:string; generationVersion:number; systems:StarSystem[]; }
export function generateGalaxy(seed:string, systems=100, generationVersion=1):Galaxy { const rng=seededRng(`${seed}:v${generationVersion}`); const classes=['O','B','A','F','G','K','M']; const out:StarSystem[]=[]; for(let i=1;i<=systems;i++){ out.push({id:`SYS-${i}`,name:`System ${i}`,coordinates:{galaxy:1,system:i,planet:0},starClass:classes[Math.floor(rng()*classes.length)],planets:1+Math.floor(rng()*15)}); } return {seed,generationVersion,systems:out}; }
