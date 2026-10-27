export interface Moon { id:string; planetId:string; size:number; fields:number; buildings:Record<string,number>; createdAt:number; }
export interface MoonChanceInput { debrisMetal:number; debrisCrystal:number; rng?:()=>number; }

export function moonCreationChance(input:MoonChanceInput):number {
  const debris=Math.min(20,(input.debrisMetal+input.debrisCrystal)/1000000);
  return Math.min(20, debris);
}

export function createMoon(planetId:string,input:MoonChanceInput,now=Date.now()):Moon|null {
  const chance=moonCreationChance(input);
  const roll=(input.rng??Math.random)()*100;
  if(roll>=chance) return null;
  return {id:`moon-${planetId}-${now}`,planetId,size:Math.floor(600+(input.rng??Math.random)()*900),fields:100,buildings:{"moon-base":1},createdAt:now};
}

export function moonFieldCapacity(moon:Moon):number { return Math.max(0,moon.fields-(Object.values(moon.buildings).reduce((a,b)=>a+b,0))); }
