# Engineering Next Steps

## Integration sequence

1. Add parity tests comparing these domain calculations with existing economy, turn and combat services.
2. Route all resource mutations through transactional server commands.
3. Add database-backed turn locks/idempotency keys to prevent duplicate tick execution.
4. Integrate seeded galaxy generation behind a server-owned world-seed service.
5. Replace baseline fleet resolution with the full tactical combat pipeline and replayable battle logs.
6. Connect domain services to existing UI screens without moving authority into the browser.
7. Run typecheck, production build, smoke suites, Android packaging and deployment checks before release.

## Release gates

- No duplicate turn grants under concurrent workers.
- No negative balances or partial resource deductions.
- Every command validates authenticated ownership and authorization.
- Same world seed and coordinates generate identical immutable system data.
- Combat and rewards are resolved and persisted atomically.
- Existing browser and Android clients remain compatible with versioned API contracts.
