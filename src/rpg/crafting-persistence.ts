import type { CraftingUpgradeState } from "./tempering.js";

export interface PersistedCraftingState extends CraftingUpgradeState { itemId:string; ownerId:string; version:number; updatedAt:number; }
export interface CraftingAuditEvent { eventId:string; requestId:string; ownerId:string; itemId:string; track:"tempering"|"masterwork"|"repair"; fromLevel:number; toLevel:number; success?:boolean; roll?:number; currencySpent:number; materialsSpent:Record<string,number>; createdAt:number; }
export interface CraftingStateStore { load(ownerId:string,itemId:string):Promise<PersistedCraftingState|null>; save(state:PersistedCraftingState,expectedVersion:number):Promise<PersistedCraftingState>; appendAudit(event:CraftingAuditEvent):Promise<void>; }

export class MemoryCraftingStateStore implements CraftingStateStore {
  private readonly states=new Map<string,PersistedCraftingState>();
  readonly audit:CraftingAuditEvent[]=[];
  private key(ownerId:string,itemId:string){return `${ownerId}:${itemId}`;}
  async load(ownerId:string,itemId:string){const state=this.states.get(this.key(ownerId,itemId));return state?structuredClone(state):null;}
  async save(state:PersistedCraftingState,expectedVersion:number){const key=this.key(state.ownerId,state.itemId);const current=this.states.get(key);if(current&&current.version!==expectedVersion)throw new Error("Crafting state version conflict");if(!current&&expectedVersion!==0)throw new Error("Crafting state version conflict");const next={...structuredClone(state),version:expectedVersion+1,updatedAt:Date.now()};this.states.set(key,next);return structuredClone(next);}
  async appendAudit(event:CraftingAuditEvent){this.audit.push(structuredClone(event));}
  getAuditEvents():CraftingAuditEvent[]{return structuredClone(this.audit);}
}
