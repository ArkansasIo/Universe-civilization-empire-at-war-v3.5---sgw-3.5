export interface Technology { id:string; name:string; maxLevel:number; baseCost:number; costGrowth:number; baseSeconds:number; prerequisites:string[]; }
export interface ResearchState { levels:Record<string,number>; queue:string[]; }
export function researchCost(tech:Technology,level:number){if(level<1||level>tech.maxLevel) throw new Error('INVALID_LEVEL'); return Math.floor(tech.baseCost*Math.pow(tech.costGrowth,level-1));}
export function researchTime(tech:Technology,level:number){if(level<1||level>tech.maxLevel) throw new Error('INVALID_LEVEL'); return Math.ceil(tech.baseSeconds*Math.pow(1.25,level-1));}
export function canResearch(tech:Technology,state:ResearchState){return tech.prerequisites.every(id=>(state.levels[id]??0)>0) && (state.levels[tech.id]??0)<tech.maxLevel && !state.queue.includes(tech.id);}
