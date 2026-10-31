import assert from 'node:assert/strict';
import { GOVERNMENTS, RACES } from '../src/gameData';
import {
  blueprintManufacturingSeconds,
  blueprintMaterialCost,
  calculateEmpireIncome,
  calculateFactionModifiers,
  calculateFlagshipPowerGrid,
  calculateColonyMaintenance,
  degradeWeaponDurability,
  fitFlagshipWeapon,
  repairWeapon,
} from '../src/engine';
import type { PlanetColony, PlayerResources, PlayerWeapon } from '../src/types';

const resources: PlayerResources = {
  naquadah: 100_000,
  bankedNaquadah: 0,
  metal: 10_000,
  crystal: 10_000,
  deuterium: 10_000,
  energy: 100,
  maxEnergy: 100,
  attackTurns: 10,
  untrainedUnits: 1,
  miners: 10,
  lifers: 2,
  unitProduction: 0,
  attackUnits: 0,
  defenseUnits: 0,
  spies: 0,
  antiSpies: 0,
  superUnits: 0,
};

function colony(overrides: Partial<PlanetColony> = {}): PlanetColony {
  return {
    id: 'colony-1',
    name: 'Test Colony',
    coordinate: '1:1:1',
    biome: 'temperate',
    level: 1,
    incomeBonus: 0,
    defenseBonus: 0,
    jumpGateLevel: 0,
    naquadahProductionRate: 5_000,
    ...overrides,
  };
}

const testColony = colony({ level: 2, isHomeworld: true, specialization: 'mining', taxPolicy: 'extractive' });
const maintenance = calculateColonyMaintenance(testColony, 3);
const expectedMaintenance = Math.max(
  1200,
  Math.round((2 * 2500 + Math.pow(2, 1.45) * 850) * 0.75 * 1.08 * 0.9 * 0.85),
);
assert.equal(maintenance.maintenance, expectedMaintenance);
assert.equal(maintenance.grossTribute, 5_000);

const income = calculateEmpireIncome(resources, [colony()], { race: 1.25, defcon: 1.1 });
assert.equal(income.workforceIncome, 980);
assert.equal(income.grossIncome, 5_980);
assert.equal(income.totalMaintenance, 3_350);
assert.equal(income.netIncome, Math.floor((5_980 - 3_350) * 1.25 * 1.1));

const race = RACES.find((entry) => entry.id === 'goauld');
const government = GOVERNMENTS.find((entry) => entry.id === 'democracy');
assert.ok(race && government);
const faction = calculateFactionModifiers(race, government);
assert.equal(faction.economy, race.incomeModifier * government.economyModifier);
assert.equal(faction.attack, race.attackModifier * government.militaryModifier);

assert.deepEqual(
  blueprintMaterialCost({ metal: 101, crystal: 10 }, { materialEfficiency: 10, timeEfficiency: 20 }),
  { metal: 91, crystal: 9 },
);
assert.equal(blueprintManufacturingSeconds(100, { materialEfficiency: 10, timeEfficiency: 20 }), 80);
assert.throws(
  () => blueprintMaterialCost({ metal: 100 }, { materialEfficiency: 10.1, timeEfficiency: 0 }),
  /INVALID_MATERIAL_EFFICIENCY/,
);

const allocation = {
  bridge: 10,
  reactor: 20,
  'spinal-lance': 15,
  deflector: 15,
  'carrier-bays': 10,
  'nanite-hull': 10,
  'tachyon-sensors': 10,
  'auxiliary-capacitors': 10,
} as const;
const grid = calculateFlagshipPowerGrid(120, allocation);
assert.equal(grid.allocated, 100);
assert.equal(grid.reserve, 20);
assert.equal(grid.efficiency.reactor, 20 / 120);
assert.throws(() => calculateFlagshipPowerGrid(99, allocation), /POWER_CAPACITY_EXCEEDED/);
const fitted = fitFlagshipWeapon([{ id: 'hp-1', capacity: 100 }], 'hp-1', 'lance', 80);
assert.deepEqual(fitted[0], { id: 'hp-1', capacity: 100, weaponId: 'lance', weaponPower: 80 });
assert.throws(() => fitFlagshipWeapon(fitted, 'hp-1', 'cannon', 10), /HARDPOINT_OCCUPIED/);

const weapon: PlayerWeapon = { id: 'weapon-1', weaponTypeId: 'railgun', quantity: 1, durability: 50 };
assert.equal(degradeWeaponDurability([weapon], 3)[0].durability, 47);
const repaired = repairWeapon(resources, weapon, 100, { naquadah: 2, metal: 1 });
assert.equal(repaired.ok, true);
assert.equal(repaired.weapon.durability, 100);
assert.equal(repaired.resources.naquadah, 99_900);
assert.equal(repaired.resources.metal, 9_950);
const rejectedRepair = repairWeapon({ ...resources, metal: 0 }, weapon, 100, { naquadah: 2, metal: 1 });
assert.equal(rejectedRepair.ok, false);
assert.equal(rejectedRepair.weapon.durability, weapon.durability);

console.log('missing game logic smoke: PASS');
