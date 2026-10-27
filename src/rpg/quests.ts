export type QuestObjective={id:string;description:string;required:number;progress:number;kind:'kill'|'collect'|'explore'|'interact'|'boss'};
export type QuestDefinition={id:string;name:string;description:string;level:number;objectives:QuestObjective[];xpReward:number;currencyReward:number;itemRewards:string[];repeatable:boolean};
export const quests:QuestDefinition[]=[
{id:'first-rift',name:'First Rift',description:'Investigate the first unstable rift.',level:1,objectives:[{id:'explore-rift',description:'Reach the Riftlands',required:1,progress:0,kind:'explore'},{id:'kill-stalkers',description:'Defeat Rift Stalkers',required:5,progress:0,kind:'kill'}],xpReward:500,currencyReward:250,itemRewards:['phoenix-revival-tonic'],repeatable:false},
{id:'vault-defense',name:'Vault Defense',description:'Recover the Naquadah Vault before the sentinels overwhelm the sector.',level:25,objectives:[{id:'pylons',description:'Disable warding pylons',required:3,progress:0,kind:'interact'},{id:'sentinel',description:'Defeat the Naquadah Sentinel',required:1,progress:0,kind:'boss'}],xpReward:5000,currencyReward:2500,itemRewards:['vanguard-aegis-pvp'],repeatable:false},
];
export function updateQuest(q:QuestDefinition,objectiveId:string,amount:number):QuestDefinition{return{...q,objectives:q.objectives.map(o=>o.id===objectiveId?{...o,progress:Math.min(o.required,o.progress+Math.max(0,amount))}:o)};}
export function questComplete(q:QuestDefinition):boolean{return q.objectives.every(o=>o.progress>=o.required);}
