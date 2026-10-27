import type { ItemDefinition, EquipmentSlot } from './types';

export type ItemStack={itemId:string;quantity:number;instanceId?:string;durability?:number};
export type Inventory={capacity:number;stacks:ItemStack[]};
export type Equipment=Partial<Record<EquipmentSlot,ItemStack>>;

export function createInventory(capacity=60):Inventory{return{capacity,stacks:[]};}
export function countItem(inv:Inventory,itemId:string):number{return inv.stacks.filter(s=>s.itemId===itemId).reduce((n,s)=>n+s.quantity,0);}
export function addItem(inv:Inventory,item:ItemStack,definition:ItemDefinition):Inventory{
  if(item.quantity<=0)return inv; const stacks=inv.stacks.map(s=>({...s})); const limit=definition.stackLimit??1;
  let remaining=item.quantity;
  for(const s of stacks){if(s.itemId===item.itemId&&remaining>0){const add=Math.min(remaining,Math.max(0,limit-s.quantity));s.quantity+=add;remaining-=add;}}
  while(remaining>0&&stacks.length<inv.capacity){const add=Math.min(remaining,limit);stacks.push({...item,quantity:add,instanceId:item.instanceId??crypto.randomUUID()});remaining-=add;}
  if(remaining>0)throw new Error('Inventory capacity exceeded'); return {...inv,stacks};
}
export function removeItem(inv:Inventory,itemId:string,quantity:number):Inventory{if(quantity<0||countItem(inv,itemId)<quantity)throw new Error('Insufficient item quantity');let left=quantity;const stacks=[] as ItemStack[];for(const s of inv.stacks){if(s.itemId===itemId&&left>0){const take=Math.min(left,s.quantity);left-=take;const remain=s.quantity-take;if(remain>0)stacks.push({...s,quantity:remain});}else stacks.push({...s});}return{...inv,stacks};}
export function equipItem(inv:Inventory,equipment:Equipment,itemId:string,slot:EquipmentSlot):{inventory:Inventory;equipment:Equipment}{const stack=inv.stacks.find(s=>s.itemId===itemId);if(!stack)throw new Error('Item not found');const nextInv=removeItem(inv,itemId,1);const previous=equipment[slot];if(previous)nextInv.stacks.push({...previous,quantity:1});return{inventory:nextInv,equipment:{...equipment,[slot]:{...stack,quantity:1}}};}
export function unequipItem(inv:Inventory,equipment:Equipment,slot:EquipmentSlot):{inventory:Inventory;equipment:Equipment}{const item=equipment[slot];if(!item)return{inventory:inv,equipment};const next=addItem(inv,item,{id:item.itemId,name:item.itemId,description:'',kind:'armor',rarity:'common',itemLevel:1,requiredLevel:1,stackLimit:1});const nextEq={...equipment};delete nextEq[slot];return{inventory:next,equipment:nextEq};}
