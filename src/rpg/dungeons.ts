export type DungeonMode = "normal" | "heroic" | "mythic";

export interface DungeonDefinition {
  id: string;
  name: string;
  level: number;
  mode: DungeonMode;
  floors: number;
  bossIds: string[];
  recommendedPower: number;
  dailyLockout: boolean;
}

export interface DungeonRun {
  dungeonId: string;
  partyId: string;
  floor: number;
  startedAt: number;
  completed: boolean;
}

export const STARTER_DUNGEONS: DungeonDefinition[] = [
  { id: "rift-catacombs", name: "Rift Catacombs", level: 5, mode: "normal", floors: 5, bossIds: ["void-warden"], recommendedPower: 80, dailyLockout: false },
  { id: "star-devourer-lair", name: "Star Devourer's Lair", level: 25, mode: "heroic", floors: 8, bossIds: ["star-devourer"], recommendedPower: 450, dailyLockout: true }
];

export function startDungeon(definition: DungeonDefinition, partyId: string, playerLevel: number, power: number, now = Date.now()): DungeonRun {
  if (playerLevel < definition.level) throw new Error("player level is too low");
  if (power < definition.recommendedPower) throw new Error("combat power is too low");
  return { dungeonId: definition.id, partyId, floor: 1, startedAt: now, completed: false };
}

export function advanceDungeon(run: DungeonRun, definition: DungeonDefinition): DungeonRun {
  if (run.completed) throw new Error("dungeon already completed");
  if (run.floor >= definition.floors) return { ...run, completed: true };
  return { ...run, floor: run.floor + 1 };
}
