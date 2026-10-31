import assert from "node:assert/strict";
import { applyFactionBonus, calculateNaturalIncome, calculateNetTurnIncome, consumeTurns, generateSystem, resolveFleetCombat } from "../src/gameplay/domain/index";
assert.equal(applyFactionBonus(100, "asgard", "technology"), 125);
assert.equal(calculateNaturalIncome({ untrained: 10, miners: 2, lifers: 1 }), 440);
assert.equal(calculateNetTurnIncome({ untrained: 10, miners: 2, lifers: 1 }, { maintenance: 40 }), 400);
assert.equal(consumeTurns({ stored: 10, lastProcessedAt: 0 }, 3).stored, 7);
assert.deepEqual(generateSystem("seed", 1, 1), generateSystem("seed", 1, 1));
assert.equal(resolveFleetCombat([{ unitId: "a", quantity: 10, attack: 5, hull: 20 }], [{ unitId: "d", quantity: 1, attack: 2, hull: 10 }]).winner, "attacker");
console.log("Gameplay foundation smoke checks passed.");
