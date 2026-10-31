# Implementation Worklist

## Completed in this pass
- [x] Deterministic galaxy generation scaffold.
- [x] Economy formulas: natural income, UP cost, bank capacity, turn clamping.
- [x] Fleet movement validation and travel calculation.
- [x] Research prerequisite/cost/time engine.
- [x] Stargate dial/cooldown engine.
- [x] Diplomacy state model.
- [x] Deterministic combat resolver scaffold.
- [x] GDD-based colony maintenance and empire income calculations.
- [x] Race/government modifier composition, blueprint efficiency, flagship power/fitting, and weapon durability/repair engines.
- [x] Authentication contracts, idempotency and rate-limit primitives.
- [x] MySQL migrations for game state, galaxy, planets, Stargates, research, combat and audit events.
- [x] Authoritative engine smoke test and CI integration.
- [x] Building, shipyard and research queue engine and service (in-memory; MySQL repository and HTTP routes still to do).

## Next implementation order
1. Replace remaining client-authoritative mutations with server commands.
2. Connect `src/server` command handlers to MySQL repositories and transactions.
3. Implement authentication/session persistence and authorization middleware.
4. Implement the 30-minute turn scheduler with row locking and catch-up rules.
5. Implement complete resource ledger and transaction/audit trail.
6. Persist deterministic galaxy generation and planet ownership.
7. Implement building queues, shipyard queues and research queues.
8. Implement fleet movement, Stargate travel, recall and interception.
9. Expand combat resolver into a versioned battle simulation with replay records.
10. Implement diplomacy, espionage, missions, alliances and market services.
11. Add WebSocket events, reconnect/resync and presence.
12. Add API integration tests and end-to-end player journeys.
13. Finish Android release signing, API configuration and device validation.
14. Add production observability, backups, migration tooling and rollback procedures.
15. Balance all races, technologies, ships, units, buildings and progression.

## Authoritative invariants
- Browser state is never trusted for resources, turns, units, fleets, research or combat.
- Every mutating command has an actor, validation, transaction boundary and audit event.
- Mutating requests should support idempotency keys.
- Combat and procedural generation must be deterministic from an explicit seed/version.
- Database writes use optimistic or pessimistic concurrency protection where state can race.
- Game configuration is versioned and server-owned.
