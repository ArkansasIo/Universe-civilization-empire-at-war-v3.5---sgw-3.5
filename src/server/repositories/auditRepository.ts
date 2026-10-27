export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  targetId?: string;
  requestId?: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface AuditRepository {
  append(event: AuditEvent): Promise<void>;
  list(actorId?: string): Promise<AuditEvent[]>;
}

export class InMemoryAuditRepository implements AuditRepository {
  private readonly events: AuditEvent[] = [];

  async append(event: AuditEvent): Promise<void> {
    this.events.push(structuredClone(event));
  }

  async list(actorId?: string): Promise<AuditEvent[]> {
    return this.events
      .filter((event) => !actorId || event.actorId === actorId)
      .map((event) => structuredClone(event));
  }
}
