# OGame-Style Galaxy Layout

The procedural universe now supports an OGame-style coordinate hierarchy for every universe in the multiverse.

## Coordinate hierarchy

```text
Universe
└── Galaxy 1..90
    └── Solar System 1..499
        ├── Position 1
        ├── Position 2
        ├── ...
        ├── Position 15
        └── Position 16 = Expedition-only space
```

This creates **90 galaxies × 499 systems × 15 planet positions = 673,650 planet slots per universe**, plus position 16 as a special expedition coordinate.

The existing project-specific universe layer remains responsible for lore, factions, cosmic modifiers, resources and Stargate mechanics. `ogameGalaxy.ts` supplies the strategic coordinate layer.

## Why it is generated lazily

Materializing all 673,650 slots for every universe would create a large memory footprint before players have interacted with most of the map. Instead:

- `getOGameSystem(universe, galaxy, system)` deterministically creates one system.
- `getOGameGalaxy(universe, galaxy)` materializes one galaxy when needed.
- `forEachOGameSystem(universe, callback)` streams all systems without retaining the entire universe.
- `createOGameGalaxyLayout(universe)` returns counts and limits without creating game objects.

## Coordinate format

The canonical UI/API coordinate is:

```text
universe:galaxy:system:position
7:90:499:15
```

For a system-only coordinate:

```text
7:90:499
```

Planet, moon and debris identifiers are deterministic derivatives of the coordinate. Ownership and actual player-created entities must be stored in authoritative game state instead of being permanently encoded by the procedural generator.

## Strategic positions

Positions are grouped for gameplay balancing:

| Positions | Class | Intended use |
|---|---|---|
| 1-3 | inner-orbit | hot worlds, metal-heavy environments |
| 4-6 | habitable-orbit | stronger colony candidates |
| 7-12 | outer-orbit | resource/extraction worlds |
| 13-15 | deep-orbit | cold/exotic worlds |
| 16 | expedition | expedition encounters; not a normal planet slot |

These classes are project-specific extensions and should feed the existing economy and colonization rules rather than hard-code OGame's historical balance values.

## Integration with the 90-universe multiverse

Every universe gets its own coordinate namespace. For example:

```text
Universe 1: 1:1:1:1
Universe 2: 2:1:1:1
Universe 23: 23:90:499:15
```

This means the same galaxy/system/position numbers can safely exist in different universes without ID collisions.

The universe seed should be incorporated into the authoritative persistence key. Recommended key:

```text
{generatorVersion}:{universeSeed}:{universeId}:{galaxy}:{system}:{position}
```

## Relationship to the existing galaxy data

The existing `UniverseGalaxy` model describes the thematic properties of a galaxy. The new OGame-style layer adds the actual coordinate space underneath it:

```text
MultiverseUniverse
  -> UniverseGalaxy [1..90]
      -> OGameSystem [1..499]
          -> OGamePlanetSlot [1..15]
          -> Expedition Position 16
```

Do not replace the existing galaxy type, resource abundance, hyperspace safety or Stargate network metadata. Those properties should decorate the OGame-style coordinate grid.

## Future gameplay integration

The next layer can connect the coordinate grid to:

1. player colonies and homeworlds;
2. moons and moon facilities;
3. debris fields and salvage;
4. Stargate endpoints;
5. fleet travel and hyperspace distance;
6. espionage/scanning;
7. expeditions at position 16;
8. NPC empires and neutral systems;
9. abandoned colonies;
10. universe-specific modifiers.
