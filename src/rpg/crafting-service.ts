import { createCraftingUpgradeState } from './tempering.js';
import { executeRepair, executeServerUpgrade, type CraftingInventory } from './crafting.js';
import type { ItemDefinition } from './types.js';
import type { CraftingTrack, CraftingUpgradeState, CraftingWallet, RepairRule, UpgradeResult } from './tempering.js';
import type { CraftingAuditEvent, CraftingStateStore, PersistedCraftingState } from './crafting-persistence.js';

export interface CraftingServiceRequest { requestId:string; playerId:string; item:ItemDefinition; state:CraftingUpgradeState; inventory:CraftingInventory; currency:number; track:CraftingTrack; useProtection?:boolean; timestamp?:number; }
export interface CraftingServiceResponse { result:UpgradeResult; state:PersistedCraftingState; }

function sameCraftingSnapshot(authoritative:CraftingUpgradeState, submitted:CraftingUpgradeState):boolean {
  return authoritative.itemId===submitted.itemId &&
    authoritative.temperLevel===submitted.temperLevel &&
    authoritative.masterworkRank===submitted.masterworkRank &&
    authoritative.temperXp===submitted.temperXp &&
    authoritative.masterworkXp===submitted.masterworkXp &&
    authoritative.maxTemperLevel===submitted.maxTemperLevel &&
    authoritative.maxMasterworkRank===submitted.maxMasterworkRank &&
    authoritative.damaged===submitted.damaged &&
    authoritative.locked===submitted.locked;
}

/** Server-side crafting application service. RNG is generated here, never trusted from the client. */
export class CraftingService {
  constructor(private readonly store:CraftingStateStore,private readonly rng:()=>number=Math.random){}

  async loadState(playerId:string,itemId:string):Promise<PersistedCraftingState|null>{
    return this.store.load(playerId,itemId);
  }

  async upgrade(request:CraftingServiceRequest):Promise<CraftingServiceResponse>{
    if(!request.requestId || request.requestId.length>192) throw new Error('A valid crafting requestId is required');
    if(!request.playerId || !request.item?.id) throw new Error('Player and item are required');
    const persisted=await this.store.load(request.playerId,request.item.id);
    const expectedVersion=persisted?.version??0;

    // Never bootstrap durable progress from a client-supplied state. A first-time
    // item starts at the canonical zero-upgrade state; subsequent requests must
    // match the state loaded from the server.
    const state:PersistedCraftingState=persisted??{
      ...createCraftingUpgradeState(request.item),
      itemId:request.item.id,ownerId:request.playerId,version:0,updatedAt:Date.now(),
    };
    if(!sameCraftingSnapshot(state,request.state))
      throw new Error('Crafting state is stale or invalid; reload the item before upgrading');

    const wallet:CraftingWallet={currency:request.currency,materials:{...request.inventory.materials}};
    const roll=this.rng();
    if(!(roll>=0&&roll<1)) throw new Error('RNG provider returned an invalid value');
    const result=executeServerUpgrade({item:request.item,state,wallet,playerId:request.playerId,track:request.track,roll,useProtection:request.useProtection,timestamp:request.timestamp});
    const saved=await this.store.save({...result.state,itemId:request.item.id,ownerId:request.playerId,version:state.version,updatedAt:Date.now()},expectedVersion);
    const event:CraftingAuditEvent={
      eventId:`craft-${request.requestId}`,requestId:request.requestId,ownerId:request.playerId,itemId:request.item.id,
      track:request.track==='masterworking'?'masterwork':request.track,
      fromLevel:request.track==='tempering'?state.temperLevel:state.masterworkRank,
      toLevel:request.track==='tempering'?saved.temperLevel:saved.masterworkRank,
      success:result.success,roll,currencySpent:result.currencySpent,
      materialsSpent:Object.fromEntries(result.materialsSpent.map(m=>[m.itemId,m.quantity])),createdAt:Date.now(),
    };
    await this.store.appendAudit(event);
    return {result,state:saved};
  }

  async repair(playerId:string,itemId:string,state:CraftingUpgradeState,wallet:CraftingWallet,rule:RepairRule){
    const persisted=await this.store.load(playerId,itemId);
    if(!persisted) throw new Error('Crafting state not found; load or upgrade the item before repairing');
    const expectedVersion=persisted.version;
    if(!sameCraftingSnapshot(persisted,state))
      throw new Error('Crafting state is stale or invalid; reload the item before repairing');
    const wasDamaged=persisted.damaged;
    const result=executeRepair(persisted,wallet,rule);
    const saved=await this.store.save({...result.state,itemId,ownerId:playerId,version:persisted.version,updatedAt:Date.now()},expectedVersion);
    const materialsSpent=wasDamaged?rule.materials:[];
    const currencySpent=wasDamaged?rule.currencyCost:0;
    const requestId=`repair-${Date.now()}-${itemId}`;
    await this.store.appendAudit({
      eventId:requestId,requestId,ownerId:playerId,itemId,track:'repair',
      fromLevel:persisted.temperLevel,toLevel:saved.temperLevel,currencySpent,
      materialsSpent:Object.fromEntries(materialsSpent.map(m=>[m.itemId,m.quantity])),createdAt:Date.now(),
    });
    return {result,state:saved};
  }
}
