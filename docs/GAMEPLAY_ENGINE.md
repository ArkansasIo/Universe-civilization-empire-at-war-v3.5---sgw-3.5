# Authoritative Gameplay Engine

The repository now contains a pure TypeScript gameplay-engine layer intended to become the authoritative server rules implementation.

## Services

### Resource transactions

`src/engine/resourceTransactions.ts`

Resource changes are applied as a single atomic transition. The service rejects unsupported resources, non-finite values, and transactions that would make a resource negative. Failed transactions return the original snapshot instead of a partially modified state.

```ts
const result = spendResources(resources, {
  naquadah: 500,
  metal: 100,
});
```

### Turn engine

`src/engine/turnEngine.ts`

Turn processing calculates workforce and colony income, consumes available attack turns, and grants the resulting Naquadah in one state transition. Turn accrual is capped by the configured maximum.

The default workforce model follows the existing game specification:

- Miner: 20 Naquadah per turn.
- Lifer: 80 Naquadah per turn.
- Colony production is added on top of workforce income.
- Default turn storage cap: 10,000.

### Combat engine

`src/engine/combatEngine.ts`

Combat resolution is deterministic. It calculates attacker and defender power, determines victory, calculates casualties, and derives loot from the defender's Naquadah balance.

Randomness is intentionally excluded from the authoritative resolver. If variance is added later, use a server-provided seed and persist the seed with the battle event so results remain replayable.

## Server-authority rule

The browser should use these functions for previews and UI calculations, but competitive state must ultimately be resolved by trusted server code. Never accept client-supplied final balances, battle results, role changes, or loot values.

## Testing

Run:

```bash
npm run engine:smoke
```

GitHub Actions also runs the deterministic engine smoke suite whenever engine code changes.

## Next implementation phase

1. Move the engine package into the backend runtime.
2. Add authenticated command endpoints.
3. Add idempotency keys to player commands.
4. Persist accepted commands and resulting state transitions.
5. Add database transactions around resource spending and combat settlement.
6. Add Firestore/MySQL integration tests before enabling authoritative multiplayer.
