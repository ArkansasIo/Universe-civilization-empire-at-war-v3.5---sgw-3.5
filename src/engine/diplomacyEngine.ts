export type DiplomaticState='neutral'|'friendly'|'nap'|'allied'|'hostile'|'war';
export interface DiplomaticRelation { a:string; b:string; state:DiplomaticState; reputation:number; updatedAt:number; }
const rank:Record<DiplomaticState,number>={neutral:0,friendly:1,nap:2,allied:3,hostile:-1,war:-2};
export function canAttack(relation:DiplomaticRelation|null){return !relation || relation.state==='hostile'||relation.state==='war';}
export function setRelation(current:DiplomaticRelation|null,a:string,b:string,state:DiplomaticState):DiplomaticRelation{return {a,b,state,reputation:current?.reputation??0,updatedAt:Date.now()};}
export function relationStrength(state:DiplomaticState){return rank[state];}
