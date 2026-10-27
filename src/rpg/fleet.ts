export type ShipClass = "scout" | "fighter" | "bomber" | "corvette" | "cruiser" | "battleship" | "carrier" | "mothership";
export interface ShipDefinition { id:string; name:string; class:ShipClass; hull:number; attack:number; armor:number; cargo:number; speed:number; fuel:number; buildTime:number; cost:Record<string,number>; }
export interface Fleet { id:string; ownerId:string; ships:Record<string,number>; cargo:number; missionId?:string; }
export interface BattleResult { winner:"attacker"|"defender"|"draw"; attackerLosses:number; defenderLosses:number; attackerDamage:number; defenderDamage:number; }
export const SHIPS:Record<string,ShipDefinition> = {
 scout:{id:"scout",name:"Scout",class:"scout",hull:100,attack:15,armor:5,cargo:50,speed:12000,fuel:2,buildTime:30,cost:{metal:300,crystal:100}},
 fighter:{id:"fighter",name:"Fighter",class:"fighter",hull:250,attack:45,armor:15,cargo:100,speed:9000,fuel:4,buildTime:60,cost:{metal:800,crystal:200}},
 bomber:{id:"bomber",name:"Bomber",class:"bomber",hull:800,attack:130,armor:30,cargo:500,speed:5000,fuel:12,buildTime:180,cost:{metal:3000,crystal:1200,deuterium:300}},
 cruiser:{id:"cruiser",name:"Cruiser",class:"cruiser",hull:1800,attack:260,armor:80,cargo:800,speed:7000,fuel:20,buildTime:360,cost:{metal:7000,crystal:3000,deuterium:900}},
 battleship:{id:"battleship",name:"Battleship",class:"battleship",hull:5000,attack:700,armor:180,cargo:1500,speed:4500,fuel:35,buildTime:900,cost:{metal:18000,crystal:8000,deuterium:2500}},
 carrier:{id:"carrier",name:"Carrier",class:"carrier",hull:9000,attack:500,armor:300,cargo:5000,speed:3000,fuel:50,buildTime:1800,cost:{metal:30000,crystal:18000,deuterium:6000}},
 mothership:{id:"mothership",name:"Mothership",class:"mothership",hull:50000,attack:4000,armor:1500,cargo:25000,speed:1800,fuel:150,buildTime:7200,cost:{naquadah:450000000,metal:250000,crystal:150000,deuterium:50000}}
};
export function fleetPower(fleet:Fleet):number { return Object.entries(fleet.ships).reduce((p,[id,n])=>p+(SHIPS[id]?.attack??0)*n,0); }
export function fleetCargoCapacity(fleet:Fleet):number { return Object.entries(fleet.ships).reduce((p,[id,n])=>p+(SHIPS[id]?.cargo??0)*n,0); }
export function resolveFleetBattle(attacker:Fleet,defender:Fleet):BattleResult {
 const ap=fleetPower(attacker),dp=fleetPower(defender); const ratio=ap/(ap+dp||1); const winner=ap===dp?"draw":ap>dp?"attacker":"defender";
 return {winner,attackerLosses:Math.round(Object.values(attacker.ships).reduce((a,b)=>a+b,0)*(winner==="defender"?0.6:winner==="draw"?.3:.15)),defenderLosses:Math.round(Object.values(defender.ships).reduce((a,b)=>a+b,0)*(winner==="attacker"?.6:winner==="draw"?.3:.15)),attackerDamage:Math.round(dp*(1-ratio)),defenderDamage:Math.round(ap*ratio)};
}
