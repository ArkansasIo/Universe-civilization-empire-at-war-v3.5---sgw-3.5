import { accrueTurns, processTurns } from '../../engine/turnEngine';
import type { PlayerResources, PlanetColony } from '../../types';

export interface TurnServiceResult {
  resources: PlayerResources;
  processedTurns: number;
  generatedNaquadah: number;
}

export class TurnService {
  accrue(resources: PlayerResources, elapsedTicks: number): PlayerResources {
    return accrueTurns(resources, elapsedTicks);
  }

  process(resources: PlayerResources, colonies: PlanetColony[], requestedTurns: number): TurnServiceResult {
    const result = processTurns(resources, colonies, requestedTurns);
    return {
      resources: result.resources,
      processedTurns: result.processedTurns,
      generatedNaquadah: result.generatedNaquadah,
    };
  }
}
