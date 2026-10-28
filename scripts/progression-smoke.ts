import assert from 'node:assert/strict';
import {
  evaluateFeatureAccess,
  getFeatureDefinition,
  type ProgressionState,
} from '../src/game/progression';

const playerState: ProgressionState = {
  playerLevel: 1,
  buildingLevels: {},
  technologyLevels: {},
  completedQuestIds: new Set<string>(),
  unlockedFeatureIds: new Set<string>(),
  resources: {},
  isAdmin: false,
};

const construction = getFeatureDefinition('construction-yard');
assert.ok(construction, 'construction-yard feature should be registered');
assert.deepEqual(evaluateFeatureAccess(construction, playerState), {
  allowed: false,
  reasons: ['Reach player level 2 (current: 1).'],
});

const exactThresholdState: ProgressionState = {
  ...playerState,
  playerLevel: 2,
};
assert.deepEqual(evaluateFeatureAccess(construction, exactThresholdState), {
  allowed: true,
  reasons: [],
});

const shipyard = getFeatureDefinition('shipyard');
assert.ok(shipyard, 'shipyard feature should be registered');
const lockedShipyard = evaluateFeatureAccess(shipyard, { ...playerState, playerLevel: 3 });
assert.equal(lockedShipyard.allowed, false);
assert.ok(lockedShipyard.reasons.some((reason) => reason.includes('Upgrade shipyard to level 1')));

const turnEngine = getFeatureDefinition('turn-system');
assert.ok(turnEngine, 'turn-system feature should be registered');
assert.deepEqual(evaluateFeatureAccess(turnEngine, playerState), {
  allowed: false,
  reasons: ['Administrator permission required.'],
});
assert.deepEqual(evaluateFeatureAccess(turnEngine, { ...playerState, isAdmin: true }), {
  allowed: true,
  reasons: [],
});

console.log('Progression smoke checks passed: below threshold, exact threshold, building prerequisite, and admin-only feature.');
