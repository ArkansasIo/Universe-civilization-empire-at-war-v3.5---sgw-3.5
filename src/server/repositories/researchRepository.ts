export interface ResearchProgress {
  playerId: string;
  technologyId: string;
  level: number;
  progress: number;
  startedAt?: number;
  completedAt?: number;
}

export interface ResearchRepository {
  get(playerId: string, technologyId: string): Promise<ResearchProgress | null>;
  list(playerId: string): Promise<ResearchProgress[]>;
  save(progress: ResearchProgress): Promise<void>;
}

export class InMemoryResearchRepository implements ResearchRepository {
  private readonly values = new Map<string, ResearchProgress>();
  private key(playerId: string, technologyId: string): string {
    return `${playerId}:${technologyId}`;
  }

  async get(playerId: string, technologyId: string): Promise<ResearchProgress | null> {
    const value = this.values.get(this.key(playerId, technologyId));
    return value ? { ...value } : null;
  }

  async list(playerId: string): Promise<ResearchProgress[]> {
    return [...this.values.values()].filter((value) => value.playerId === playerId).map((value) => ({ ...value }));
  }

  async save(progress: ResearchProgress): Promise<void> {
    this.values.set(this.key(progress.playerId, progress.technologyId), { ...progress });
  }
}
