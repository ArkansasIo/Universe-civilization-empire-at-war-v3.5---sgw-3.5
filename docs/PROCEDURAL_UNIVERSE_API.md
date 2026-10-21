# Procedural Universe API Contract

## Generate

`POST /api/universe/generate`

Request:

```json
{
  "seed": "SGW-CAMPAIGN-001",
  "universeName": "Aetherion Expanse",
  "galaxyCount": 6,
  "systemsPerGalaxy": 24,
  "minPlanetsPerSystem": 2,
  "maxPlanetsPerSystem": 8,
  "factionCount": 6,
  "generatorVersion": 2
}
```

Response should contain a persistent `universeId`, seed, generator version, summary and either the generated world or a job identifier for asynchronous generation.

## Read galaxy

`GET /api/universe/:universeId/galaxies/:galaxyId`

Return the galaxy metadata and its systems. Large deployments should paginate systems.

## Read system

`GET /api/universe/:universeId/systems/:systemId`

Return system metadata, planets, anomalies and authorized travel links.

## Route

`GET /api/universe/:universeId/systems/:systemId/route/:targetSystemId`

Return a server-calculated system ID path. The client must not submit a fabricated path to bypass travel restrictions.

## Security rules

- Never accept generated ownership, resource abundance or homeworld status from the client as authoritative.
- Enforce generation bounds on the server.
- Rate-limit generation requests.
- Persist `seed` and `generatorVersion`.
- Keep player discovery state separate from immutable procedural base data.
- Apply fuel, Stargate, diplomacy, combat and movement rules after topology lookup.
