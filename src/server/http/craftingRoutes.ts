import { Router, type Response } from 'express';
import { previewUpgrade } from '../../rpg/crafting.js';
import { isCraftingUpgradeRequest, type CraftingUpgradeRequest } from '../../rpg/crafting-api.js';
import type { CraftingService, CraftingServiceRequest } from '../../rpg/crafting-service.js';
import type { ItemDefinition } from '../../rpg/types.js';
import type { CraftingUpgradeState, RepairRule } from '../../rpg/tempering.js';
import type { AuthenticatedRequest } from './httpTypes.js';

export interface CraftingRouteServices { crafting: CraftingService; }

function errorCode(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/stale|version conflict/i.test(message)) return 'STALE_STATE';
  if (/insufficient|not enough/i.test(message)) return 'INSUFFICIENT_MATERIALS';
  return 'CRAFTING_FAILED';
}
function sendCraftingError(res: Response, status: number, requestId: string | undefined, error: unknown): void {
  res.status(status).json({ ok: false, requestId, error: errorCode(error) });
}

export function registerCraftingRoutes(router: Router, services: CraftingRouteServices): void {
  router.post('/crafting/preview', async (req: AuthenticatedRequest, res) => {
    const body = req.body as Partial<CraftingUpgradeRequest>;
    if (!body || typeof body.requestId !== 'string' || (body.track !== 'tempering' && body.track !== 'masterworking') || !body.state || !body.item) {
      res.status(400).json({ ok: false, error: 'INVALID_REQUEST' }); return;
    }
    try {
      const preview = previewUpgrade(body.item as ItemDefinition, body.state as CraftingUpgradeState, body.track, Boolean(body.useProtection));
      res.json({ ok: true, requestId: body.requestId, track: preview.track, currentLevel: preview.currentLevel, nextLevel: preview.nextLevel, currencyCost: preview.currencyCost, materials: preview.materials, successChance: preview.successChance, protectedMaterials: preview.protectionMaterial ? [preview.protectionMaterial] : [] });
    } catch (error) { sendCraftingError(res, 400, body.requestId, error); }
  });

  router.post('/crafting/upgrade', async (req: AuthenticatedRequest, res) => {
    const body = req.body;
    if (!isCraftingUpgradeRequest(body)) { res.status(400).json({ ok: false, error: 'INVALID_REQUEST' }); return; }
    if (body.playerId !== req.auth!.playerId) { res.status(403).json({ ok: false, requestId: body.requestId, error: 'PLAYER_MISMATCH' }); return; }
    try {
      const request: CraftingServiceRequest = { requestId: body.requestId, playerId: req.auth!.playerId, item: body.item, state: body.state, inventory: body.inventory, currency: body.currency, track: body.track, useProtection: body.useProtection };
      const result = await services.crafting.upgrade(request);
      res.json({ ok: true, requestId: body.requestId, result });
    } catch (error) { sendCraftingError(res, 409, body.requestId, error); }
  });

  router.get('/crafting/:itemId/state', async (req: AuthenticatedRequest, res) => {
    try { res.json({ ok: true, itemId: req.params.itemId, state: await services.crafting.loadState(req.auth!.playerId, req.params.itemId) }); }
    catch (error) { sendCraftingError(res, 500, undefined, error); }
  });

  router.post('/crafting/repair', async (req: AuthenticatedRequest, res) => {
    const body = req.body as { requestId?: string; playerId?: string; itemId?: string; state?: CraftingUpgradeState; currency?: number; materials?: Record<string, number>; rule?: RepairRule };
    if (body.playerId !== req.auth!.playerId || typeof body.itemId !== 'string' || !body.state || typeof body.currency !== 'number' || !body.materials || !body.rule) { res.status(400).json({ ok: false, error: 'INVALID_REQUEST' }); return; }
    try {
      const result = await services.crafting.repair(req.auth!.playerId, body.itemId, body.state, { currency: body.currency, materials: { ...body.materials } }, body.rule);
      res.json({ ok: true, requestId: body.requestId ?? `repair-${Date.now()}`, result });
    } catch (error) { sendCraftingError(res, 409, body.requestId, error); }
  });
}
