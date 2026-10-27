# RPG/MMORPG File Map

The feature branch now contains the RPG/MMORPG layer as a separate module so the existing strategy/fleet systems remain intact.

## Runtime

- `src/rpg/types.ts` — shared contracts
- `src/rpg/formulas.ts` — combat/stat formulas
- `src/rpg/combatRuntime.ts` — deterministic ability combat and cooldowns
- `src/rpg/statusEffects.ts` — buffs, debuffs, periodic effects and cleansing
- `src/rpg/bossRuntime.ts` — boss phases, party scaling and enrage
- `src/rpg/progression.ts` — levels, XP, class growth and resources
- `src/rpg/playerState.ts` — persistent player RPG state
- `src/rpg/inventory.ts` — item stacks, inventory and equipment
- `src/rpg/loot.ts` — weighted server-side loot rolls and pity
- `src/rpg/economy.ts` — wallets and validated transactions
- `src/rpg/party.ts` — party membership and composition
- `src/rpg/guilds.ts` — guilds, ranks and guild progression
- `src/rpg/pvp.ts` — arena rating and PvP validation
- `src/rpg/quests.ts` — quest/objective progression
- `src/rpg/missions.ts` — daily missions
- `src/rpg/zones.ts` — zones, biomes and progression ranges
- `src/rpg/crafting.ts` — recipes and material validation
- `src/rpg/abilities.ts` — ability definitions
- `src/rpg/abilityLookup.ts` — ability/effect lookup helpers
- `src/rpg/catalog.ts` — sample game data
- `src/rpg/index.ts` — public module exports

## Remaining production integration

The data/runtime layer is now substantially populated, but it still needs wiring into the application's existing React views and authoritative server repositories. Production integration should add API endpoints for character state, inventory, abilities, parties, guilds, quests, encounters, loot and PvP; persistence migrations; authorization; idempotency; audit logs; and client UI.

Do not move reward authorization to the browser. Server-side persistence and validation must remain authoritative.
