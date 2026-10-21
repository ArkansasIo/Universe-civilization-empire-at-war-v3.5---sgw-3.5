# Procedural Universe Generation

## Purpose

This module adds a deterministic, seed-driven universe generator for **Universe: Civilization — Empire at War**. It complements the existing multiverse and No Man's Sky-inspired data sets with a reusable generation API that can drive galaxy-map previews, exploration, faction placement, colonization and server-side world creation.

Implementation: `src/engine/proceduralUniverse.ts`.

## Design goals

- **Deterministic worlds:** the same seed and configuration produce the same serialized world.
- **Stable identifiers:** galaxy, system, planet and faction IDs are derived from generation order, not names.
- **Data-driven entities:** generated entities are typed and JSON-serializable.
- **Strategic play:** homeworlds, resource deposits, anomalies, danger ratings and system links are emitted as game data.
- **Bounded generation:** strict limits prevent accidental memory explosions in browser previews.
- **Server authority:** generate and validate the world on the server before persisting it; clients should not be trusted to author faction ownership or starting resources.

## API

```ts
import {
  generateProceduralUniverse,
  validateGeneratedUniverse,
} from "./engine/proceduralUniverse";

const universe = generateProceduralUniverse({
  seed: "campaign-2026-sector-alpha",
  universeName: "Aetherion Expanse",
  generatorVersion: 1,
  galaxyCount: 6,
  systemsPerGalaxy: 24,
  minPlanetsPerSystem: 2,
  maxPlanetsPerSystem: 8,
  factionCount: 6,
  galaxyRadius: 1200,
});

const issues = validateGeneratedUniverse(universe);
if (issues.length) throw new Error(issues.join("\n"));
```

Defaults create 6 galaxies × 24 systems. Per-call limits are 250 galaxies, 5,000 systems per galaxy, 20 planets per system and 12 generated factions. Production values must be load-tested before increasing them: this implementation materializes the requested world in memory.

## Algorithm

1. Normalize the seed using FNV-1a to obtain a 32-bit seed.
2. Initialize a local Mulberry32 pseudo-random number generator. No global random state is used.
3. Choose a galaxy morphology (spiral, barred spiral, elliptical, ring, irregular or nebula) and generate 3D system coordinates appropriate to that morphology.
4. Generate star class, planet count, biome, habitability, size, orbital distance, population capacity and deposits for Naquadah, heavy metal, silicate crystal, cryo-deuterium and dark matter.
5. Put one guaranteed terran/stargate homeworld in each faction's starting system; assign a starting faction and resources.
6. Occasionally place anomalies such as ancient ruins, wormholes and derelict fleets.
7. Connect each system to its three nearest neighbours (or fewer in very small galaxies) to produce navigable local starmaps.
8. Calculate generation summary counts and run integrity validation.

### Determinism note

`generatedAt` is deliberately epoch-pinned in the generated payload so serialization is reproducible. Record the real creation timestamp in the persistence layer as separate metadata. Keep `schemaVersion` with saved world seeds; bump it when an intentional algorithm change means an old seed should produce a new world.

## Game integration

- **Map/viewport:** use `galaxies[].position` for galaxy placement and `systems[].position` for local map rendering. Convert units in the renderer, not in the saved seed data.
- **Exploration:** use system `links` as local jump candidates. Validate travel distance, fuel cost and gate access in the authoritative game-command layer.
- **Colonization:** `habitability`, `populationCapacity`, and `resources` can feed existing planet and colony calculations. Treat these fields as inputs, not as an alternative to economy rules.
- **Faction start:** persist each faction's `homeSystemId` and `homePlanetId`; apply production, research, diplomacy and turn rules through existing engine services.
- **Encounters:** resolve `dangerLevel` and `anomalies` into encounters via the combat/exploration engine. Do not resolve combat inside the generator.
- **Multiverse:** call the function once per universe with a namespaced seed such as `multiverse-03:campaign-42`. Different universe modifiers should be applied by the existing universe rules layer.

## Test and run

```sh
npm run engine:universe:smoke
npx tsx src/engine/proceduralUniverse.test.ts
```

The tests check exact-seed reproducibility, seed variation, summary counts, unique IDs through validation, homeworld validity and invalid configuration bounds.

## Scalability and follow-up work

This is an in-memory first version. For large shards, generate galaxies lazily from `(universeSeed, galaxyIndex)`, persist generated sectors idempotently, and expose paginated APIs. Avoid generating millions of planets on a request thread. A production deployment should rate-limit generation requests, cache generated seed/index pairs, validate seeds at the API boundary, and store generator version with each persisted galaxy.
