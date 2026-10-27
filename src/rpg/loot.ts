import type { LootTableDefinition } from './types';
import { lootTables } from './catalog';

export type LootRoll={itemId:string;quantity:number};
export type LootResult={rolls:LootRoll[];currency:number};
export function seededRandom(seed:string):()=>number{let h=2166136261;return()=>{for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}h=(h+0x6D2B79F5)|0;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function rollLoot(table:LootTableDefinition,seed:string,failedRolls=0):LootResult{const rng=seededRandom(seed);const rolls:LootRoll[]=[];const totalWeight=table.entries.reduce((n,e)=>n+Math.max(0,e.weight),0);for(let i=0;i<table.rolls;i++){if(table.pity&&failedRolls+i+1>=table.pity.failedRollThreshold){rolls.push({itemId:table.pity.itemId,quantity:1});continue;}let r=rng()*totalWeight;let selected=table.entries[0];for(const e of table.entries){r-=Math.max(0,e.weight);if(r<=0){selected=e;break;}}const min=selected.minQuantity??1,max=selected.maxQuantity??min;const quantity=min+Math.floor(rng()*(max-min+1));rolls.push({itemId:selected.itemId,quantity});}const currency=table.currencyRange?Math.floor(table.currencyRange.min+rng()*(table.currencyRange.max-table.currencyRange.min+1)):0;return{rolls,currency};}
export function getLootTable(id:string):LootTableDefinition{const t=lootTables.find(x=>x.id===id);if(!t)throw new Error(`Unknown loot table ${id}`);return t;}
