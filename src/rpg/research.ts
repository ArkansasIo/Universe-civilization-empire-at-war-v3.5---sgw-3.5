export type ResearchId="energy"|"metalMining"|"crystalMining"|"deuteriumSynthesis"|"shipTechnology"|"weapons"|"shielding"|"armor"|"hyperspace"|"astrophysics"|"computer"|"espionage";
export interface ResearchNode { id:ResearchId; name:string; description:string; maxLevel:number; prerequisites:Partial<Record<ResearchId,number>>; baseCost:{metal:number;crystal:number;deuterium:number}; growth:number; }
export type ResearchState=Partial<Record<ResearchId,number>>;
export const RESEARCH:Record<ResearchId,ResearchNode>={
 energy:{id:"energy",name:"Energy Technology",description:"Improves energy production and unlocks advanced systems.",maxLevel:20,prerequisites:{},baseCost:{metal:0,crystal:800,deuterium:400},growth:1.5},
 metalMining:{id:"metalMining",name:"Metal Mining",description:"Improves metal extraction.",maxLevel:30,prerequisites:{energy:1},baseCost:{metal:60,crystal:15,deuterium:0},growth:1.5},
 crystalMining:{id:"crystalMining",name:"Crystal Mining",description:"Improves crystal extraction.",maxLevel:30,prerequisites:{energy:3},baseCost:{metal:48,crystal:24,deuterium:0},growth:1.6},
 deuteriumSynthesis:{id:"deuteriumSynthesis",name:"Deuterium Synthesis",description:"Improves deuterium production.",maxLevel:30,prerequisites:{energy:5},baseCost:{metal:225,crystal:75,deuterium:0},growth:1.5},
 shipTechnology:{id:"shipTechnology",name:"Ship Technology",description:"Unlocks higher ship classes.",maxLevel:20,prerequisites:{metalMining:2,crystalMining:2},baseCost:{metal:200,crystal:1000,deuterium:300},growth:1.6},
 weapons:{id:"weapons",name:"Weapons Technology",description:"Raises fleet attack power.",maxLevel:30,prerequisites:{shipTechnology:3},baseCost:{metal:800,crystal:200,deuterium:0},growth:1.8},
 shielding:{id:"shielding",name:"Shielding Technology",description:"Raises fleet survivability.",maxLevel:30,prerequisites:{energy:3},baseCost:{metal:200,crystal:600,deuterium:0},growth:1.6},
 armor:{id:"armor",name:"Armor Technology",description:"Improves ship hulls.",maxLevel:30,prerequisites:{metalMining:2},baseCost:{metal:1000,crystal:0,deuterium:0},growth:1.6},
 hyperspace:{id:"hyperspace",name:"Hyperspace Technology",description:"Enables deep-space travel.",maxLevel:20,prerequisites:{energy:5,shipTechnology:3},baseCost:{metal:0,crystal:4000,deuterium:2000},growth:1.75},
 astrophysics:{id:"astrophysics",name:"Astrophysics",description:"Improves exploration and colony capacity.",maxLevel:25,prerequisites:{hyperspace:3,energy:5},baseCost:{metal:4000,crystal:8000,deuterium:4000},growth:1.75},
 computer:{id:"computer",name:"Computer Technology",description:"Increases command and fleet coordination capacity.",maxLevel:20,prerequisites:{},baseCost:{metal:0,crystal:400,deuterium:600},growth:1.6},
 espionage:{id:"espionage",name:"Espionage Technology",description:"Improves intelligence operations.",maxLevel:20,prerequisites:{computer:3},baseCost:{metal:200,crystal:1000,deuterium:200},growth:1.6}
};
export function canResearch(state:ResearchState,id:ResearchId):boolean { const n=RESEARCH[id], level=state[id]??0; return level<n.maxLevel&&Object.entries(n.prerequisites).every(([r,v])=>(state[r as ResearchId]??0)>=v!); }
export function researchCost(id:ResearchId,level:number){const n=RESEARCH[id]; if(level<1||level>n.maxLevel)throw new Error("invalid research level"); const m=Math.pow(n.growth,level-1); return {metal:Math.floor(n.baseCost.metal*m),crystal:Math.floor(n.baseCost.crystal*m),deuterium:Math.floor(n.baseCost.deuterium*m)};}
export function completeResearch(state:ResearchState,id:ResearchId):ResearchState { if(!canResearch(state,id))throw new Error("research prerequisites or maximum level not met"); return {...state,[id]:(state[id]??0)+1}; }
