# RPG Crafting Server API

The crafting subsystem is server-authoritative. Clients may request previews and upgrades, but the server owns validation, RNG, persistence, versioning, and audit history.

## Endpoints

All endpoints below are mounted beneath `/api/v1` and require the existing bearer-session middleware.

### `POST /crafting/preview`

Returns the deterministic cost and progression preview for tempering or masterworking.

The preview contains:

- `currentLevel`
- `nextLevel`
- `successChance`
- `currencyCost`
- required materials
- optional protection material

A preview does not consume resources and does not roll RNG.

### `POST /crafting/upgrade`

The client submits the item snapshot, upgrade state, wallet snapshot, track, and request ID. The server:

1. Confirms the authenticated player matches the request player.
2. Loads persisted upgrade state.
3. Rejects stale level/rank state.
4. Generates the random roll on the server.
5. Applies the tempering/masterworking rule.
6. Persists the new version using optimistic concurrency.
7. Appends an audit event.

The client cannot supply the random roll.

### `GET /crafting/:itemId/state`

Returns the persisted crafting state for the authenticated owner and item.

### `POST /crafting/repair`

Repairs a damaged upgraded item using a server-supplied repair rule. Persisted state is checked for staleness before the repair is committed.

## Persistence

`rpg_item_upgrade_state` stores the current state. `crafting_upgrade_audit` stores immutable upgrade/repair events. Both tables use InnoDB and are created by `database/migrations/001_crafting_upgrade.sql`.

The TypeScript adapter intentionally depends on a small `MySqlQueryExecutor` interface, so the project can use `mysql2/promise` or another MySQL-compatible driver without coupling the RPG domain layer to a specific driver package.

## Security requirements

Production callers should also enforce:

- item ownership from the authoritative inventory service;
- currency/material balances from the authoritative wallet/inventory service;
- item-level requirements before masterworking;
- one active crafting mutation per item/player where practical;
- request-id idempotency at the API gateway or command layer;
- audit retention and administrative review for suspicious crafting activity.

The current route layer establishes authentication, state versioning, server-side RNG, and audit persistence. Inventory and wallet mutation should be wired to the existing authoritative economy service before production deployment.

## Smoke test

Run:

```bash
npm run crafting:service:smoke
npm run crafting:http:smoke
npm run lint
```
