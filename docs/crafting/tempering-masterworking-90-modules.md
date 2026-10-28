# Tempering and Masterworking: 90-module framework

The data-driven catalog contains **90 modules across 10 domains**, with 9 ordered modules per domain. Each module defines its domain, class/subclass, type/subtype, tier, prerequisites, base stats, sub-stats, failure risk, and description.

## Domains

1. **Weapon Tempering** — Edge Geometry, Impact Alignment, Core Hardening, Heat Cycling, Grain Refinement, Resonance Tuning, Edge Retention, Balance Calibration, Final Quench.
2. **Armor Tempering** — Plate Hardening, Flex Weave, Impact Dispersion, Joint Reinforcement, Elemental Annealing, Ward Channeling, Weight Optimization, Vitality Lattice, Final Quench.
3. **Jewelry Tempering** — Gem Seating, Metal Purity, Mana Conduction, Precision Setting, Resonance Matching, Socket Reinforcement, Aura Stabilization, Facet Polishing, Final Attunement.
4. **Rune Tempering** — Rune Inscription, Glyph Depth, Mana Binding, Sigil Alignment, Ward Geometry, Elemental Script, Runic Stability, Eldritch Etching, Grand Seal.
5. **Material Refinement** — Ore Sorting, Impurity Removal, Alloy Ratios, Crystal Cutting, Core Stabilization, Essence Extraction, Ingot Casting, Catalyst Blending, Purity Certification.
6. **Masterwork Forging** — Blueprint Analysis, Forge Calibration, Perfect Heat, Molecular Bonding, Master Alloy, Precision Hammering, Stress Relief, Resonance Lock, Signature Finish.
7. **Stat Attunement** — Strength Channel, Dexterity Channel, Constitution Channel, Intelligence Channel, Wisdom Channel, Vitality Channel, Spirit Channel, Willpower Channel, Fortune Channel.
8. **Affix Engineering** — Affix Discovery, Prefix Control, Suffix Control, Affix Tiering, Affix Reroll, Affix Locking, Affix Fusion, Affix Transfer, Legendary Imprint.
9. **Recovery and Protection** — Failure Analysis, Warding Runes, Protective Seals, Damage Mitigation, Downgrade Control, Material Recovery, Repair Protocol, Risk Forecast, Insurance Mastery.
10. **Crafting Mastery** — Tool Expertise, Station Mastery, Recipe Research, Resource Efficiency, Batch Crafting, Critical Crafting, Quality Inspection, Specialization Training, Grandmaster Certification.

## Class and type model

- **Domain**: the crafting discipline that owns a module.
- **Class**: equipment or crafting family (`weapon`, `armor`, `accessory`, `rune`, `material`, `masterwork`, `stat`, `affix`, `protection`, `mastery`).
- **Subclass**: progression specialization (`standard`, `advanced`, `exalted`) within a family.
- **Type/subtype**: mechanic and specific operation (for example, `weapon` / `edge-geometry`).
- **Tier**: 0–5 module tier; higher tiers represent later progression in the catalog.
- **Stats/sub-stats**: primary attributes plus derived combat stats. The module calculator aggregates bonuses and caps total configured failure risk at 95%.

## Integration

Use `listCraftingMasteryModules` for discovery/filtering, `getCraftingMasteryModule` for details, `validateCraftingModuleLoadout` to enforce prerequisites, and `calculateCraftingModuleStats` to aggregate bonuses. The module layer is additive and intentionally separate from the existing temper/masterwork upgrade pipeline; connect its outputs to authoritative item state and server-owned inventory before enabling client-selected modules in production.

## Verification

Run `npm run crafting:mastery:smoke` and `npm run lint`. The smoke test checks the exact 90-module count, 10×9 distribution, prerequisite handling, aggregation, and invalid module rejection.