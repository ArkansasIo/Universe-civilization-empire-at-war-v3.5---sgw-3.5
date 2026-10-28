import assert from 'node:assert/strict';
import {
  canMoveToVault,
  canStackStashItems,
  getStashTabProgress,
  getVaultCapacity,
  getVaultUpgradeCost,
  previewVaultUpgrade,
  validateVaultItems,
  VAULT_RULES,
  type VaultKind,
} from '../src/game/vault-progression';

const kinds: VaultKind[] = ['protected', 'inventory', 'equipment'];
for (const kind of kinds) {
  assert.ok(VAULT_RULES[kind].label.length > 0, `${kind} has a display label`);
  assert.equal(getVaultCapacity(kind, 1).capacity, VAULT_RULES[kind].baseSlots);
  assert.equal(getVaultCapacity(kind, 1).level, 1);
  assert.ok(getVaultUpgradeCost(kind, 2).metal >= getVaultUpgradeCost(kind, 1).metal);
}

assert.deepEqual(
  kinds.map((kind) => VAULT_RULES[kind].label),
  ['Protected Vault', 'Inventory Vault', 'Equipment Vault'],
);

const inventoryCapacity = getVaultCapacity('inventory', 1);
assert.equal(inventoryCapacity.capacity, 60);
assert.equal(getVaultCapacity('inventory', 2).capacity, 80);
assert.equal(getVaultCapacity('protected', 0).level, 1, 'levels clamp to minimum');
assert.equal(getVaultCapacity('equipment', 999).level, 30, 'levels clamp to maximum');

const lockedUpgrade = previewVaultUpgrade('inventory', 1, 1);
assert.equal(lockedUpgrade.canUpgrade, false);
assert.match(lockedUpgrade.reason, /Requires Storage Silo facility level 1/);

const availableUpgrade = previewVaultUpgrade('inventory', 1, 2);
assert.equal(availableUpgrade.canUpgrade, true);
assert.equal(availableUpgrade.nextLevel, 2);
assert.equal(availableUpgrade.addedSlots, 20);

const maxUpgrade = previewVaultUpgrade('inventory', 30, 6);
assert.equal(maxUpgrade.canUpgrade, false);
assert.equal(maxUpgrade.nextLevel, 30);
assert.equal(maxUpgrade.addedSlots, 0);

assert.equal(getStashTabProgress(1).totalSlots, 125);
assert.equal(getStashTabProgress(10).nextTabCost, null);
assert.equal(getStashTabProgress(0).unlockedTabs, 1);

assert.equal(
  canStackStashItems({ itemId: 'ore', quantity: 10 }, { itemId: 'ore', quantity: 5 }).allowed,
  true,
);
assert.equal(
  canStackStashItems({ itemId: 'ore', quantity: 95 }, { itemId: 'ore', quantity: 5 }).allowed,
  false,
);
assert.equal(
  canStackStashItems({ itemId: 'ore', quantity: 1 }, { itemId: 'crystal', quantity: 1 }).allowed,
  false,
);

const equipmentItem = { itemId: 'sword-1', quantity: 1, stackable: false, weight: 12, category: 'equipment' };
assert.equal(canMoveToVault('equipment', equipmentItem).allowed, true);
assert.equal(canMoveToVault('inventory', { ...equipmentItem, equipped: true }).allowed, false);
assert.equal(canMoveToVault('equipment', { ...equipmentItem, locked: true }).allowed, false);
assert.equal(canMoveToVault('protected', { ...equipmentItem, category: 'quest-bound' }).allowed, false);

assert.deepEqual(validateVaultItems('inventory', [
  { itemId: 'ore-1', quantity: 2, stackable: true, weight: 3, category: 'resource' },
], inventoryCapacity), []);

assert.ok(validateVaultItems('inventory', [
  { itemId: 'ore-1', quantity: 0, stackable: true, weight: 3, category: 'resource' },
], inventoryCapacity).some((message) => message.includes('Invalid quantity')));

assert.ok(validateVaultItems('equipment', [
  { itemId: 'potion-1', quantity: 1, stackable: true, weight: 1, category: 'consumable' },
], getVaultCapacity('equipment', 1)).some((message) => message.includes('Non-equipment item')));

console.log('Vault progression smoke checks passed: labels, capacities, costs, upgrade gates, tab limits, stacking, transfer restrictions, and item validation.');
