export type EquipmentSlot = "head" | "chest" | "hands" | "legs" | "feet" | "mainHand" | "offHand" | "ring1" | "ring2" | "amulet";

export interface EquippedItem {
  instanceId: string;
  itemId: string;
  slot: EquipmentSlot;
  requiredLevel?: number;
}

export type EquipmentLoadout = Partial<Record<EquipmentSlot, EquippedItem>>;

const SLOT_ORDER: EquipmentSlot[] = ["head", "chest", "hands", "legs", "feet", "mainHand", "offHand", "ring1", "ring2", "amulet"];

export function equip(loadout: EquipmentLoadout, item: EquippedItem): EquipmentLoadout {
  if (!SLOT_ORDER.includes(item.slot)) throw new Error(`invalid equipment slot: ${item.slot}`);
  return { ...loadout, [item.slot]: { ...item } };
}

export function unequip(loadout: EquipmentLoadout, slot: EquipmentSlot): { loadout: EquipmentLoadout; item?: EquippedItem } {
  const item = loadout[slot];
  const next = { ...loadout };
  delete next[slot];
  return { loadout: next, item };
}

export function listEquipped(loadout: EquipmentLoadout): EquippedItem[] {
  return SLOT_ORDER.flatMap(slot => loadout[slot] ? [loadout[slot]!] : []);
}
