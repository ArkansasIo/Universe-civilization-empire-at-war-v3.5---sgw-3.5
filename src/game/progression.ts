/**
 * Shared, data-driven feature progression rules for the OGame-style game.
 *
 * UI code may use this to render locks, but authoritative server commands must
 * independently evaluate the same requirements before mutating game state.
 */
import { ADMIN_ONLY_ROUTES, ROUTE_LEVEL_LOCKS } from './levelLocks';

export type ProgressionRequirement =
  | { type: 'player-level'; minimum: number }
  | { type: 'building-level'; buildingId: string; minimum: number }
  | { type: 'technology-level'; technologyId: string; minimum: number }
  | { type: 'quest-complete'; questId: string }
  | { type: 'feature-unlocked'; featureId: string }
  | { type: 'resource'; resourceId: string; minimum: number };

export interface ProgressionState {
  playerLevel: number;
  buildingLevels: Readonly<Record<string, number | undefined>>;
  technologyLevels: Readonly<Record<string, number | undefined>>;
  completedQuestIds: ReadonlySet<string>;
  unlockedFeatureIds: ReadonlySet<string>;
  resources: Readonly<Record<string, number | undefined>>;
  /** Admins may bypass gameplay locks, but never authentication/authorization. */
  isAdmin?: boolean;
}

export interface FeatureDefinition {
  id: string;
  label: string;
  /** Admin-only features must be hidden in navigation and guarded at render/action time. */
  visibility: 'player' | 'admin';
  requirements: readonly ProgressionRequirement[];
}

export interface FeatureAccessResult {
  allowed: boolean;
  reasons: string[];
}

/**
 * Requirements beyond commander level. The level itself always comes from
 * `ROUTE_LEVEL_LOCKS`; these are for server-side checks once building and
 * technology state is authoritative.
 */
const EXTRA_REQUIREMENTS: Readonly<Record<string, readonly ProgressionRequirement[]>> = {
  'tech-tree': [{ type: 'building-level', buildingId: 'research-lab', minimum: 1 }],
  shipyard: [{ type: 'building-level', buildingId: 'shipyard', minimum: 1 }],
  'tempering-forge': [{ type: 'building-level', buildingId: 'tempering-forge', minimum: 1 }],
  'master-upgrades': [
    { type: 'building-level', buildingId: 'tempering-forge', minimum: 5 },
    { type: 'technology-level', technologyId: 'masterworking', minimum: 1 },
  ],
  'stargate-network': [{ type: 'technology-level', technologyId: 'stargate-theory', minimum: 1 }],
  megastructures: [{ type: 'technology-level', technologyId: 'megastructure-engineering', minimum: 1 }],
};

const ADMIN_LABELS: Readonly<Record<string, string>> = {
  'turn-system': 'Turn Engine',
  'admin-dashboard': 'Admin Control Panel',
};

export const FEATURE_PROGRESSION: readonly FeatureDefinition[] = [
  ...ROUTE_LEVEL_LOCKS.map((entry): FeatureDefinition => ({
    id: entry.route,
    label: entry.label,
    visibility: 'player',
    requirements: [
      ...(entry.level > 1 ? [{ type: 'player-level', minimum: entry.level } as const] : []),
      ...(EXTRA_REQUIREMENTS[entry.route] ?? []),
    ],
  })),
  ...ADMIN_ONLY_ROUTES.map((route): FeatureDefinition => ({
    id: route,
    label: ADMIN_LABELS[route] ?? route,
    visibility: 'admin',
    requirements: [],
  })),
];

/** Returns the feature lock state and human-readable reasons. */
export function evaluateFeatureAccess(
  feature: FeatureDefinition,
  state: ProgressionState,
): FeatureAccessResult {
  if (feature.visibility === 'admin' && !state.isAdmin) {
    return { allowed: false, reasons: ['Administrator permission required.'] };
  }
  if (state.isAdmin) return { allowed: true, reasons: [] };

  const reasons: string[] = [];
  for (const requirement of feature.requirements) {
    switch (requirement.type) {
      case 'player-level':
        if (state.playerLevel < requirement.minimum) {
          reasons.push(`Reach player level ${requirement.minimum} (current: ${state.playerLevel}).`);
        }
        break;
      case 'building-level': {
        const current = state.buildingLevels[requirement.buildingId] ?? 0;
        if (current < requirement.minimum) {
          reasons.push(`Upgrade ${requirement.buildingId} to level ${requirement.minimum} (current: ${current}).`);
        }
        break;
      }
      case 'technology-level': {
        const current = state.technologyLevels[requirement.technologyId] ?? 0;
        if (current < requirement.minimum) {
          reasons.push(`Research ${requirement.technologyId} to level ${requirement.minimum} (current: ${current}).`);
        }
        break;
      }
      case 'quest-complete':
        if (!state.completedQuestIds.has(requirement.questId)) {
          reasons.push(`Complete quest: ${requirement.questId}.`);
        }
        break;
      case 'feature-unlocked':
        if (!state.unlockedFeatureIds.has(requirement.featureId)) {
          reasons.push(`Unlock feature: ${requirement.featureId}.`);
        }
        break;
      case 'resource': {
        const current = state.resources[requirement.resourceId] ?? 0;
        if (current < requirement.minimum) {
          reasons.push(`Have ${requirement.minimum} ${requirement.resourceId} (current: ${current}).`);
        }
        break;
      }
    }
  }
  return { allowed: reasons.length === 0, reasons };
}

export function isFeatureVisibleToRole(feature: FeatureDefinition, isAdmin: boolean): boolean {
  return feature.visibility === 'player' || isAdmin;
}

export function getFeatureDefinition(featureId: string): FeatureDefinition | undefined {
  return FEATURE_PROGRESSION.find((feature) => feature.id === featureId);
}
