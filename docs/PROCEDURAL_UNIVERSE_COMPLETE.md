# Complete Procedural Universe Specification

## Pipeline

`seed -> normalized configuration -> deterministic RNG -> galaxies -> systems -> stars -> planets -> resources -> anomalies -> factions -> topology -> validation -> serialization`

## Universe scale

The generator is bounded for safety. Defaults are six galaxies, 24 systems per galaxy, 2–8 planets per system and six factions. Production shards can use lazy sector generation rather than materializing every object at once.

## Galaxy generation

Each galaxy receives one of six morphologies:

- spiral
- barred-spiral
- elliptical
- ring
- irregular
- nebula

System coordinates are generated in local galaxy space. Galaxy position is generated separately so the galaxy map can be rendered as a multiscale hierarchy.

## Star generation

Stars use O/B/A/F/G/K/M/X classes with deterministic temperature values and a 0–9 danger level. The X class is an intentionally fictional game category for exotic objects.

## Planet generation

Planets receive:

- biome
- habitability
- size class
- orbital distance
- population capacity
- resource deposits
- Stargate availability
- homeworld state

Terran homeworlds are guaranteed for faction starts and always receive a Stargate.

## Economy resources

The generated deposits are compatible with the game's strategic resource layer:

1. Naquadah
2. Heavy Metal
3. Silicate Crystal
4. Cryo-Deuterium
5. Dark Matter

Generation only supplies starting/world parameters. Existing economy and turn-engine services remain responsible for income, production, banking, costs and resource mutation.

## Factions

Each generated faction receives an archetype, UI color, starting resources and expansion bias. Homeworld ownership is assigned to the first generated systems in deterministic order.

## Navigation

Each system receives up to three nearest-neighbour links. Links are then made bidirectional where capacity permits. `shortestPath()` can be used by the travel layer to find a route without embedding fuel or combat rules into generation.

## Anomalies

The generator can place ancient ruins, wormholes, derelict fleets, precursor beacons, spatial rifts and resource-rich nebulae. Anomaly generation creates data only; encounter resolution belongs to the gameplay layer.

## Determinism

The generator never calls `Math.random()`. Seeds are normalized with a 32-bit FNV-style hash and expanded with Mulberry32. Name streams use derived seed namespaces so unrelated generation changes do not unnecessarily alter names.

Persist at minimum:

```text
universe_id
seed
generator_version
created_at
schema_version
```

Changing generation rules should increment `generator_version` so old campaigns remain reproducible.

## Server authority

The authoritative server should generate or validate a world before publishing it. Clients may render generated coordinates but must not be trusted to submit faction ownership, resource values, homeworld status, or travel topology as authoritative state.

## Large-world mode

For millions of systems, replace full materialization with a deterministic sector function:

```text
sectorSeed = hash(universeSeed, galaxyIndex, sectorX, sectorY, sectorZ, generatorVersion)
```

Generate only the requested sector, cache it, and persist discovered/modified objects separately. This allows an effectively unbounded universe while keeping memory proportional to active players and visible map regions.

## API boundary

Recommended service endpoints:

```text
POST /api/universe/generate
GET  /api/universe/:id
GET  /api/universe/:id/galaxies
GET  /api/universe/:id/galaxies/:galaxyId
GET  /api/universe/:id/systems/:systemId
GET  /api/universe/:id/systems/:systemId/route/:targetId
```

The generate endpoint should validate the seed, enforce server-side generation limits, persist the generator version, and return a world identifier rather than exposing unrestricted generation controls to clients.
