# OGame-Style RPG/MMORPG Space Layer

This layer combines persistent 4X space strategy with the existing RPG/MMORPG character systems.

## Core gameplay loop

1. Establish colonies and manage planet fields.
2. Produce Naquadah, Metal, Crystal, Deuterium and Energy.
3. Research technologies and unlock stronger ships and abilities.
4. Build fleets and assign missions.
5. Scout, raid, defend, colonize and explore the galaxy.
6. Resolve fleet combat and award RPG progression, loot and resources.
7. Join alliances and participate in alliance wars.
8. Use the existing character, inventory, equipment, dungeon, PvP, talent and crafting systems as the personal RPG layer.

## Economy

The existing StargateWars economy remains authoritative. The RPG space layer exposes the documented Unit Production formula `CurrentUP * 5000 + 10000`, natural income `(UntrainedUnits * 20) + (MinersAndLifers * 80)`, and bank capacity `NaturalIncome * 48 * 1.5`.

## Galaxy

Coordinates use `galaxy:system:position`. The generator is deterministic from a seed, allowing the same galaxy to be reproduced by server workers and clients for visualization.

## Fleets

Ship classes include scouts, fighters, bombers, cruisers, battleships, carriers and motherships. Fleet state is server-owned. Clients should submit mission intents rather than authoritative ship counts or combat results.

## Research

Research is prerequisite-driven and level based. Costs scale by each node's growth factor. Research completion must be validated and committed by the server transactionally.

## MMORPG layer

Characters retain level, class, abilities, equipment, inventory, quests, dungeons, talents and PvP state. Fleet missions can award XP, items, crafting materials, reputation, alliance experience and resources.

## Security

Never trust client-supplied resource balances, fleet composition, research levels, combat rolls, mission timestamps, loot rolls or rewards. Resolve all persistent state transitions on the authoritative server.
