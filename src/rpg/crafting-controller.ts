import { CraftingService, type CraftingServiceRequest } from "./crafting-service.js";
import { previewUpgrade, type CraftingInventory } from "./crafting.js";
import type { ItemDefinition } from "./types.js";
import type { CraftingUpgradeState, CraftingTrack } from "./tempering.js";
import type { CraftingPreviewResponse } from "./crafting-api.js";

export class CraftingController {
  constructor(private readonly service: CraftingService) {}

  preview(item: ItemDefinition, state: CraftingUpgradeState, inventory: CraftingInventory, currency: number, track: CraftingTrack, useProtection = false): CraftingPreviewResponse {
    const preview = previewUpgrade(item, state, inventory, currency, track, useProtection);
    return {
      ok: true,
      requestId: "preview",
      track,
      currentLevel: track === "tempering" ? state.temperLevel : state.masterworkRank,
      nextLevel: track === "tempering" ? state.temperLevel + 1 : state.masterworkRank + 1,
      currencyCost: preview.currencyCost,
      materials: preview.materials,
      successChance: preview.successChance,
      protectedMaterials: preview.protectedMaterials,
    };
  }

  upgrade(request: CraftingServiceRequest) {
    return this.service.upgrade(request);
  }
}
