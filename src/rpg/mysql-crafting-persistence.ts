import type { CraftingAuditEvent, CraftingStateStore, PersistedCraftingState } from './crafting-persistence.js';

/** Minimal mysql2-compatible connection contract. Keeps the RPG module driver-agnostic. */
export interface MySqlQueryExecutor { execute<T = unknown>(sql: string, params?: readonly unknown[]): Promise<[T, unknown]>; }
interface StateRow {
  owner_id:string; item_id:string; temper_level:number; masterwork_rank:number;
  temper_xp:number; masterwork_xp:number; max_temper_level:number; max_masterwork_rank:number;
  damaged:number|boolean; locked:number|boolean; history:unknown; version:number|string; updated_at:number|string;
}
function parseJson(value:unknown): unknown { if(typeof value==='string') return JSON.parse(value); return value; }

export class MySqlCraftingStateStore implements CraftingStateStore {
  constructor(private readonly db:MySqlQueryExecutor) {}
  async load(ownerId:string,itemId:string):Promise<PersistedCraftingState|null>{
    const [rows]=await this.db.execute<StateRow[]>(
      `SELECT owner_id,item_id,temper_level,masterwork_rank,temper_xp,masterwork_xp,max_temper_level,max_masterwork_rank,damaged,locked,history,version,updated_at
       FROM rpg_item_upgrade_state WHERE owner_id=? AND item_id=? LIMIT 1`,[ownerId,itemId]);
    const row=rows[0]; if(!row) return null;
    return { ownerId:row.owner_id,itemId:row.item_id,temperLevel:Number(row.temper_level),masterworkRank:Number(row.masterwork_rank),
      temperXp:Number(row.temper_xp),masterworkXp:Number(row.masterwork_xp),maxTemperLevel:Number(row.max_temper_level),maxMasterworkRank:Number(row.max_masterwork_rank),
      damaged:Boolean(row.damaged),locked:Boolean(row.locked),history:parseJson(row.history) as PersistedCraftingState['history'],version:Number(row.version),updatedAt:Number(row.updated_at) };
  }
  async save(state:PersistedCraftingState,expectedVersion:number):Promise<PersistedCraftingState>{
    const now=Date.now(),nextVersion=expectedVersion+1;
    const [result]=await this.db.execute<{affectedRows?:number}>(
      `INSERT INTO rpg_item_upgrade_state
       (owner_id,item_id,temper_level,masterwork_rank,temper_xp,masterwork_xp,max_temper_level,max_masterwork_rank,damaged,locked,history,version,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,CAST(? AS JSON),?,?)
       ON DUPLICATE KEY UPDATE
         temper_level=IF(version=?,VALUES(temper_level),temper_level),masterwork_rank=IF(version=?,VALUES(masterwork_rank),masterwork_rank),
         temper_xp=IF(version=?,VALUES(temper_xp),temper_xp),masterwork_xp=IF(version=?,VALUES(masterwork_xp),masterwork_xp),
         max_temper_level=IF(version=?,VALUES(max_temper_level),max_temper_level),max_masterwork_rank=IF(version=?,VALUES(max_masterwork_rank),max_masterwork_rank),
         damaged=IF(version=?,VALUES(damaged),damaged),locked=IF(version=?,VALUES(locked),locked),history=IF(version=?,VALUES(history),history),
         version=IF(version=?,VALUES(version),version),updated_at=IF(version=?,VALUES(updated_at),updated_at)`,
      [state.ownerId,state.itemId,state.temperLevel,state.masterworkRank,state.temperXp,state.masterworkXp,state.maxTemperLevel,state.maxMasterworkRank,state.damaged?1:0,state.locked?1:0,JSON.stringify(state.history),nextVersion,now,
       expectedVersion,expectedVersion,expectedVersion,expectedVersion,expectedVersion,expectedVersion,expectedVersion,expectedVersion,expectedVersion,expectedVersion]);
    if(Number(result?.affectedRows??0)===0) throw new Error('Crafting state version conflict');
    const saved=await this.load(state.ownerId,state.itemId); if(!saved||saved.version!==nextVersion) throw new Error('Crafting state version conflict'); return saved;
  }
  async appendAudit(event:CraftingAuditEvent):Promise<void>{
    await this.db.execute(`INSERT INTO crafting_upgrade_audit (event_id,request_id,owner_id,item_id,track,from_level,to_level,success,roll,currency_spent,materials_spent,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,CAST(? AS JSON),?)`,
      [event.eventId,event.requestId,event.ownerId,event.itemId,event.track,event.fromLevel,event.toLevel,event.success==null?null:(event.success?1:0),event.roll??null,event.currencySpent,JSON.stringify(event.materialsSpent),event.createdAt]);
  }
}
