# Navigation, progression and turn-engine implementation checklist

Target repository: Universe Civilization: Empire at War v3.5  
Branch: feature/ogame-navigation-progression-admin-turns

## Confirmed from source inspection
- The sidebar declares 111 menu item IDs.
- The sidebar hides the Admin Systems section unless the profile/admin session is recognized as an administrator.
- The Turn Engine is listed inside Admin Systems.
- Player profiles have rank level and an optional player level.
- Existing technology prerequisites do not constitute a global feature-unlock policy.

## P0 — navigation correctness
- [ ] Generate a route inventory from `OGAME_NAV_SECTIONS`.
- [ ] Compare every menu ID with the route renderer; report missing, duplicate and unreachable routes.
- [ ] Exercise all menu items and confirm expected component and sub-tab.
- [ ] Test active section expansion, collapsed rail and mobile drawer.
- [ ] Add a safe fallback for unknown routes.

## P0 — turn engine must be administrator-only
- [x] Keep `turn-system` under Admin Systems in the sidebar.
- [x] Sidebar hides Admin Systems from non-admin profiles.
- [ ] Add a route/render guard so non-admins cannot open `turn-system` by setting the active route directly.
- [ ] Add server-side authorization to every turn-engine configuration or execution endpoint. UI hiding is not security.
- [ ] Verify roles from trusted server/session state; do not trust a client-provided `isAdmin` flag alone.
- [ ] Add tests proving normal players cannot view or invoke admin turn-engine actions.
- [ ] Keep turn processing separate from its admin-only management UI: game turns may need to continue for all players, while only admins can inspect/configure the engine.

## P0 — shared progression rules
- [x] Add typed, data-driven feature requirement evaluator in `src/game/progression.ts`.
- [ ] Connect evaluator to every page and gameplay action.
- [ ] Use the same requirement definitions in server command handlers; reject locked actions server-side.
- [ ] Persist levels, quests, buildings, technologies and unlocks in authoritative storage.
- [ ] Show lock reason, current value, required value and path to unlock.
- [ ] Balance final requirements; starter thresholds are provisional.

## P1 — systems integration
- [ ] Resources -> construction -> research -> shipyard -> fleets.
- [ ] Colony development, power, storage, food/water and population.
- [ ] Equipment, tempering, masterworking, material costs and upgrade caps.
- [ ] Stargate travel, exploration, expeditions, raids and megastructures.
- [ ] Alliance, market, commander and mission progression.
- [ ] Admin controls with role checks and audit logging.

## P1 — automated verification
- [ ] Route coverage for every sidebar item.
- [ ] Progression boundary tests: one level below, exact requirement and above.
- [ ] Missing-state and unknown-feature tests.
- [ ] Direct-route and direct-API bypass tests.
- [ ] Run `npm run lint`, `npm run build` and existing smoke tests.
- [ ] Test mobile navigation and admin/non-admin sessions separately.

## Important distinction
The feature registry is a foundation, not proof that all 111 pages are integrated. Its sample thresholds are placeholders. Do not call progression complete until route rendering, server mutations, persistence and tests all use shared rules.
