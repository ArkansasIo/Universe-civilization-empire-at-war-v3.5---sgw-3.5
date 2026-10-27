# RPG/MMORPG Stats, Combat, Enemies, Equipment and Valuation

## Purpose and integration
The executable baseline lives in `src/rpg/`. These rules are intentionally data-driven and work for PvE encounters, raids, and normalized PvP. UI and API wiring can be added without coupling the rules to React.

## Attributes and sub-stats
Primary: Strength, Dexterity, Constitution, Intelligence, Wisdom, Vitality, Spirit, Luck, Willpower, Charisma.
Derived groups: physical/spell/healing power; armor and magic resistance; HP/MP/stamina and regeneration; accuracy/evasion/penetration; attack/cast/movement speed; critical chance/damage; block/parry/dodge; tenacity/poise; cooldown reduction, shields and threat.
Resources optionally include Energy, Rage, Focus, Faith, Aether, Heat and Sanity.

## Combat formula
1. Validate non-negative finite inputs.
2. Physical attacks apply armor mitigation using `Armor / (Armor + K * AttackerLevel)`.
3. Subtract the defender's flat resistance for the damage type.
4. Apply percentage resistance (allowed data range -50% to 90%).
5. In PvP apply normalized outgoing damage; critical chance and critical damage are separately dampened and capped.
6. Apply block value, clamp damage to a non-negative amount, and apply it on the authoritative server.
True damage can be defined with no armor mitigation. Healing has separate PvP scaling and clamps bonus/reduction inputs.

## Buffs, debuffs and status
Effects define ID, category, duration, stack policy, magnitude, optional stat, tick interval, damage type, cleanse type and CC diminishing category. Policies: no stacking, refresh duration, additive stacks, replace strongest, independent instances. A production service should additionally persist effect application IDs and use authoritative server clocks.

## Enemies and boss content
Enemy definitions include rank, combat role, baseline stat block, abilities, phases, affixes, immunities, loot profile and respawn duration. Boss phase triggers can depend on HP, elapsed time or scripted events. The included AI selection helper scores range fit, execute opportunities, cooldown readiness, phase legality, player clustering and healer/interrupt priorities; it is a utility scorer rather than a full behavior-tree runtime.
Rank multipliers are tuning defaults, not mandatory design constraints. Apply player-count, level-difference and difficulty factors from the shared rules file.

## Equipment
The canonical item schema carries both `pve` and `pvp` profiles. PvE can include boss-specific damage bonuses and stronger item procs. PvP profiles can normalize base damage and add resilience, anti-heal and control-duration scaling. Slots include head, chest, legs, gloves, boots, main/off-hand, rings, amulet, cloak, belt, trinkets and relics. Rarities are common through ascended.

Item power is a balancing score:
`ItemPower = Σ(weighted stats) + base damage value + defense value + proc value + set/boss bonus value`.
This is not the same as vendor price. Use an explicit economy formula for buy/sell prices.

## Loot
Tables support weighted entries, quantity ranges, optional reset uniqueness and guaranteed-item pity counters. Production pity counters must be stored server-side and incremented atomically with the reward transaction. Luck is bounded to prevent economy instability.

## PvP safeguards
Default baseline caps: critical chance 40%, cooldown reduction 35%, damage reduction 70%, CC duration multiplier up to 50%. Apply crowd-control DR, healing dampening and damage normalization server-side. These numbers are starting balance defaults and require playtesting.
Avoid combining severe reflective damage with heavy persistent DoT affixes at low levels. Always provide counterplay for lethal boss telegraphs and offer a defensive CC-break trinket option.

## Security and tests
Clients may request an action; they must not authoritatively submit final damage, loot, inventory, item value or currency values. The trusted server recalculates the action from persisted character state and versioned rules, then commits state and combat events transactionally. Recommended next integration points: server combat service, SQL persistence for item/effect definitions, API routes for equipment previews, and client inventory/character sheets.
