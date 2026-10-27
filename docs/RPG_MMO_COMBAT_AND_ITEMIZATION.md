# RPG/MMORPG Combat, Enemies, Effects, and Itemization

This design is the new RPG layer for **Universe Civilization: Empire at Wars**. The application remains a React/TypeScript galaxy strategy game; these modules add reusable RPG-style character, enemy, dungeon, boss, loot, and PvP/PvE balancing contracts without replacing the existing fleet-combat engine.

## Modules

- `src/rpg/types.ts`: strongly typed attributes, resources, items, effects, enemies, boss phases, loot tables, and encounter definitions.
- `src/rpg/formulas.ts`: deterministic hit/damage helpers, stat weights, caps, item power, threat, and party/difficulty scaling.
- `src/rpg/catalog.ts`: sample buffs/debuffs, mobs, elites, a phased boss, item examples, loot and encounter templates.
- `src/rpg/index.ts`: public exports.
- `scripts/rpg-framework-smoke.ts`: invariant-oriented smoke checks.

## Attribute model

Core attributes are persistent growth values: STR, DEX, CON, INT, WIS, VIT, SPI, LCK, WIL, and CHA. Derived stats cover offense, defense, tempo, control resistance, and healing. Resources include HP, MP, and stamina, with the type system intentionally extensible for rage, energy, focus, faith, aether, heat, or sanity.

## Effect model

Each status effect declares category, duration, stack policy, stack cap, optional stat modifiers, optional periodic tick values, cleanse type, and tags. Supported stack modes are:
- `none`: reject duplicate active instances.
- `refresh`: refresh the active duration.
- `additive`: increment stacks up to the cap.
- `replaceStrongest`: replace only when the new effect is stronger (runtime policy to implement).
- `independent`: keep independently timed instances.

Crowd control should use diminishing returns on both bosses and PvP targets. A suggested PvP sequence is 100%, 50%, 25%, then a temporary immunity window; duration and reset windows are balance configuration, not hard-coded universal truths.

## Enemy tiers and roles

Ranks: normal, veteran, elite, champion, boss, raid boss, mythic, ascended. Roles: bruiser, tank, assassin, sniper, caster, controller, summoner, support, and trickster. Add species/tags such as beast, construct, humanoid, undead, dragon, void, machine, and system-lord to drive encounter rules and resistances.

Encounter designers should tune HP more aggressively than damage to avoid high-level party one-shots. Example conceptual baselines from the project specification:
- Common mobs: 60–80% of a player baseline, one or two abilities.
- Veteran mobs: 120–150%, partial resistance, three to five abilities.
- Elites: 200–300%, crowd-control resistance and potential enrage.
- Bosses: phase-driven mechanics and mechanics that players can counter.

These are starting guidelines for balance tests, not guarantees for every combat mode.

## Boss phase mechanics

A boss phase supports a trigger (HP threshold, elapsed time, add count, objective), ability set, optional add spawns, arena hazards, resistance overrides, and phase damage multiplier. Bosses may also configure enrage delay/interval and party-size scaling.

Recommended encounter phases:
1. Establish baseline abilities and telegraph patterns.
2. Introduce adds or a shield mechanic.
3. Add arena hazards or rotate damage/resistance profile.
4. Enter an enrage/ultimate state with a clear telegraph and counterplay.

Do not make major unavoidable damage exceed the encounter's survivability budget. Telegraphs, positioning, interrupts, objectives, and recovery windows must be tested together.

## PvE / PvP itemization

Items use shared identity/metadata with separate `pve` and `pvp` tuning. PvE gear may contain boss bonuses, build synergies and proc effects. PvP gear should favor readable counterplay, capped burst, bounded healing, diminishing returns on crowd control, and fewer high-variance procs. A shared item does not imply identical effectiveness in both modes.

Equipment slots include head, chest, legs, gloves, boots, main/off-hand, two rings, amulet, cloak, belt and two trinkets. Rarities are common through ascended. Items can also model consumables, crafting material, quest item and cosmetic categories.

## Formula reference

These are starting formulas for tuning; calibrate them with test telemetry before production.

- Max HP: `max(1, VIT × 15 + CON × 10 + GearHP)`
- Hit chance: `clamp(Accuracy / max(1, Accuracy + Evasion), 0.05, 0.95)`
- Armor mitigation: `clamp(Armor / (Armor + K × AttackerLevel), 0, DRCap)`, default `K = 75`
- Stat value: `max(0, Stat) × StatWeight`, optionally softened by configured diminishing-return curves.
- Item power: weighted stat score × mode scale × mode damage modifier × (1 + applicable PvE boss bonus).
- Threat: `Damage × ThreatMultiplier + Healing × HealingWeight + FlatThreat`.
- Conceptual HP scaling from source specification: `BaseHP × (1 + LevelDiff × 0.18) × PartyMult × DifficultyMult`.
- Party HP multiplier: `1 + (Players − 1) × 0.65`.
- Conceptual damage scaling: `BaseDamage × (1 + LevelDiff × 0.12) × DifficultyMult`; this implementation uses a smaller party-damage slope to reduce one-shot risk.

Damage-type resistances and absorption require target-owned defense data and should be integrated in the authoritative combat pipeline; the current helper leaves that as an explicit runtime integration task. Do not treat the sample implementation as a production MMO server by itself.

## Loot and rewards

A loot table defines weighted entries, quantity bounds, number of rolls, optional currency range and optional pity rules. Runtime implementation must use a server-authoritative random seed, clamp weights and quantities, prevent negative payouts, and enforce unique/weekly/party-distribution rules server-side. Never let the browser client authorize rewards or currency.

## Difficulty and encounters

Supported tiers: normal, hard, nightmare, mythic, ascended and apocalypse. Encounter templates can describe open-world packs, dungeons, raids, story events and arenas, with recommended level, player limits, enemy groups, boss IDs, objectives, timer, and loot tables.

## Server-authoritative requirements

Before using this layer for competitive multiplayer:
1. Resolve damage, cooldowns, effect stacks, inventory, loot, and rewards on the trusted server.
2. Validate client requests, item ownership, target legality, level requirements, encounter membership and cooldowns.
3. Seed random outcomes on the server and log replay metadata.
4. Use idempotency keys for reward grants and persistence transactions.
5. Add integration tests for CC diminishing returns, immunity interactions, resistance overrides, shield absorption, loot weights/pity, death/reset behavior, and party scaling.
6. Keep PvP-specific caps distinct from PvE and tune through versioned configuration, never client-provided values.

## Smoke tests

Run after installing dependencies:

```bash
npx tsx scripts/rpg-framework-smoke.ts
```

These tests check catalog completeness and basic formula invariants. They are not a substitute for browser build, full lint, security review or live balance testing.
