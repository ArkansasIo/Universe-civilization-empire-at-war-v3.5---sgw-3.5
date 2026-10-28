# Unified Level and Story Progression

## Goals

Player level, story chapters, quest prerequisites, technology, buildings, expansion availability, and tier unlocks are one progression contract. UI visibility is informative; authoritative game services enforce the same requirements on every state-changing command.

## Content model

- Base game: tiers 1–18.
- Expansion I: tiers 19–36.
- Expansion II: tiers 37–54.
- Expansion III: tiers 55–72.
- Character level: 1–100. Level is independent of tier; expansion tiers are content milestones and do not imply character levels above 100.
- Expansion availability is a separate entitlement/content flag and must be checked before expansion-tier unlocks.

## Unlock evaluation

A feature can be available only when all required conditions are satisfied:
1. The feature's minimum player level is met.
2. Its required story chapter and prerequisite quests are completed.
3. Required buildings, research, or previous tiers are complete.
4. Required resources and items are present for the requested action.
5. The relevant expansion is enabled for the current world/account.
6. The acting user has the required role for administrative actions.

A mission can be story-gated without being level-gated, and vice versa. Data definitions must state explicitly which requirements apply. Never silently treat missing progress as completed.

## Suggested data sheet schema

Each tier/feature row should include:
- stable ID (never derived from display label)
- display name and description
- content phase and tier number
- minimum and maximum player level, if applicable
- required story chapter ID
- required quest IDs
- required previous tier IDs
- required building/research levels
- required expansion key
- unlock grants (feature IDs, recipes, regions, ships, research)
- resource costs/rewards
- sort order and enabled/deprecated flag

Keep the schema versioned. Validate duplicate IDs, invalid tier numbers, missing prerequisites, and dependency cycles when loading the data.

## Story integration

Represent chapters and quests with stable IDs, prerequisite IDs, objective definitions, completion state, and reward grants. Completion must be recorded by the authoritative service. Tier access should reference story IDs, not localized quest titles.

Suggested narrative gates:
- Base tiers 1–6: first contact, establish the colony, stabilize production, and introduce research.
- Base tiers 7–12: faction diplomacy, fleet command, defensive readiness, and first interplanetary campaign.
- Base tiers 13–18: advanced gateways, elite fleet readiness, megastructure discovery, and base-game finale.
- Expansion I tiers 19–36: ancient civilization discovery, relic recovery, and ancient-threat campaign.
- Expansion II tiers 37–54: galactic alliances, conquest, megastructure projects, and escalating interstellar threats.
- Expansion III tiers 55–72: cosmic anomalies, apex research, ultimate raids, and expansion finale.

These are narrative planning beats, not finalized quest IDs or balance values.

## Runtime contract

Create a shared progression evaluator that returns:
- allowed: boolean
- reason codes for each unmet condition
- human-readable lock explanation
- unmet level, story, quest, building, research, tier, expansion, or role requirements

Use it for menu lock indicators and route guards, but re-check it on the server for every action that spends resources, starts construction/research/crafting, launches fleets, enters gated regions, accepts/turns in missions, or unlocks tiers. Client-supplied unlock flags are never authoritative.

Admin-only controls (including turn-engine management) require server-side role authorization independently of progression checks. Hiding a sidebar entry alone is insufficient.

## Persistence and migration

Persist player level/XP, completed chapter IDs, completed quest IDs, unlocked tier IDs, expansion flags, and granted feature IDs in authoritative player state. Make quest completion and tier grants idempotent so retries cannot duplicate rewards. Migrate existing players conservatively: grant only progress that can be established from existing authoritative records; do not assume all story gates are completed.

## Acceptance tests

- Correct level but missing story chapter: blocked with story reason.
- Story complete but below minimum level: blocked with level reason.
- All prerequisites satisfied: allowed and unlock grants applied once.
- Missing prerequisite quest or research: blocked with exact missing ID.
- Expansion disabled: expansion tiers remain locked.
- Direct API request for locked content: rejected server-side.
- UI lock text and server reason codes agree.
- Retried quest completion does not duplicate rewards.
- Non-admin cannot view or invoke turn-engine administration APIs.
- All 72 tier definitions have unique stable IDs and valid dependencies.
