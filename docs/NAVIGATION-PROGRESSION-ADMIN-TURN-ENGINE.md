# Navigation, progression and turn-engine implementation checklist

Target repository: Universe Civilization: Empire at War v3.5  
Branch: feature/ogame-navigation-progression-admin-turns

## Confirmed from source inspection
- The current sidebar source contains 110 menu item IDs, all unique; earlier documentation saying 111 was inaccurate.
- The sidebar hides the Admin Systems section unless the profile/admin session is recognized as an administrator.
- The Turn Engine is listed inside Admin Systems.
- Player profiles have rank level and an optional player level.
- Existing technology prerequisites do not constitute a global feature-unlock policy.

## P0 — navigation correctness
- [x] Generate a source-based route inventory from `OGAME_NAV_SECTIONS` and compare IDs with route conditions in `src/App.tsx`.
- [x] Initial comparison found 110 unique sidebar item IDs and 117 distinct direct `activeRoute` conditions; `stash-vaults` was the only menu ID without a direct match.
- [x] Add `StashVaultsView` and wire `stash-vaults` into the main route renderer.
- [ ] Verify all remaining routes render their intended component/sub-tab; inspect aliases and route conditions not reachable from the sidebar.
- [ ] Exercise all menu items and confirm expected component and sub-tab.
- [ ] Test active section expansion, collapsed rail and mobile drawer.
- [ ] Add a safe fallback for unknown routes.

## P0 — turn engine must be administrator-only
- [x] Keep `turn-system` under Admin Systems in the sidebar.
- [x] Sidebar hides Admin Systems from non-admin profiles.
- [x] Add a route/render guard so non-admins cannot open `turn-system` by setting the active route directly (client-side guard; not a substitute for API authorization).
- [ ] Add server-side authorization to every turn-engine configuration or execution endpoint. UI hiding is not security.
- [ ] Verify roles from trusted server/session state; do not trust a client-provided `isAdmin` flag alone.
- [ ] Add tests proving normal players cannot view or invoke admin turn-engine actions; a progression smoke script now checks the admin-only feature rule, but server endpoint authorization tests remain outstanding.
- [ ] Keep turn processing separate from its admin-only management UI: game turns may need to continue for all players, while only admins can inspect/configure the engine.

## P0 — shared progression rules
- [x] Add typed, data-driven feature requirement evaluator in `src/game/progression.ts`.
- [x] Connect commander level locks to every page (sidebar badges + route guard); see `docs/LEVEL_LOCKS_AND_STORY.md`. Gameplay actions are not yet gated.
- [ ] Use the same requirement definitions in server command handlers; reject locked actions server-side.
- [ ] Persist levels, quests, buildings, technologies and unlocks in authoritative storage.
- [x] Show lock reason, current value, required value and path to unlock (`LevelLockedPanel`).
- [ ] Balance final requirements; starter thresholds are provisional.

## P1 — systems integration
- [ ] Resources -> construction -> research -> shipyard -> fleets.
- [ ] Colony development, power, storage, food/water and population.
- [ ] Equipment, tempering, masterworking, material costs and upgrade caps.
- [ ] Stargate travel, exploration, expeditions, raids and megastructures.
- [ ] Alliance, market, commander and mission progression.
- [ ] Admin controls with role checks and audit logging.

## P1 — automated verification
- [ ] Automated route coverage for every sidebar item, including the newly wired `stash-vaults` route.
- [x] Add `scripts/progression-smoke.ts` covering below-threshold, exact-threshold, building prerequisite, and admin-only feature access.
- [x] Add progression boundary tests one level above the requirement and tests for unknown/missing state (level-lock checks in `scripts/progression-smoke.ts`).
- [ ] Missing-state and unknown-feature tests.
- [ ] Direct-route and direct-API bypass tests.
- [ ] Run `npm run lint`, `npm run build`, `npm run progression:smoke`, and existing smoke tests in CI; not yet verified on the current main commit.
- [ ] Test mobile navigation and admin/non-admin sessions separately.

## Important distinction
The feature registry is a foundation, not proof that all 111 pages are integrated. Its sample thresholds are placeholders. Do not call progression complete until route rendering, server mutations, persistence and tests all use shared rules.


## Latest update — 2026-10-28
- GitHub Pages TypeScript validation is now blocking (`npm run lint` must pass); the README CI note was updated to match.
- Added `src/components/views/StashVaultsView.tsx` with vault tabs, capacity summaries, facility-gated upgrade previews, and explicit demo-only/non-persistent warnings.
- Wired `stash-vaults` into `src/App.tsx`.
- Not yet verified: fresh TypeScript check, production build, GitHub Pages run, Vercel deployment, and browser-level route testing. Vercel status currently reports a build-rate limit.


## Latest implementation update — 2026-10-28
- Added the stash vault UI and connected `stash-vaults` to the app route renderer.
- Added a client-side admin guard around the `turn-system` render path. This prevents ordinary UI navigation from rendering the management view, but trusted server-side authorization is still required for any API or mutation endpoint.
- Added `scripts/progression-smoke.ts` and the `npm run progression:smoke` script for basic progression/admin rule checks.
- Validation status: source changes are committed to `main`; no successful fresh lint/build/smoke run has been confirmed in this work session.
