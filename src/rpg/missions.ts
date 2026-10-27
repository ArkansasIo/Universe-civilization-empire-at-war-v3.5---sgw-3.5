export type DailyMission={id:string;name:string;description:string;objective:'kill'|'dungeon'|'raid'|'craft'|'pvp'|'explore';required:number;rewardXp:number;rewardCurrency:number;rewardItemId?:string};
export const dailyMissions:DailyMission[]=[
{id:'daily-hunt',name:'Rift Hunt',description:'Defeat hostile creatures.',objective:'kill',required:20,rewardXp:1500,rewardCurrency:500},
{id:'daily-dungeon',name:'Vault Runner',description:'Complete a dungeon.',objective:'dungeon',required:1,rewardXp:3000,rewardCurrency:1000,rewardItemId:'naquadah-crystal'},
{id:'daily-arena',name:'Arena Combat',description:'Win PvP matches.',objective:'pvp',required:3,rewardXp:2500,rewardCurrency:800},
{id:'daily-craft',name:'Field Engineer',description:'Craft useful equipment or consumables.',objective:'craft',required:5,rewardXp:1200,rewardCurrency:600},
];
export function missionComplete(progress:number,mission:DailyMission):boolean{returnprogress>=mission.required;}
