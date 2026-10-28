# Seasonal Commander Roster

## Annual schedule
- 12 seasons per year.
- 32 featured commanders per season.
- 384 seasonal commander slots per year (32 × 12).
- Keep the stable route ID `commander-gacha` for compatibility while the visible label uses “Seasonal Commander Roster”.

## Content and duplicate policy
Each seasonal roster should define season ID, start/end timestamps, commander IDs, rarity, faction/race, role, acquisition methods, and availability window. Commander identity should be stable across seasons. If a commander returns in a later season, do not create a duplicate identity; record a new availability window instead.

## UI and balance requirements
Display the current season, remaining time, the 32 featured commanders, acquisition odds or deterministic unlock conditions, and the yearly season calendar. If random acquisition is used, disclose odds and provide a non-random progression path. Avoid implying that all 384 entries must be unique unless that design is explicitly chosen.

## Status
This file defines the intended data and UX contract. Seasonal roster data, schedule automation, and acquisition logic still need to be integrated and tested.
