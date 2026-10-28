import type { PlayerResources } from '../types';

export type ResourceKey =
  | 'naquadah'
  | 'bankedNaquadah'
  | 'metal'
  | 'crystal'
  | 'deuterium'
  | 'energy'
  | 'darkMatter'
  | 'credits'
  | 'gateTokens'
  | 'dimensionalTokens'
  | 'raidTokens';

export type ResourceDelta = Partial<Record<ResourceKey, number>>;

export interface ResourceTransactionResult {
  ok: boolean;
  reason?: string;
  resources: PlayerResources;
}

const NON_NEGATIVE_RESOURCES: ResourceKey[] = [
  'naquadah',
  'bankedNaquadah',
  'metal',
  'crystal',
  'deuterium',
  'energy',
  'darkMatter',
  'credits',
  'gateTokens',
  'dimensionalTokens',
  'raidTokens',
];

function isFiniteDelta(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Applies a complete resource delta atomically. The input object is never
 * mutated. If any delta is invalid or would make a resource negative, the
 * original resource snapshot is returned unchanged.
 */
export function applyResourceDelta(
  current: PlayerResources,
  delta: ResourceDelta,
): ResourceTransactionResult {
  const next = { ...current };

  for (const [rawKey, rawDelta] of Object.entries(delta)) {
    const key = rawKey as ResourceKey;
    if (!NON_NEGATIVE_RESOURCES.includes(key)) {
      return { ok: false, reason: `Unsupported resource: ${rawKey}`, resources: { ...current } };
    }
    if (!isFiniteDelta(rawDelta)) {
      return { ok: false, reason: `Invalid delta for ${rawKey}`, resources: { ...current } };
    }

    const before = current[key] ?? 0;
    const after = before + rawDelta;
    if (!Number.isFinite(after)) {
      return { ok: false, reason: `Invalid resulting value for ${rawKey}`, resources: { ...current } };
    }
    if (after < 0) {
      return { ok: false, reason: `Insufficient ${rawKey}`, resources: { ...current } };
    }
    (next as unknown as Record<string, number | undefined>)[key] = after;
  }

  return { ok: true, resources: next };
}

export function canAfford(current: PlayerResources, cost: ResourceDelta): boolean {
  return applyResourceDelta(current, negateDelta(cost)).ok;
}

export function negateDelta(delta: ResourceDelta): ResourceDelta {
  return Object.fromEntries(
    Object.entries(delta).map(([key, value]) => [key, -(value ?? 0)]),
  ) as ResourceDelta;
}

export function spendResources(
  current: PlayerResources,
  cost: ResourceDelta,
): ResourceTransactionResult {
  return applyResourceDelta(current, negateDelta(cost));
}

export function grantResources(
  current: PlayerResources,
  grant: ResourceDelta,
): ResourceTransactionResult {
  return applyResourceDelta(current, grant);
}
