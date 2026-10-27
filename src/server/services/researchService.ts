import type { ResearchRepository, ResearchProgress } from '../repositories/researchRepository';

export class ResearchService {
  constructor(private readonly research: ResearchRepository) {}

  async get(playerId: string, technologyId: string): Promise<ResearchProgress | null> {
    return this.research.get(playerId, technologyId);
  }

  async start(playerId: string, technologyId: string, durationMs: number, now = Date.now()): Promise<ResearchProgress> {
    if (!technologyId || durationMs < 0 || !Number.isFinite(durationMs)) throw new Error('INVALID_RESEARCH');
    const existing = await this.research.get(playerId, technologyId);
    if (existing && existing.completedAt === undefined) throw new Error('RESEARCH_ALREADY_RUNNING');
    const progress: ResearchProgress = {
      playerId,
      technologyId,
      level: existing?.level ?? 0,
      progress: 0,
      startedAt: now,
      completedAt: now + durationMs,
    };
    await this.research.save(progress);
    return progress;
  }
}
