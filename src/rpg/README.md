# RPG/MMORPG Combat and Item Framework

This module adds an engine-agnostic TypeScript gameplay layer to Universe Civilization. It keeps deterministic combat math and data definitions separate from React views and server persistence.

## Systems included
- Ten core attributes (STR, DEX, CON, INT, WIS, VIT, SPI, LCK, WIL, CHA) and derived combat/resource statistics.
- Hit checks, armor and resistance mitigation, PvE/PvP damage multipliers, critical hit caps, blocking, healing and threat.
- Timed buffs/debuffs, stack policies, DoT ticking, cleanse types, and crowd-control diminishing durations.
- Separate per-mode weapon/armor/trinket profiles and item-power valuation.
- Common/veteran/elite/champion/boss/raid/mythic/ascended enemy tiers, level/party/difficulty scaling, utility-scored ability selection, phases and enrage.
- Weighted loot rolls, uniqueness filters and pity thresholds.
- Example items, effects, enemies and loot tables to use as fixtures or seeds.

## Import
```ts
import { resolveDamage, deriveStats, STARTER_ITEMS } from "./rpg/index.js";
```

## Formula notes
- HP: `VIT * 15 + CON * 10 + gear HP`
- Physical power: `STR * 2.5 + DEX * 0.4`
- Hit chance: `clamp(accuracy / (accuracy + evasion), 0.05, 0.95)`
- Armor mitigation: `armor / (armor + K * attackerLevel)`, bounded to 85% (default K=75)
- Damage: raw × (1 − armor mitigation) × (1 − resistance), less flat resistance, then mode and crit modifiers.
- Boss HP and outgoing damage scale with level difference, party count and difficulty. HP intentionally scales faster than damage.
- Item power is a comparative balancing score, not currency price, character power, or an entitlement.
- PvP profiles normalize damage and cap crit, cooldown reduction, damage reduction and control effects.

## Authority and security
The browser may calculate previews only. Persistent PvP results, inventory ownership, item grants, trades, drops, currency and rewards must be verified and committed by the trusted server. Do not trust client-supplied stats, item prices, rolls, timestamps or damage results.

## Validation
The repository uses TypeScript 7 and bundler module resolution. Run `npm run lint` for the full project type check, and `npm run build` for the browser build. Existing project diagnostics may be unrelated to this module.

## Tempering and masterworking

- Tempering improves item profile stats through levels +1 to +10; higher levels have lower success chances and may downgrade on failure.
- Masterworking unlocks rank-specific stat multipliers and bonus stats from rank +1 to +5, gated by the item's item level.
- Both tracks spend currency and named materials. Optional protection materials prevent downgrade/damage outcomes on a failed attempt, but do not make the attempt succeed.
- Failed attempts still consume the listed cost. The state stores a history entry for server audit.
- `applyUpgradeBonuses(baseItem, state)` always computes from the original base item, avoiding repeated multiplication when recalculating previews.
- `repairUpgradedItem` supports repairable damaged states. Do not expose a client-controlled success roll in production: the server must generate the roll, verify inventory/currency, and save the resulting state in one transaction.

Example API:
```ts
import { attemptUpgrade, createCraftingUpgradeState, STARTER_ITEMS, DEFAULT_TEMPERING_CONFIG } from "./index.js";
const baseItem = STARTER_ITEMS[0];
const state = createCraftingUpgradeState(baseItem);
const result = attemptUpgrade({
  item: baseItem, state,
  wallet: { currency: 5000, materials: { "tempering-stone": 20 } },
  playerId: "player-123", track: "tempering",
  rules: DEFAULT_TEMPERING_CONFIG.levels[0], roll: 0.1, timestamp: 123456,
});
```
