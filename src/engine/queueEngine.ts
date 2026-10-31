import type { ID, Resources } from './types';

export type QueueKind = 'building' | 'shipyard' | 'research';
export type ResourceCost = Partial<Resources>;

/** Cost/time curve for anything that can be queued. Levels apply to buildings and research; shipyard items scale by quantity. */
export interface ProductionDefinition {
  id: string;
  kind: QueueKind;
  baseCost: ResourceCost;
  costGrowth: number;
  baseSeconds: number;
  timeGrowth: number;
  maxLevel?: number;
  prerequisites?: Record<string, number>;
}

export interface QueueItem {
  id: ID;
  ownerId: ID;
  kind: QueueKind;
  /** Planet ID for building/shipyard queues, player ID for research. */
  targetId: ID;
  definitionId: string;
  /** Level reached on completion (building/research); 0 for shipyard. */
  level: number;
  quantity: number;
  cost: ResourceCost;
  startedAt: number;
  completesAt: number;
}

export interface BuildQueue {
  kind: QueueKind;
  targetId: ID;
  maxSlots: number;
  items: QueueItem[];
}

export interface EnqueueRequest {
  id: ID;
  ownerId: ID;
  definition: ProductionDefinition;
  /** Current completed level of this building/technology (ignored for shipyard). */
  currentLevel?: number;
  quantity?: number;
  /** Multiplier from facilities such as robotics or labs; > 0, lower is faster. */
  speedFactor?: number;
}

export const DEFAULT_QUEUE_SLOTS: Record<QueueKind, number> = { building: 5, shipyard: 10, research: 3 };
export const MAX_SHIPYARD_BATCH = 100_000;

const RESOURCE_KEYS: (keyof Resources)[] = ['naquadah', 'metal', 'crystal', 'deuterium', 'energy', 'darkMatter'];

export function createQueue(kind: QueueKind, targetId: ID, maxSlots = DEFAULT_QUEUE_SLOTS[kind]): BuildQueue {
  if (!targetId) throw new Error('INVALID_QUEUE_TARGET');
  if (!Number.isSafeInteger(maxSlots) || maxSlots < 1) throw new Error('INVALID_QUEUE_SLOTS');
  return { kind, targetId, maxSlots, items: [] };
}

function scaleCost(cost: ResourceCost, factor: number): ResourceCost {
  const out: ResourceCost = {};
  for (const key of RESOURCE_KEYS) {
    const amount = cost[key];
    if (amount === undefined) continue;
    if (!Number.isFinite(amount) || amount < 0) throw new Error('INVALID_COST');
    const scaled = Math.floor(amount * factor);
    if (!Number.isSafeInteger(scaled)) throw new Error('COST_OVERFLOW');
    out[key] = scaled;
  }
  return out;
}

function validateDefinition(def: ProductionDefinition): void {
  if (!def.id) throw new Error('INVALID_DEFINITION');
  if (!Number.isFinite(def.costGrowth) || def.costGrowth < 1) throw new Error('INVALID_COST_GROWTH');
  if (!Number.isFinite(def.timeGrowth) || def.timeGrowth < 1) throw new Error('INVALID_TIME_GROWTH');
  if (!Number.isFinite(def.baseSeconds) || def.baseSeconds <= 0) throw new Error('INVALID_BASE_SECONDS');
}

/** Cost of one unit (shipyard) or of upgrading to `level` (building/research). */
export function productionCost(def: ProductionDefinition, level = 1): ResourceCost {
  validateDefinition(def);
  if (!Number.isSafeInteger(level) || level < 1) throw new Error('INVALID_LEVEL');
  if (def.maxLevel !== undefined && level > def.maxLevel) throw new Error('MAX_LEVEL_REACHED');
  return scaleCost(def.baseCost, Math.pow(def.costGrowth, level - 1));
}

export function productionSeconds(def: ProductionDefinition, level = 1, speedFactor = 1): number {
  validateDefinition(def);
  if (!Number.isSafeInteger(level) || level < 1) throw new Error('INVALID_LEVEL');
  if (!Number.isFinite(speedFactor) || speedFactor <= 0) throw new Error('INVALID_SPEED_FACTOR');
  return Math.max(1, Math.ceil(def.baseSeconds * Math.pow(def.timeGrowth, level - 1) * speedFactor));
}

export function meetsPrerequisites(def: ProductionDefinition, levels: Record<string, number>): boolean {
  return Object.entries(def.prerequisites ?? {}).every(([id, required]) => (levels[id] ?? 0) >= required);
}

/** Highest level already queued for a definition, so consecutive upgrades chain (L3 → L4 → L5). */
export function queuedLevel(queue: BuildQueue, definitionId: string, currentLevel: number): number {
  return queue.items
    .filter((item) => item.definitionId === definitionId)
    .reduce((highest, item) => Math.max(highest, item.level), currentLevel);
}

/** Items run one after another; a new item starts when the last one finishes (or now, if idle). */
export function enqueue(queue: BuildQueue, request: EnqueueRequest, now: number): { queue: BuildQueue; item: QueueItem } {
  const { definition } = request;
  if (definition.kind !== queue.kind) throw new Error('QUEUE_KIND_MISMATCH');
  if (!request.id || !request.ownerId) throw new Error('INVALID_QUEUE_ITEM');
  if (queue.items.some((item) => item.id === request.id)) throw new Error('DUPLICATE_QUEUE_ITEM');
  if (queue.items.length >= queue.maxSlots) throw new Error('QUEUE_FULL');
  if (!Number.isFinite(now)) throw new Error('INVALID_TIME');

  const speed = request.speedFactor ?? 1;
  let level = 0;
  let quantity = 1;
  let cost: ResourceCost;
  let seconds: number;

  if (queue.kind === 'shipyard') {
    quantity = request.quantity ?? 1;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_SHIPYARD_BATCH) throw new Error('INVALID_QUANTITY');
    cost = scaleCost(productionCost(definition, 1), quantity);
    seconds = productionSeconds(definition, 1, speed) * quantity;
  } else {
    const current = request.currentLevel ?? 0;
    if (!Number.isSafeInteger(current) || current < 0) throw new Error('INVALID_LEVEL');
    level = queuedLevel(queue, definition.id, current) + 1;
    cost = productionCost(definition, level);
    seconds = productionSeconds(definition, level, speed);
  }

  const last = queue.items[queue.items.length - 1];
  const startedAt = last ? Math.max(now, last.completesAt) : now;
  const item: QueueItem = {
    id: request.id,
    ownerId: request.ownerId,
    kind: queue.kind,
    targetId: queue.targetId,
    definitionId: definition.id,
    level,
    quantity,
    cost,
    startedAt,
    completesAt: startedAt + seconds * 1000,
  };
  return { queue: { ...queue, items: [...queue.items, item] }, item };
}

/**
 * Removes an item. Items not yet started refund in full; the running item refunds the unspent
 * fraction (rounded down). Later items shift earlier to close the gap. Cancelling a building or
 * research level also cancels any higher queued levels of the same definition, which depend on it.
 */
export function cancel(queue: BuildQueue, itemId: ID, now: number): { queue: BuildQueue; cancelled: QueueItem[]; refund: ResourceCost } {
  const target = queue.items.find((item) => item.id === itemId);
  if (!target) throw new Error('QUEUE_ITEM_NOT_FOUND');
  if (target.completesAt <= now) throw new Error('QUEUE_ITEM_ALREADY_COMPLETE');

  const removed = new Set<ID>([target.id]);
  if (queue.kind !== 'shipyard') {
    for (const item of queue.items) {
      if (item.definitionId === target.definitionId && item.level > target.level) removed.add(item.id);
    }
  }

  const refund: ResourceCost = {};
  const cancelled: QueueItem[] = [];
  for (const item of queue.items) {
    if (!removed.has(item.id)) continue;
    cancelled.push(item);
    const duration = item.completesAt - item.startedAt;
    const fraction = item.startedAt >= now ? 1 : (item.completesAt - now) / duration;
    const part = scaleCost(item.cost, fraction);
    for (const key of RESOURCE_KEYS) {
      if (part[key] !== undefined) refund[key] = (refund[key] ?? 0) + part[key]!;
    }
  }

  // Re-pack the remaining items so the timeline has no gaps.
  const items: QueueItem[] = [];
  let cursor = now;
  for (const item of queue.items) {
    if (removed.has(item.id)) continue;
    if (item.startedAt <= now) {
      items.push(item);
      cursor = item.completesAt;
      continue;
    }
    const duration = item.completesAt - item.startedAt;
    const startedAt = Math.max(now, cursor);
    items.push({ ...item, startedAt, completesAt: startedAt + duration });
    cursor = startedAt + duration;
  }
  return { queue: { ...queue, items }, cancelled, refund };
}

export function collectCompleted(queue: BuildQueue, now: number): { queue: BuildQueue; completed: QueueItem[] } {
  const completed = queue.items.filter((item) => item.completesAt <= now);
  if (completed.length === 0) return { queue, completed };
  return { queue: { ...queue, items: queue.items.filter((item) => item.completesAt > now) }, completed };
}
