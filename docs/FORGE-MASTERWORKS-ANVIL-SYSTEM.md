# Forge & Masterworks Anvil — Expanded System Specification

Status: design and data-catalog foundation. The 90-module taxonomy is committed in `src/rpg/forge-module-catalog.ts`; it is not yet equipped as a player-owned module system or wired into authoritative item calculations.

## Facility identity

The **Forge & Masterworks Anvil** is a multi-station crafting facility for RPG/MMORPG equipment. Use an original industrial-cosmic art direction: blackened steel, slate panels, blueprint lines, heated amber metal, cyan research indicators, and a central anvil/forge schematic. Do not copy EVE Online art, logos, or exact UI. The adjacent manufacturing interface should be titled **Blueprints and Research Lab**.

## 90-module framework

There are 10 module classes × 3 subclasses × 3 subtype variants = 90 distinct definitions.

| Class | Subclasses | Focus |
|---|---|---|
| Tempering | Thermal Hammer, Phase Quench, Grain Refiner | Temper strength and heat |
| Masterworking | Astral Crucible, Master Seal, Perfecting Die | Rank yield and failure stability |
| Runes | Warding Glyph, Runic Conduit, Glyph Scribe | Protection and rune efficiency |
| Affixes | Edge Etcher, Suffix Loom, Prefix Lens | Prefix/suffix quality and rerolls |
| Socketing | Socket Borer, Gem Resonator, Prismatic Clamp | Sockets and gem compatibility |
| Reforging | Molecular Recast, Pattern Memory, Trait Reclaimer | Trait retention and material recovery |
| Salvage | Remains Separator, Scrap Magnet, Core Extractor | Material/remains yield |
| Stability | Flux Dampener, Lattice Brace, Resonance Sink | Heat and downgrade mitigation |
| Automation | Queue Governor, Batch Loader, Predictive Calibrator | Queue, batches, forecasting |
| Attunement | Faction Harmonizer, Elemental Lens, Void Tuner | Faction/element/void synergy |

Every definition carries a stable ID, class, subclass, type, subtype, tier 1–9, slot type, forge and masterwork unlock requirements, stat subset, tags/subsets, mechanic description, and drawback. Unlock levels are provisional tuning values and should be validated against the economy before release.

## Module slots and loadouts

- Utility slot: low-tier quality-of-life or narrow specialization module.
- Matrix slot: mid-tier stat or recipe specialization module.
- Core slot: high-tier, build-defining module.
- Initial target: 3 utility, 2 matrix, and 1 core slot per forge loadout. These are design targets, not enforced inventory rules yet.
- Prevent duplicate unique effects within a loadout unless a module explicitly supports stacking.
- Store module ownership, installation, durability/charges, unlock source, and loadout selection per player on the server. Client state must not be authoritative.
- Provide presets: Safe Temper, High Yield, Masterwork, Affix Control, Salvage, and Research Efficiency.

## Core crafting tracks

### Tempering (levels 1–100)
Raises base equipment output. Each attempt has a displayed success chance, resource/material cost, cycle time, and failure policy. Early tiers retain level on failure; later tiers may downgrade. Warding materials mitigate configured failure outcomes but do not silently guarantee success.

### Masterworking (ranks 1–100)
Unlocks after tempering prerequisites. Improves the quality ceiling and may add a bounded secondary stat. Rank 1–10 should teach the system; 11–40 enables build specialization; 41–70 requires rare materials and group content; 71–100 is prestige/endgame. Keep each rank's cost and power gain explicit.

### Affixes and sockets
- Affix families: prefix, suffix, implicit, crafted, and unique.
- Affix groups: offense, defense, resource, utility, exploration, faction, and crafting.
- Enforce one-per-group limits where required; do not permit rerolls to create illegal duplicate affixes.
- Sockets have shape/type, capacity, gem family, compatibility tags, and a removal cost.
- Socketing and affix rerolls must preview old/new stats and show which properties are retained or lost.

### Reforging and salvage
- Reforge recipes define exact inputs, outputs, item family, allowed rarity, and retained-trait rules.
- Salvage preview is deterministic and shown before confirmation.
- Salvage destroys the source item; unique-bound materials cannot be duplicated.
- Record an immutable operation history: player, item, recipe, inputs, outputs, roll, timestamp, and result.

## Mechanics and formulas (provisional)

Use server-authoritative deterministic calculations. Let (L) be the target level and (T) the module tier.

- Temper success target: `clamp(baseChance - 0.004 × max(0, L - 20) + stabilityBonus, 0.08, 0.95)`.
- Masterwork success target: `clamp(0.90 - 0.008 × (L - 1) + stabilityBonus, 0.05, 0.90)`.
- Module stat contribution target: `moduleValue × (1 + 0.05 × (T - 1))`, then apply class-specific diminishing returns.
- Cost growth: `round(baseCost × growthRate^(L - 1))`; choose growth rates from simulation, not UI convenience.
- Total stat output must use one documented order: base item → rarity → temper → masterwork → legal affixes → sockets/gems → modules → conditional attunement → final caps.
- Apply explicit per-stat and total-power caps. Do not stack raw percentage multipliers without bounds.
- Display exact probability and expected cost to next success; do not imply an outcome is guaranteed when it is random.
- Use seeded server rolls for reproducibility and audit; never accept a client-provided roll.

These formulas are starting balance targets, not final balance. The existing implementation currently has provisional 100-level temper/masterwork tables; align them with the above only after regression tests and economy simulation.

## Blueprint and research loop

The separate **Blueprints and Research Lab** should provide:
1. Blueprint Library — search by item family, class, rarity, tech tier, faction, and source.
2. Blueprint Detail — input bill of materials, output quantity, time, ME/TE-like material/time efficiency, skill/research prerequisites, and copy limits.
3. Research Queue — queued jobs, remaining time, cancel/refund policy, parallel-slot capacity, and offline completion handling.
4. Material Efficiency — reduce waste through research, with a hard floor on consumed materials.
5. Time Efficiency — shorten manufacturing time with a hard cap; never permit zero/negative durations.
6. Blueprint Originals and Copies — original can be researched and copied; copies have finite runs and cannot be copied again unless a recipe explicitly permits it.
7. Invention/Discovery — consume eligible copies and catalysts for a chance at advanced blueprints; show probability and failure cost.
8. Tech tree — explicit prerequisites, unlock sources, and research levels.
9. Job history — inputs, outputs, owner, timestamps, outcome, and transaction ID.
10. Facility modifiers — research speed, queue slots, and material efficiency are bounded and server validated.

Use the menu label **Blueprints and Research Lab** (not “EVE Online”). Implement original mechanics inspired by manufacturing/research workflows rather than reproducing proprietary content.

## Required safeguards and tests before production

- Validate exactly 90 unique module IDs and non-negative finite stat values.
- Test tier unlock boundaries, slot compatibility, duplicate stacking, and missing prerequisites.
- Test success/failure at minimum, maximum, and boundary levels; protection enabled/disabled; damaged items; and salvage after partial upgrades.
- Verify resource deductions happen once, atomically, on the server.
- Persist item upgrade state and module loadouts across sessions/devices.
- Add economy simulations for expected cost per successful level and expected materials lost per failure.
- Add PvP/PvE power-budget checks so module stacking cannot dominate all builds.
- Keep this feature branch unmerged until typecheck, lint, unit tests, and a production build pass.
