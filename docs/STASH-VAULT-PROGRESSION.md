# Stash Vault Progression

## Vaults
- **Protected Vault:** secure storage for high-value materials, rare crafting components, keys, and selected protected items.
- **Inventory Vault:** general stash for resources, crafting materials, consumables, quest-adjacent supplies, and stackable items.
- **Equipment Vault:** gear-focused storage with filtering by slot, rarity, item level, temper level, masterwork rank, and commander binding.

## Provisional capacity progression
| Vault | Level 1 slots | Slots gained per level | Max level | Level 30 slots |
|---|---:|---:|---:|---:|
| Protected Vault | 20 | 10 | 30 | 310 |
| Inventory Vault | 60 | 20 | 30 | 640 |
| Equipment Vault | 24 | 12 | 30 | 372 |

Separate weight limits are included so a small number of heavy items can matter independently of slot count. Upgrade costs grow exponentially and are returned as previews; actual costs must be checked and deducted atomically on the authoritative server.

## Upgrade and storage behavior
- Upgrade preview shows current/next level, added slots, new capacity, costs, and facility prerequisite.
- Initial rule: required supporting facility level is `ceil(next vault level / 5)`.
- Stackable resources should merge only when item identity and binding/quality metadata match.
- Gear, rolled affixes, sockets, temper level, masterwork rank, and commander binding must be preserved exactly when moving between vaults.
- Locked items cannot move. Equipment items cannot be moved while equipped. Equipment Vault rejects unrelated item categories.
- Protected Vault is storage, not a deletion-proof or account-security guarantee. Server permissions and item transaction history remain necessary.
- All moves/upgrades need a transaction ID, idempotency protection, ownership validation, and rollback if either resource deduction or item transfer fails.

## Interface
Build a stash-style layout with tabs for Protected, Inventory, and Equipment; search; category/rarity/slot filters; sort; grid/list toggle; stack split/merge; multi-select move; compare gear; lock/unlock; and an upgrade panel. Always show used/available slots and weight, and warn before moving or splitting items that would exceed limits.

## Implementation status
`src/game/vault-progression.ts` contains capacity rules, upgrade cost previews, capacity validation, and transfer eligibility helpers. `src/components/views/StashVaultsView.tsx` now provides a client-side vault selector, capacity summaries, facility-gated upgrade previews, and a demo-only level change. The UI does not persist levels, deduct resources, or transfer real items. Server-backed inventory transactions, persistence/migration, ownership checks, and automated tests are still required before this is production-ready.
