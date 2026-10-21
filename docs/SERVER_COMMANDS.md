# Server Command Layer

The game now has a deterministic command boundary in `src/server/gameCommands.ts`.

## Commands

- `process-turn` — consumes available attack turns and applies natural Naquadah income.
- `purchase` — validates quantity, calculates total cost, atomically spends resources, and grants inventory.
- `attack` — resolves deterministic combat, consumes attack turns, applies attacker casualties, and grants loot.
- `research` — atomically pays a research cost and increments a technology level.
- `fleet` — optionally pays a resource cost and increments a fleet quantity.

## Security boundary

The command service accepts an `AuthenticatedPrincipal`. The player state is loaded using `principal.userId`; clients do not supply a trusted player ID. Production HTTP/Firebase handlers should verify the Firebase ID token before constructing the principal.

## Idempotency

Every command requires a `commandId` and `idempotencyKey`. A repeated idempotency key returns the original result instead of applying the mutation again. The included `InMemoryIdempotencyStore` is for tests only.

Production storage must persist the idempotency key, event, and state mutation transactionally. Firestore transactions or a relational database transaction are appropriate implementations.

## State versioning

Every accepted command increments `GameState.version`. A production persistence adapter should add an optimistic-concurrency check so two commands cannot overwrite each other with stale state.

## Testing

```bash
npm run engine:smoke
npm run game:command:smoke
```

The GitHub Actions engine workflow runs both suites on changes to the engine, server command layer, package scripts, or smoke tests.

## Next backend integration

1. Verify Firebase authentication and map the token subject to `AuthenticatedPrincipal`.
2. Implement a transactional Firestore state adapter.
3. Persist an append-only command/event ledger.
4. Add optimistic version checks and retry handling.
5. Expose HTTPS endpoints for the five commands.
6. Add integration tests against an emulator/database transaction layer.
