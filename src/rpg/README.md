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
