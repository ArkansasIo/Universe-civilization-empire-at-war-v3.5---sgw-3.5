# Universe Sharding and Streaming

The universe is now designed as a deterministic coordinate-addressable world.

## Sharding

A chunk authority is derived from:

```text
hash(universeSeed, galaxy, chunkX, chunkY, chunkZ) % shardCount
```

This means every server can independently calculate which shard owns a chunk without a central coordinate database.

## Generation queues

`GenerationQueue` accepts prioritized chunk requests. Nearby chunks can receive higher priority than background prefetch requests. The queue intentionally separates request ordering from deterministic generation so scheduling cannot change generated content.

## Cross-chunk gateways

Adjacent chunks can receive deterministic Stargate or wormhole connections. The pair is canonicalized before hashing, preventing the two chunks from generating conflicting answers for the same boundary.

## Multiplayer authority

Clients request regions. The authoritative server decides:

- which shard owns the chunk;
- whether the player may enter the chunk;
- faction ownership;
- discovered/explored state;
- gameplay mutations;
- fleet movement and gateway traversal.

Procedural generation supplies immutable baseline data; persistent state supplies mutations.

## Three.js integration boundary

A renderer should consume a lightweight stream DTO rather than the complete gameplay model:

```text
chunk id
chunk bounds
system positions
system visual type
visible gateways
fog-of-war state
```

The renderer should never become the authority for resources, ownership, combat, or travel permissions.
