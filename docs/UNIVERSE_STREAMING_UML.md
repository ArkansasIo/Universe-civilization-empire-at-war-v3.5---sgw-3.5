# Universe Streaming UML

```mermaid
classDiagram
    class ChunkCoord {
      +number galaxy
      +number x
      +number y
      +number z
    }
    class UniverseChunk {
      +string id
      +ChunkCoord coord
      +number seed
      +number version
      +string[] systemIds
    }
    class ChunkGenerator~T~ {
      +generate(ChunkCoord) T
    }
    class ChunkStore~T~ {
      +get(id) Promise~Snapshot~
      +put(snapshot) Promise~void~
      +delete(id) Promise~void~
    }
    class MemoryChunkStore~T~
    class UniverseChunkStreamer~T~ {
      +update(center) LoadResult
      +get(coord) T
      +restore(coord) Promise~boolean~
      +persistAll() Promise~void~
      +stats() StreamingStats
    }
    class ExplorationState {
      +discover(factionId, coord, tick)
      +isDiscovered(factionId, coord) boolean
      +recordsFor(factionId) ExplorationRecord[]
    }
    ChunkGenerator --> UniverseChunk
    UniverseChunkStreamer --> ChunkGenerator
    UniverseChunkStreamer --> ChunkStore
    MemoryChunkStore --|> ChunkStore
    UniverseChunkStreamer --> ExplorationState
```

The generator is deterministic; the streamer is stateful. This separation allows regenerated procedural data to remain stable while gameplay state, cache state, and fog-of-war state evolve independently.
