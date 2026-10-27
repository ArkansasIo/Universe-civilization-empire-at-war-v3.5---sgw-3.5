export type PvpMode = "duel" | "arena" | "open-world";

export interface PvpProfile { rating: number; wins: number; losses: number; honor: number; }
export interface PvpMatch { id: string; mode: PvpMode; playerIds: string[]; startedAt: number; winnerId?: string; }

export function createPvpProfile(): PvpProfile { return { rating: 1000, wins: 0, losses: 0, honor: 0 }; }

export function applyPvpResult(profile: PvpProfile, won: boolean, opponentRating = 1000): PvpProfile {
  const expected = 1 / (1 + 10 ** ((opponentRating - profile.rating) / 400));
  const score = won ? 1 : 0;
  const delta = Math.round(32 * (score - expected));
  return { ...profile, rating: Math.max(0, profile.rating + delta), wins: profile.wins + (won ? 1 : 0), losses: profile.losses + (won ? 0 : 1), honor: Math.max(0, profile.honor + (won ? 25 : 5)) };
}

export function createMatch(id: string, mode: PvpMode, playerIds: string[], now = Date.now()): PvpMatch {
  if (playerIds.length < 2) throw new Error("PVP requires at least two players");
  return { id, mode, playerIds: [...playerIds], startedAt: now };
}
