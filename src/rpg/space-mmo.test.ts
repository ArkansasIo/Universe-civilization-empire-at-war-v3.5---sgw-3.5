import { bankCapacity, naturalIncome, unitProductionCost } from "./space-economy.js";
import { distance, generateGalaxy } from "./galaxy.js";
import { fleetPower, SHIPS } from "./fleet.js";
import { canResearch, researchCost } from "./research.js";

function assert(condition:boolean,message:string):void { if(!condition) throw new Error(message); }
export function runSpaceMmoTests():void {
 assert(unitProductionCost(10)===60000,"unit production formula failed");
 assert(naturalIncome(100,50)===6000,"natural income formula failed");
 assert(bankCapacity(6000)===432000,"bank capacity formula failed");
 const a=generateGalaxy({galaxies:1,systemsPerGalaxy:5,positionsPerSystem:15,seed:42});
 const b=generateGalaxy({galaxies:1,systemsPerGalaxy:5,positionsPerSystem:15,seed:42});
 assert(JSON.stringify(a)===JSON.stringify(b),"galaxy generation must be deterministic");
 assert(distance({galaxy:1,system:1,position:1},{galaxy:1,system:1,position:3})===200,"distance failed");
 assert(SHIPS.mothership.cost.naquadah===450000000,"mothership cost failed");
 assert(fleetPower({id:"f",ownerId:"p",ships:{fighter:10},cargo:0})===450,"fleet power failed");
 assert(canResearch({},"energy"),"energy research should be available");
 assert(!canResearch({},"weapons"),"weapons research should require prerequisites");
 assert(researchCost("energy",1).crystal===800,"research cost failed");
}
