import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  evaluateFeatureAccess,
  getFeatureDefinition,
  type ProgressionState,
} from '../src/game/progression';
import {
  ADMIN_ONLY_ROUTES,
  MAX_COMMANDER_LEVEL,
  ROUTE_LEVEL_LOCKS,
  commanderLevelFromXp,
  getRouteUnlockLevel,
  getUnlockMilestoneLevels,
  isRouteUnlocked,
  xpForCommanderLevel,
} from '../src/game/levelLocks';
import {
  STORY_BEATS,
  STORY_CHAPTERS,
  getStoryBeatUnlocks,
  getStoryBeatsBetween,
} from '../src/game/storyCampaign';

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

// --- Commander level locks -------------------------------------------------

const read = (relativePath: string) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const sidebarSource = read('src/components/Sidebar.tsx');
const navSource = sidebarSource.slice(sidebarSource.indexOf('export const OGAME_NAV_SECTIONS'));
const sidebarItemIds = new Set(
  // Menu items are single-line `{ id, label }` objects; section headers span several lines.
  [...navSource.matchAll(/\{ *id: *'([^']+)', *label:/g)].map((match) => match[1]),
);
const appRouteIds = new Set(
  [...read('src/App.tsx').matchAll(/activeRoute === '([^']+)'/g)].map((match) => match[1]),
);
assert.ok(sidebarItemIds.size >= 100, `expected 100+ sidebar items, found ${sidebarItemIds.size}`);
assert.ok(appRouteIds.size >= 110, `expected 110+ App routes, found ${appRouteIds.size}`);

const lockedRoutes = new Set(ROUTE_LEVEL_LOCKS.map((entry) => entry.route));
const adminRoutes = new Set(ADMIN_ONLY_ROUTES);
assert.equal(lockedRoutes.size, ROUTE_LEVEL_LOCKS.length, 'level lock table has duplicate routes');
for (const route of lockedRoutes) {
  assert.ok(!adminRoutes.has(route), `${route} is both level-locked and admin-only`);
}

for (const route of [...sidebarItemIds, ...appRouteIds]) {
  assert.ok(
    lockedRoutes.has(route) || adminRoutes.has(route),
    `route "${route}" has no commander level lock and is not admin-only`,
  );
}
for (const route of lockedRoutes) {
  assert.ok(appRouteIds.has(route), `level lock for "${route}" does not match any App route`);
}

// Every level-locked route is also a registered player feature with the same level.
for (const entry of ROUTE_LEVEL_LOCKS) {
  const feature = getFeatureDefinition(entry.route);
  assert.ok(feature, `${entry.route} missing from FEATURE_PROGRESSION`);
  const levelReq = feature.requirements.find((req) => req.type === 'player-level');
  assert.equal(levelReq?.type === 'player-level' ? levelReq.minimum : 1, entry.level, `${entry.route} level mismatch`);
}

// Early-to-late ordering: economy before fleets before alliances before megastructures before multiverse.
const level = (route: string) => getRouteUnlockLevel(route);
assert.equal(level('dashboard'), 1);
assert.equal(level('resources'), 1);
assert.equal(level('missions'), 1, 'missions must stay open so the story log is always reachable');
assert.ok(level('construction-yard') < level('units'));
assert.ok(level('units') < level('alliances'));
assert.ok(level('alliances') < level('megastructures'));
assert.ok(level('megastructures') < level('universe'));
assert.ok(level('universe') < level('ascension'));

// Boundary checks: one below, exact, one above; admins bypass; unknown routes are open.
assert.equal(isRouteUnlocked('megastructures', 19), false);
assert.equal(isRouteUnlocked('megastructures', 20), true);
assert.equal(isRouteUnlocked('megastructures', 21), true);
assert.equal(isRouteUnlocked('megastructures', 1, true), true);
assert.equal(isRouteUnlocked('not-a-real-route', 1), true);
assert.deepEqual(evaluateFeatureAccess(construction, { ...playerState, playerLevel: 3 }), {
  allowed: true,
  reasons: [],
});

// XP curve is monotonic and round-trips through level lookup.
for (let lvl = 1; lvl < MAX_COMMANDER_LEVEL; lvl += 1) {
  assert.ok(xpForCommanderLevel(lvl + 1) > xpForCommanderLevel(lvl), `XP curve not increasing at ${lvl}`);
  assert.equal(commanderLevelFromXp(xpForCommanderLevel(lvl)), lvl);
  assert.equal(commanderLevelFromXp(xpForCommanderLevel(lvl + 1) - 1), lvl);
}
assert.equal(commanderLevelFromXp(0), 1);
assert.equal(commanderLevelFromXp(Number.MAX_SAFE_INTEGER), MAX_COMMANDER_LEVEL);

// --- Story campaign tied to unlock milestones --------------------------------

const milestones = getUnlockMilestoneLevels();
const beatLevels = STORY_BEATS.map((beat) => beat.level);
assert.deepEqual(beatLevels, milestones, 'every unlock milestone needs exactly one story beat, in level order');
assert.equal(new Set(STORY_BEATS.map((beat) => beat.id)).size, STORY_BEATS.length, 'duplicate story beat ids');
for (const beat of STORY_BEATS) {
  assert.ok(STORY_CHAPTERS.some((chapter) => chapter.id === beat.chapterId), `${beat.id} has unknown chapter`);
  assert.ok(getStoryBeatUnlocks(beat).length > 0, `${beat.id} unlocks nothing`);
  assert.ok(beat.text.length > 0 && beat.title.length > 0, `${beat.id} has no text`);
}
assert.deepEqual(getStoryBeatsBetween(0, 1).map((beat) => beat.level), [1]);
assert.deepEqual(getStoryBeatsBetween(4, 8).map((beat) => beat.level), [5, 6, 7, 8]);
assert.deepEqual(getStoryBeatsBetween(10, 11), []);

console.log(
  `Progression smoke checks passed: feature rules, ${ROUTE_LEVEL_LOCKS.length} level-locked routes ` +
    `(${sidebarItemIds.size} sidebar items, ${appRouteIds.size} App routes covered), ` +
    `${milestones.length} unlock milestones with ${STORY_BEATS.length} story beats.`,
);
