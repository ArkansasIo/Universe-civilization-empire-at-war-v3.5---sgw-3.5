# Repository Engineering Roadmap

This document records the next engineering steps for Universe Civilization: Empire at War (SGW 3.5). It distinguishes deployed web previews from verified application correctness and outlines a practical path from a browser prototype to a maintainable game service.

## Current repository shape

- **Web client:** React, TypeScript, Vite, and Tailwind CSS.
- **Deployment:** GitHub Pages workflow builds `dist/` and publishes the static application.
- **Mobile packaging:** Android project and a GitHub Actions debug-APK workflow.
- **Game systems:** turn processing, economy, combat, technology, colonies, fleets, Stargates, motherships, and administrative views.
- **Persistence:** browser-local state with Firebase Authentication and Firestore integration.
- **Design references:** `GDD.md`, `API_AND_DATA_SPEC.md`, `API_CONTRACT.md`, `ARCHITECTURE_UML.md`, and `docs/`.

## Priority 0 — release correctness

1. Keep the Pages deployment reproducible and verify that the generated entry point and referenced assets exist.
2. Make TypeScript checking a required status check once existing type errors are resolved; do not interpret a green deploy as proof that type-checking passed while the gate is non-blocking.
3. Pin and consistently use the package manager and lockfile in CI. Prefer `npm ci` with a committed `package-lock.json` over an unconstrained install.
4. Add automated unit tests for resource transactions, turn processing, combat calculations, colony maintenance, and save-data migration.
5. Add a smoke test that opens the built page and confirms the React root mounts without a browser exception.

## Priority 1 — server-authoritative game state

A static Pages deployment is suitable for a client preview, but it cannot host a persistent authoritative MMO simulation by itself. Move competitive state transitions to a server API:

- authenticate requests and derive the player ID from the verified session;
- validate every command at the API boundary;
- perform resource spending, combat resolution, and turn processing in server transactions;
- use idempotency keys for retryable player commands;
- record an append-only audit/event trail for economic and administrative operations;
- apply rate limits and per-player authorization checks;
- make scheduled turn advancement resilient to duplicate workers and missed ticks.

The browser may predict and animate outcomes, but the server must determine final balances, ownership, battle results, and rankings.

## Priority 2 — data integrity and persistence

- Define versioned schemas for profiles, resources, colonies, fleets, research, market orders, and migrations.
- Validate numeric values as finite and non-negative where appropriate; enforce maximums and integer constraints for discrete units and turns.
- Prevent clients from assigning privileged roles or admin permissions.
- Add migration tests for older local-save versions and a documented export/import format.
- Test Firestore rules with an emulator suite before publishing rule changes.
- Avoid storing secrets in client code or static configuration. Public Firebase configuration is not a secret, but authorization must be enforced by Security Rules and trusted server code.

## Priority 3 — gameplay services

Implement and test these as independent modules with explicit inputs and outputs:

1. **Economy:** income calculation, upkeep, bank/vault transfers, market settlement, and resource caps.
2. **Turns:** turn accrual, storage limits, scheduled processing, and idempotent command handling.
3. **Colony management:** colonization, planet slots, maintenance, specialization, and abandonment.
4. **Fleet and combat:** travel timing, fleet composition, attack eligibility, deterministic battle resolution, casualties, and debris.
5. **Research and production:** prerequisites, queues, costs, cancellation/refunds, and completion timestamps.
6. **Alliance services:** membership roles, shared operations, territory control, and permissioned alliance actions.
7. **Admin operations:** audited moderation, ban/appeal workflows, configuration changes, and least-privilege access.

## Priority 4 — user experience

- Make all major views usable at mobile widths and with keyboard navigation.
- Provide loading, empty, offline, permission-denied, and recoverable-error states.
- Avoid blocking a local session on optional backend connectivity.
- Expose game version, save status, server status, and the last successful synchronization time.
- Add accessible labels and focus states to command panels, modals, and icon-only controls.

## Definition of done

A feature is ready to merge when it has:
- a documented rule and data contract;
- tests for success, boundary, and rejected-command cases;
- authorization validation for server-owned changes;
- a visible recoverable UI error path;
- updated GDD/API documentation where behaviour changed;
- successful build and required CI checks.

## Known distinction

The GitHub Pages workflow currently treats `npm run lint` as non-blocking. That is a temporary preview gate, not a claim that the TypeScript project passes type-checking. Keep this caveat explicit until a clean type-check can be enforced.
