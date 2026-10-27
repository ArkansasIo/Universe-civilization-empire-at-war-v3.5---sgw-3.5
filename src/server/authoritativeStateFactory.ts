import type { PlayerState } from '../engine/types';
import type { GameState } from './gameCommands';

/**
 * Creates the command-engine state for a newly registered player.
 * The legacy PlayerState remains the profile/resource projection while this
 * snapshot is the authoritative state consumed by game commands.
 */
export function createInitialAuthoritativeState(player: PlayerState): GameState {
  return {
    playerId: player.id,
    resources: {
      naquadah: player.resources.naquadah,
      bankedNaquadah: player.bankedNaquadah,
      metal: player.resources.metal,
      crystal: player.resources.crystal,
      deuterium: player.resources.deuterium,
      energy: player.resources.energy,
      maxEnergy: Math.max(100, player.resources.energy),
      attackTurns: 5,
      untrainedUnits: 0,
      miners: 0,
      lifers: 0,
      unitProduction: 0,
      attackUnits: 100,
      defenseUnits: 50,
      spies: 0,
      antiSpies: 0,
      superUnits: 0,
      darkMatter: player.resources.darkMatter,
    },
    colonies: [],
    technologies: {},
    inventory: {},
    fleets: {},
    version: 0,
  };
}
