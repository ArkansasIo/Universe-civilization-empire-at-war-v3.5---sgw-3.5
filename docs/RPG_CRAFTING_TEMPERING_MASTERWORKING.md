# RPG/MMORPG Crafting: Tempering and Masterworking

## System model

Equipment has two independent upgrade tracks:

- **Tempering**: levels `+1` through `+10`. It primarily increases the existing PvE/PvP item profile.
- **Masterworking**: ranks `1` through `5`. It is an endgame progression layer that adds a rank multiplier and a defined bonus stat.

The upgrade state is separate from the base `ItemDefinition`, so previews and recalculation can always start from immutable base item data.

## Tempering progression

| Level | Success | Multiplier | Failure |
|---:|---:|---:|---|
| +1 | 100% | 1.03x | retain |
| +2 | 95% | 1.06x | retain |
| +3 | 90% | 1.09x | retain |
| +4 | 85% | 1.12x | downgrade 1 |
| +5 | 80% | 1.16x | downgrade 1 |
| +6 | 72% | 1.20x | downgrade 1 |
| +7 | 65% | 1.25x | downgrade 2 |
| +8 | 58% | 1.30x | downgrade 2 |
| +9 | 50% | 1.36x | downgrade 2 |
| +10 | 42% | 1.43x | downgrade 3 |

Protection materials prevent the configured downgrade outcome. They are still consumed on a failed protected attempt.

## Masterworking progression

| Rank | Item level | Success | Multiplier | Bonus |
|---:|---:|---:|---:|---|
| 1 | 10 | 85% | 1.05x | +10 physical power |
| 2 | 20 | 75% | 1.10x | +20 physical power |
| 3 | 30 | 65% | 1.16x | +1% crit chance |
| 4 | 40 | 55% | 1.23x | +35 physical power |
| 5 | 50 | 45% | 1.32x | +5% crit damage |

Masterworking is intentionally gated by item level. The server should validate the item and ownership before accepting an attempt.

## Materials

The material catalog includes tempering stones, refined ore, star metal, astral cores, primordial ingots, void crystals, masterwork cores, world-boss hearts, warding runes, greater warding runes, masterwork seals, and repair kits.

## Server authority

The client may request an upgrade and display a preview, but it must not decide the outcome. A production server should:

1. Load the item, upgrade state, inventory, and currency inside one transaction.
2. Validate ownership, item lock state, item level, upgrade level, recipe, and material quantities.
3. Generate the random roll server-side using the game's authoritative RNG service.
4. Consume currency/materials atomically.
5. Apply the success/failure state transition.
6. Append the audit history entry.
7. Persist the item and inventory in the same transaction.
8. Emit an immutable crafting event for analytics or anti-cheat review.

Never trust a client-submitted `roll` value in a live MMO.

## Source files

- `src/rpg/tempering.ts` — upgrade rules, state machine, stat application, repair, cost calculation.
- `src/rpg/masterworking.ts` — masterwork rank summaries and previews.
- `src/rpg/crafting-materials.ts` — material definitions and validation helpers.
- `src/rpg/crafting.ts` — unified crafting preview and server facade.
- `src/rpg/crafting.test.ts` — subsystem smoke tests.
