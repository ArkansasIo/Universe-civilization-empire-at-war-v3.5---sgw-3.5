import type { Combatant } from './types';
import { contextAdjustedStats, hitChance } from './formulas';
export type ArenaRating={playerId:string;rating:number;wins:number;losses:number;seasonId:string};
export function expectedWinChance(a:number,b:number):number{return 1/(1+Math.pow(10,(b-a)/400));}
export function updateRating(r:ArenaRating,opponentRating:number,win:boolean,k=24):ArenaRating{const expected=expectedWinChance(r.rating,opponentRating);const delta=Math.round(k*((win?1:0)-expected));return{...r,rating:Math.max(0,r.rating+delta),wins:r.wins+(win?1:0),losses:r.losses+(win?0:1)};}
export function validatePvPCombat(attacker:Combatant,defender:Combatant):{valid:boolean;reason?:string}{if(attacker.context!=='pvp'||defender.context!=='pvp')return{valid:false,reason:'Both combatants must be in PvP context'};if(attacker.id===defender.id)return{valid:false,reason:'Cannot attack self'};const a=contextAdjustedStats(attacker.stats,'pvp'),d=contextAdjustedStats(defender.stats,'pvp');if(hitChance(a.accuracy,d.evasion)<=0)return{valid:false,reason:'Invalid combat stats'};return{valid:true};}
