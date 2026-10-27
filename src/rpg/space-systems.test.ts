import { strict as assert } from "node:assert";
import { SHIPS, fleetPower } from "./fleet.js";
import { shipCost, shipBuildTime, queueShips } from "./fleet-production.js";
import { moonCreationChance } from "./moons.js";
import { espionageChance } from "./espionage.js";

const fleet={id:"f",ownerId:"p",ships:{scout:10,fighter:5},cargo:0};
assert.equal(fleetPower(fleet),10*SHIPS.scout.attack+5*SHIPS.fighter.attack);
assert.equal(shipCost("fighter",2).metal,1600);
assert.equal(shipBuildTime("fighter",2,2),60);
assert.equal(queueShips("p","fighter",2,2,1000).quantity,2);
assert.equal(moonCreationChance({debrisMetal:1_000_000,debrisCrystal:1_000_000}),2);
assert.ok(espionageChance(10,5)>espionageChance(5,10));
console.log("space systems smoke tests passed");
