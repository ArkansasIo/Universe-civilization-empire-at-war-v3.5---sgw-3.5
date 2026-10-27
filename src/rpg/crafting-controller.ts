import { CraftingService, type CraftingServiceRequest } from "./crafting-service.js";
import { previewUpgrade } from "./crafting.js";
import type { ItemDefinition } from "./types.js";
import type { CraftingUpgradeState, CraftingTrack } from "./tempering.js";
import type { CraftingPreviewResponse } from "./crafting-api.js";

export class CraftingController {
  constructor(private readonly service: CraftingService) {}

  preview(item: ItemDefinition, state: CraftingUpgradeState, track: CraftingTrack, useProtection = false): CraftingPreviewResponse {
    const preview = previewUpgrade(item, state, track, useProtection);
    return {
      ok: true,
      requestId: "preview",
      track,
      currentLevel: preview.currentLevel,
      nextLevel: preview.nextLevel,
      currencyCost: preview.currencyCost,
      materials: preview.materials,
      successChance: preview.successChance,
      protectedMaterials: preview.protectionMaterial ? [preview.protectionMaterial] : [],
    };
  }

  upgrade(request: CraftingServiceRequest) {
    return this.service.upgrade(request);
  }
}
