import React, { useMemo, useState } from 'react';
import {
  getVaultCapacity,
  getVaultUpgradeCost,
  previewVaultUpgrade,
  VAULT_RULES,
  type VaultKind,
} from '../../game/vault-progression';

const VAULTS: VaultKind[] = ['protected', 'inventory', 'equipment'];

const RESOURCE_LABELS: Record<keyof ReturnType<typeof getVaultUpgradeCost>, string> = {
  metal: 'Metal',
  crystal: 'Crystal',
  deuterium: 'Deuterium',
  naquadah: 'Naquadah',
};

export const StashVaultsView: React.FC = () => {
  const [activeVault, setActiveVault] = useState<VaultKind>('inventory');
  const [levels, setLevels] = useState<Record<VaultKind, number>>({
    protected: 1,
    inventory: 1,
    equipment: 1,
  });
  const [facilityLevel, setFacilityLevel] = useState(1);

  const capacity = useMemo(
    () => getVaultCapacity(activeVault, levels[activeVault]),
    [activeVault, levels]
  );
  const preview = useMemo(
    () => previewVaultUpgrade(activeVault, levels[activeVault], facilityLevel),
    [activeVault, levels, facilityLevel]
  );
  const rule = VAULT_RULES[activeVault];

  const applyPreviewUpgrade = () => {
    if (!preview.canUpgrade) return;
    setLevels((current) => ({ ...current, [activeVault]: preview.nextLevel }));
  };

  return (
    <section className="space-y-5 text-neutral-900">
      <header className="border-b-2 border-neutral-900 pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">Empire Storage</p>
        <h1 className="mt-1 text-2xl font-bold">Protected, Inventory &amp; Equipment Stash</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Review vault capacity and provisional upgrade costs. This screen currently keeps demo levels in component state;
          it does not move real items, deduct resources, or persist upgrades to the server.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Vault type">
        {VAULTS.map((kind) => {
          const selected = activeVault === kind;
          const vaultCapacity = getVaultCapacity(kind, levels[kind]);
          return (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveVault(kind)}
              className={`border-2 p-3 text-left transition-colors ${selected ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white hover:border-neutral-600'}`}
            >
              <span className="block text-sm font-bold">{VAULT_RULES[kind].label}</span>
              <span className={`mt-1 block font-mono text-xs ${selected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                Level {levels[kind]} · {vaultCapacity.capacity} slots
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="border border-neutral-300 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider">Current capacity</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-neutral-100 p-3">
              <p className="text-xs text-neutral-500">Slots available</p>
              <p className="mt-1 text-2xl font-bold">{capacity.capacity}</p>
            </div>
            <div className="bg-neutral-100 p-3">
              <p className="text-xs text-neutral-500">Weight limit</p>
              <p className="mt-1 text-2xl font-bold">{capacity.weightCapacity.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-100 p-3">
              <p className="text-xs text-neutral-500">Current level</p>
              <p className="mt-1 text-xl font-bold">{capacity.level} / {capacity.maxLevel}</p>
            </div>
            <div className="bg-neutral-100 p-3">
              <p className="text-xs text-neutral-500">Slots per level</p>
              <p className="mt-1 text-xl font-bold">+{capacity.slotsPerLevel}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">{rule.facility} is the supporting facility for this vault.</p>
        </article>

        <article className="border border-neutral-300 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider">Upgrade preview</h2>
            <label className="flex items-center gap-2 text-xs text-neutral-600">
              Facility level
              <input
                aria-label="Supporting facility level"
                type="number"
                min={1}
                max={6}
                value={facilityLevel}
                onChange={(event) => setFacilityLevel(Math.max(1, Math.min(6, Number(event.target.value) || 1)))}
                className="w-16 border border-neutral-300 px-2 py-1 text-neutral-900"
              />
            </label>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-neutral-500">Next level</p>
              <p className="text-2xl font-bold">{preview.nextLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">New capacity</p>
              <p className="text-2xl font-bold">{preview.nextCapacity}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {(Object.keys(RESOURCE_LABELS) as Array<keyof typeof RESOURCE_LABELS>).map((resource) => (
              <div key={resource} className="flex justify-between gap-2 border-b border-neutral-100 py-1 text-sm">
                <dt className="text-neutral-600">{RESOURCE_LABELS[resource]}</dt>
                <dd className="font-mono font-semibold">{preview.cost[resource].toLocaleString()}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-3 text-xs ${preview.canUpgrade ? 'text-emerald-700' : 'text-amber-700'}`}>{preview.reason}</p>
          <button
            type="button"
            disabled={!preview.canUpgrade}
            onClick={applyPreviewUpgrade}
            className="mt-3 w-full border-2 border-neutral-900 bg-neutral-900 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500"
          >
            Apply demo level change
          </button>
        </article>
      </div>

      <aside className="border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        <strong>Development preview only.</strong> Resource costs are displayed but not deducted. Production use requires
        authenticated server-side ownership checks, atomic resource deduction, item-transfer transactions, and persistent storage.
      </aside>
    </section>
  );
};

export default StashVaultsView;
