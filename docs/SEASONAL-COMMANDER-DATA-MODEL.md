# Seasonal Commander Data Contract

The catalog in `src/game/seasonal-commanders.ts` defines 12 seasons × 32 commanders = 384 slots per annual cycle.

Every commander has a stable unique ID, unique display name, season identity, title, rank, race, rarity, class, subclass, type, subtype, level cap, seven core stats, growth rates, signature ability and original-art portrait brief.

## Core stat model
- Command: tactical coordination and aura strength.
- Attack: offensive contribution.
- Defense: damage mitigation and fleet protection.
- Research: technology speed contribution.
- Logistics: upkeep and resource transport contribution.
- Covert: reconnaissance and sabotage contribution.
- Exploration: expedition and anomaly contribution.

The generated numbers are **initial tuning values**, not simulation-validated balance. They must be connected to actual gameplay formulas before being treated as live effects. Avoid stacking every stat multiplier additively; use a documented combat/economy calculation pipeline and bounded effects.

## Art direction
Each record has an original, full-color science-fiction portrait brief. Use commissioned or generated original artwork, not extracted OGame screenshots or copyrighted game art. Recommended production export: high-resolution portrait master plus optimized WebP/AVIF variants and a consistent crop/aspect ratio.

## Validation
Call `validateSeasonalCommanders()` from a unit test to verify 384 entries, unique IDs/names, season bounds, stat ranges, and ability multipliers. Integrate the catalog into the Commander Gacha / seasonal roster UI and server-side acquisition service as a separate step.
