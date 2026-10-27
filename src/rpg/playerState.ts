import type { CoreAttributes, CombatContext, DerivedStats, EquipmentSlot, Resources } from './types';
import type { ClassId, ProgressionState } from './progression';
import type { Equipment, Inventory } from './inventory';
import type { ActiveStatusEffect } from './types';
export type PlayerRpgState={id:string;name:string;classId:ClassId;progression:ProgressionState;attributes:CoreAttributes;stats:DerivedStats;resources:Resources;inventory:Inventory;equipment:Equipment;effects:ActiveStatusEffect[];context:CombatContext;zoneId:string;guildId?:string;createdAt:number;updatedAt:number};
export function createPlayerRpgState(input:Pick<PlayerRpgState,'id'|'name'|'classId'|'attributes'|'stats'|'inventory'|'equipment'|'zoneId'>):PlayerRpgState{return{...input,progression:{level:1,xp:0,skillPoints:0,talentPoints:0,attributes:input.attributes},resources:{hp:1,maxHp:1,mp:1,maxMp:1,stamina:1,maxStamina:1},effects:[],context:'pve',createdAt:Date.now(),updatedAt:Date.now()};}
export function switchCombatContext(state:PlayerRpgState,context:CombatContext):PlayerRpgState{return{...state,context,updatedAt:Date.now()};}
