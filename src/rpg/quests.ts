export type QuestType = "story" | "daily" | "repeatable" | "world";

export interface QuestDefinition {
  id: string;
  name: string;
  type: QuestType;
  level: number;
  objectives: { id: string; description: string; required: number }[];
  rewards: { xp: number; currency?: number; items?: { itemId: string; quantity: number }[] };
}

export interface QuestProgress {
  questId: string;
  objectives: Record<string, number>;
  completed: boolean;
  claimed: boolean;
}

export const STARTER_QUESTS: QuestDefinition[] = [
  { id: "first-battle", name: "First Battle", type: "story", level: 1, objectives: [{ id: "defeat", description: "Defeat hostile units", required: 3 }], rewards: { xp: 250, currency: 1000 } },
  { id: "rift-hunt", name: "Rift Hunt", type: "daily", level: 5, objectives: [{ id: "riftlings", description: "Defeat Riftlings", required: 10 }], rewards: { xp: 800, currency: 5000, items: [{ itemId: "tempering-stone", quantity: 3 }] } }
];

export function createQuestProgress(quest: QuestDefinition): QuestProgress {
  return { questId: quest.id, objectives: Object.fromEntries(quest.objectives.map(o => [o.id, 0])), completed: false, claimed: false };
}

export function advanceQuest(progress: QuestProgress, objectiveId: string, amount = 1, quest?: QuestDefinition): QuestProgress {
  if (amount < 1) throw new Error("amount must be positive");
  const objectives = { ...progress.objectives, [objectiveId]: (progress.objectives[objectiveId] ?? 0) + amount };
  const completed = quest ? quest.objectives.every(o => (objectives[o.id] ?? 0) >= o.required) : progress.completed;
  return { ...progress, objectives, completed };
}

export function claimQuest(progress: QuestProgress): QuestProgress {
  if (!progress.completed) throw new Error("quest is not complete");
  if (progress.claimed) throw new Error("quest reward already claimed");
  return { ...progress, claimed: true };
}
