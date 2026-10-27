import { executeRepair, executeServerUpgrade, type CraftingInventory } from './crafting.js';
import type { ItemDefinition } from './types.js';
import type { CraftingTrack, CraftingUpgradeState, CraftingWallet, RepairRule, UpgradeResult } from './tempering.js';
import type { CraftingAuditEvent, CraftingStateStore, PersistedCraftingState } from './crafting-persistence.js';

export interface CraftingServiceRequest { requestId:string; playerId:string; item:ItemDefinition; state:CraftingUpgradeState; inventory:CraftingInventory; currency:number; track:CraftingTrack; useProtection?:boolean; timestamp?:number; }
export interface CraftingServiceResponse { result:UpgradeResult; state:PersistedCraftingState; }

/** Server-side crafting application service. RNG is generated here, never trusted from the client. */
export class CraftingService {
  constructor(private readonly store:CraftingStateStore,private readonly rng:()=>number=Math.random){}

  async loadState(playerId:string,itemId:string):Promise<PersistedCraftingState|null>{
    return this.store.load(playerId,itemId);
  }

  async upgrade(request:CraftingServiceRequest):Promise<CraftingServiceResponse>{
    const persisted=await this.store.load(request.playerId,request.item.id); const expectedVersion=persisted?.version??0;
    const state=persisted??{...request.state,itemId:request.item.id,ownerId:request.playerId,version:0,updatedAt:Date.now()};
    if(state.temperLevel!==request.state.temperLevel||state.masterworkRank!==request.state.masterworkRank)throw new Error('Crafting state is stale; reload the item before upgrading');
    const wallet:CraftingWallet={currency:request.currency,materials:{...request.inventory.materials}}; const roll=this.rng();
    if(!(roll>=0&&roll<1))throw new Error('RNG provider returned an invalid value');
    const result=executeServerUpgrade({item:request.item,state,wallet,playerId:request.playerId,track:request.track,roll,useProtection:request.useProtection,timestamp:request.timestamp});
    const saved=await this.store.save({...result.state,itemId:request.item.id,ownerId:request.playerId,version:state.version,updatedAt:Date.now()},expectedVersion);
    const event:CraftingAuditEvent={eventId:`craft-${request.requestId}`,requestId:request.requestId,ownerId:request.playerId,itemId:request.item.id,track:request.track,fromLevel:request.track==='tempering'?state.temperLevel:state.masterworkRank,toLevel:request.track==='tempering'?saved.temperLevel:saved.masterworkRank,success:result.success,roll,currencySpent:result.currencySpent,materialsSpent:Object.fromEntries(result.materialsSpent.map(m=>[m.itemId,m.quantity])),createdAt:Date.now()};
    await this.store.appendAudit(event); return {result,state:saved};
  }

  async repair(playerId:string,itemId:string,state:CraftingUpgradeState,wallet:CraftingWallet,rule:RepairRule){
    const persisted=await this.store.load(playerId,itemId); const expectedVersion=persisted?.version??0;
    if(persisted && (persisted.temperLevel!==state.temperLevel||persisted.masterworkRank!==state.masterworkRank||persisted.damaged!==state.damaged)) throw new Error('Crafting state is stale; reload the item before repairing');
    const wasDamaged=state.damaged;
    const result=executeRepair(state,wallet,rule); const saved=await this.store.save({...result.state,itemId,ownerId:playerId,version:persisted?.version??0,updatedAt:Date.now()},expectedVersion);
    const materialsSpent=wasDamaged?rule.materials:[]; const currencySpent=wasDamaged?rule.currencyCost:0;
    await this.store.appendAudit({eventId:`repair-${Date.now()}-${itemId}`,requestId:`repair-${Date.now()}`,ownerId:playerId,itemId,track:'repair',fromLevel:state.temperLevel,toLevel:saved.temperLevel,currencySpent,materialsSpent:Object.fromEntries(materialsSpent.map(m=>[m.itemId,m.quantity])),createdAt:Date.now()});
    return {result,state:saved};
  }
}
