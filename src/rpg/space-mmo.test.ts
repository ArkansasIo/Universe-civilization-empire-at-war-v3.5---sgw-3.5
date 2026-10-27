import { describe, expect, it } from "vitest";
import { bankCapacity, naturalIncome, unitProductionCost } from "./space-economy.js";
import { distance, generateGalaxy } from "./galaxy.js";
import { fleetPower, SHIPS } from "./fleet.js";
import { canResearch, researchCost } from "./research.js";

describe("OGame-style space RPG systems",()=>{
 it("uses the documented economy formulas",()=>{expect(unitProductionCost(10)).toBe(60000);expect(naturalIncome(100,50)).toBe(6000);expect(bankCapacity(6000)).toBe(432000);});
 it("generates deterministic galaxies",()=>{const a=generateGalaxy({galaxies:1,systemsPerGalaxy:5,positionsPerSystem:15,seed:42});const b=generateGalaxy({galaxies:1,systemsPerGalaxy:5,positionsPerSystem:15,seed:42});expect(a).toEqual(b);});
 it("calculates coordinate distance",()=>{expect(distance({galaxy:1,system:1,position:1},{galaxy:1,system:1,position:3})).toBe(200);});
 it("exposes fleet power and mothership",()=>{expect(SHIPS.mothership.cost.naquadah).toBe(450000000);expect(fleetPower({id:"f",ownerId:"p",ships:{fighter:10},cargo:0})).toBe(450);});
 it("enforces research prerequisites",()=>{expect(canResearch({},"energy")).toBe(true);expect(canResearch({},"weapons")).toBe(false);expect(researchCost("energy",1).crystal).toBe(800);});
});
