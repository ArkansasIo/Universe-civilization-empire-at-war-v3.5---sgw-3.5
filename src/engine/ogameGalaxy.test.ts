import { strict as assert } from "node:assert";
import {
  OGAME_EXPEDITION_POSITION,
  OGAME_GALAXIES_PER_UNIVERSE,
  OGAME_PLANET_POSITIONS_PER_SYSTEM,
  OGAME_SYSTEMS_PER_GALAXY,
  createOGameGalaxyLayout,
  getOGameCoordinate,
  getOGameGalaxyIndex,
  getOGameSystem,
} from "./ogameGalaxy";

const layout = createOGameGalaxyLayout(1);
assert.equal(layout.galaxiesPerUniverse, 90);
assert.equal(layout.systemsPerGalaxy, 499);
assert.equal(layout.planetPositionsPerSystem, 15);
assert.equal(layout.expeditionPosition, 16);
assert.equal(layout.totalSystems, 90 * 499);
assert.equal(layout.totalPlanetSlots, 90 * 499 * 15);

for (const universeId of [1, 2, 23, 90]) {
  const index = getOGameGalaxyIndex(universeId);
  assert.equal(index.length, OGAME_GALAXIES_PER_UNIVERSE);
  assert.equal(index[0]!.firstSystemCoordinate, `${universeId}:1:1`);
  assert.equal(index[89]!.lastSystemCoordinate, `${universeId}:90:499`);
}

const system = getOGameSystem(7, 90, 499);
assert.equal(system.id, "u7-g90-s499");
assert.equal(system.slots.length, OGAME_PLANET_POSITIONS_PER_SYSTEM);
assert.ok(system.slots.every((slot) => slot.position >= 1 && slot.position <= 15));
assert.equal(system.expeditionPosition, OGAME_EXPEDITION_POSITION);

const repeat = getOGameSystem(7, 90, 499);
assert.deepEqual(system, repeat, "A coordinate must always resolve to the same generated system.");
assert.equal(getOGameCoordinate(7, 90, 499, 15), "7:90:499:15");

assert.throws(() => getOGameSystem(0, 1, 1), RangeError);
assert.throws(() => getOGameSystem(1, 91, 1), RangeError);
assert.throws(() => getOGameSystem(1, 1, 500), RangeError);
assert.throws(() => getOGameCoordinate(1, 1, 1, 17), RangeError);

console.log("OGame-style galaxy layout: all tests passed");
