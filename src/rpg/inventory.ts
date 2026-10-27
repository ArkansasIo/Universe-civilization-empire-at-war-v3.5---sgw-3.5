export interface InventoryStack {
  itemId: string;
  quantity: number;
  maxStack: number;
}

export interface InventoryState {
  capacity: number;
  slots: InventoryStack[];
}

export function createInventory(capacity = 40): InventoryState {
  if (!Number.isInteger(capacity) || capacity < 1) throw new Error("capacity must be positive");
  return { capacity, slots: [] };
}

export function countItem(inventory: InventoryState, itemId: string): number {
  return inventory.slots.filter(s => s.itemId === itemId).reduce((n, s) => n + s.quantity, 0);
}

export function addItem(inventory: InventoryState, itemId: string, quantity: number, maxStack = 99): InventoryState {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("quantity must be positive");
  if (!Number.isInteger(maxStack) || maxStack < 1) throw new Error("maxStack must be positive");
  const slots = inventory.slots.map(s => ({ ...s }));
  let remaining = quantity;
  for (const slot of slots.filter(s => s.itemId === itemId && s.quantity < s.maxStack)) {
    const moved = Math.min(remaining, slot.maxStack - slot.quantity);
    slot.quantity += moved;
    remaining -= moved;
    if (!remaining) return { ...inventory, slots };
  }
  while (remaining > 0) {
    if (slots.length >= inventory.capacity) throw new Error("inventory capacity exceeded");
    const moved = Math.min(remaining, maxStack);
    slots.push({ itemId, quantity: moved, maxStack });
    remaining -= moved;
  }
  return { ...inventory, slots };
}

export function removeItem(inventory: InventoryState, itemId: string, quantity: number): InventoryState {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("quantity must be positive");
  if (countItem(inventory, itemId) < quantity) throw new Error(`insufficient ${itemId}`);
  let remaining = quantity;
  const slots: InventoryStack[] = [];
  for (const slot of inventory.slots) {
    const copy = { ...slot };
    if (copy.itemId === itemId && remaining > 0) {
      const removed = Math.min(remaining, copy.quantity);
      copy.quantity -= removed;
      remaining -= removed;
    }
    if (copy.quantity > 0) slots.push(copy);
  }
  return { ...inventory, slots };
}
