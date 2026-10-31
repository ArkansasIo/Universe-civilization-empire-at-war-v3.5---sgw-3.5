import type { BuildQueue, QueueKind } from '../../engine/queueEngine';
import type { ID } from '../../engine/types';

export interface BuildQueueRepository {
  get(kind: QueueKind, targetId: ID): Promise<BuildQueue | null>;
  save(queue: BuildQueue): Promise<void>;
}

export class InMemoryBuildQueueRepository implements BuildQueueRepository {
  private readonly queues = new Map<string, BuildQueue>();
  private key(kind: QueueKind, targetId: ID): string {
    return `${kind}:${targetId}`;
  }

  async get(kind: QueueKind, targetId: ID): Promise<BuildQueue | null> {
    const queue = this.queues.get(this.key(kind, targetId));
    return queue ? structuredClone(queue) : null;
  }

  async save(queue: BuildQueue): Promise<void> {
    this.queues.set(this.key(queue.kind, queue.targetId), structuredClone(queue));
  }
}
