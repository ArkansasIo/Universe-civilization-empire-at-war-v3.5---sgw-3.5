import assert from 'node:assert/strict';
import {
  applyResourceDelta,
  processTurns,
  resolveCombat,
} from '../src/engine/index';

const baseResources = {
  naquadah: 1000,
  bankedNaquadah: 0,
  metal: 0,
  crystal: 0,
  deuterium: 0,
  energy: 100,
  maxEnergy: 100,
  attackTurns: 10,
  untrainedUnits: 0,
  miners: 10,
  lifers: 2,
  unitProduction: 0,
  attackUnits: 100,
  defenseUnits: 50,
  spies: 0,
  antiSpies: 0,
  superUnits: 0,
};

const spend = applyResourceDelta(baseResources, { naquadah: -500, metal: 100 });
assert.equal(spend.ok, true);
assert.equal(spend.resources.naquadah, 500);
assert.equal(spend.resources.metal, 100);

const rejected = applyResourceDelta(baseResources, { naquadah: -1001 });
assert.equal(rejected.ok, false);
assert.equal(rejected.resources.naquadah, 1000);

const turnResult = processTurns(baseResources, [], 3);
assert.equal(turnResult.processedTurns, 3);
assert.equal(turnResult.resources.attackTurns, 7);
assert.equal(turnResult.generatedNaquadah, 2880); // 3 * ((10 miners * 80) + (2 lifers * 80))
assert.equal(turnResult.resources.naquadah, 3880);

const battle = resolveCombat(
  { id: 'attacker', attack: 20, defense: 10, units: 100 },
  { id: 'defender', attack: 10, defense: 10, units: 50 },
  10000,
);
assert.equal(battle.victory, true);
assert.equal(battle.loot, 2500);
assert.equal(battle.turnsSpent, 1);
assert.ok(battle.attackerCasualties >= 0);
assert.ok(battle.defenderCasualties > 0);

console.log('Engine smoke tests passed.');
