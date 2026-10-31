# Gameplay Domain Foundation

This module adds a small, deterministic TypeScript domain layer that can be reused by the browser client and trusted server.

## Modules

- `types.ts`: shared resource, commander, planet, fleet and combat contracts.
- `factions.ts`: five playable faction definitions and racial bonus application.
- `economy.ts`: GDD workforce income, net income modifiers, resource credit and spending.
- `turns.ts`: 30-minute turn interval, storage limits and elapsed-turn calculations.
- `combat.ts`: deterministic baseline fleet-power resolution for tests and prototypes.
- `galaxy.ts`: deterministic coordinate-addressable star-system generation.

## Smoke test

Run with `npx tsx scripts/gameplay-foundation-smoke.ts`.

## Trust boundary

These functions are domain calculations, not an authorization or persistence layer. In a competitive deployment, the server must load the canonical player state, validate ownership and costs, serialize turn processing, execute combat, and persist all changes transactionally. Never accept client-submitted resource balances, battle winners, random rolls, turn counts, or ownership as authoritative.

## Integration status

The modules are intentionally isolated from existing UI routes and legacy services. Integrate them incrementally through server services and repository interfaces after contract and formula parity tests are in place. The combat function is a minimal deterministic baseline, not a complete tactical simulation; armor, shields, initiative, weapon types, targeting and salvage remain separate systems.
