import React, { useMemo, useState } from 'react';
import { Hammer, Shield, Sparkles, Lock, Unlock, AlertTriangle, CheckCircle2, Clock, Recycle } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';
import {
  attemptUpgrade,
  createCraftingUpgradeState,
  applyUpgradeBonuses,
  type CraftingTrack,
  type CraftingUpgradeState,
  type UpgradeResult,
  type TemperingLevel,
  type MasterworkRank,
  type MaterialCost,
} from '../../../src/rpg/tempering';
import { STARTER_ITEMS } from '../../../src/rpg/catalog';
import { computeRemains, breakDownItem, REFORGE_RECIPES } from '../../../src/rpg/remains';
import type { ItemDefinition } from '../../../src/rpg/types';

interface TemperingForgeViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
}

interface ForgeSlot {
  item: ItemDefinition;
  state: CraftingUpgradeState;
}

const MAX_LEVEL = 100; // tempering 1-100 and masterwork 1-100
const CURRENCY_COST = 800; // crystal per forge cycle

/** Procedural tier tables: tempering 1-100 and masterwork 1-100.
 *  Low tiers are cheap and safe; success chance, cost and downgrade depth scale with tier. */
const TEMPER_TIERS: TemperingLevel[] = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1;
  const t = i / (MAX_LEVEL - 1); // 0..1
  const successChance = Math.max(0.08, +(1 - 0.86 * Math.pow(t, 1.4)).toFixed(4));
  const currencyCost = Math.round(500 * Math.pow(1.085, i));
  const materials: MaterialCost[] = [
    { itemId: 'tempering-stone', quantity: 2 + Math.floor(i * 0.35) },
    ...(i >= 2 ? [{ itemId: 'refined-ore', quantity: 1 + Math.floor(i / 6) }] : []),
    ...(i >= 6 ? [{ itemId: 'star-metal', quantity: 1 + Math.floor(i / 12) }] : []),
    ...(i >= 20 ? [{ itemId: 'astral-core', quantity: 1 + Math.floor(i / 25) }] : []),
    ...(i >= 50 ? [{ itemId: 'primordial-ingot', quantity: 1 + Math.floor(i / 50) }] : []),
  ];
  const protectionMaterialId = i >= 3 ? (i >= 40 ? 'masterwork-seal' : i >= 15 ? 'greater-warding-rune' : 'warding-rune') : undefined;
  return {
    level,
    currencyCost,
    materials,
    successChance,
    statMultiplier: +(1 + 0.03 * level + 0.0007 * level * level).toFixed(4),
    failurePolicy: level >= 4 ? (level >= 60 ? 'downgrade' as const : 'downgrade' as const) : 'retain' as const,
    downgradeLevels: level >= 70 ? 3 : level >= 40 ? 2 : 1,
    protectionMaterialId,
    protectionMaterialQuantity: level >= 40 ? 2 : 1,
  };
});

const MASTERWORK_RANKS: MasterworkRank[] = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const rank = i + 1;
  const t = i / (MAX_LEVEL - 1);
  const successChance = Math.max(0.05, +(0.9 - 0.8 * Math.pow(t, 1.5)).toFixed(4));
  const currencyCost = Math.round(10000 * Math.pow(1.09, i));
  const materials: MaterialCost[] = [
    { itemId: 'masterwork-core', quantity: 1 + Math.floor(i * 0.5) },
    { itemId: 'star-metal', quantity: 3 + Math.floor(i / 4) },
    ...(i >= 4 ? [{ itemId: 'astral-core', quantity: 1 + Math.floor(i / 10) }] : []),
    ...(i >= 15 ? [{ itemId: 'primordial-ingot', quantity: 1 + Math.floor(i / 15) }] : []),
    ...(i >= 40 ? [{ itemId: 'void-crystal', quantity: 1 + Math.floor(i / 30) }] : []),
    ...(i >= 80 ? [{ itemId: 'world-boss-heart', quantity: 1 }] : []),
  ];
  return {
    rank,
    unlockLevel: Math.min(10, rank), // gated by temper level in the anvil
    currencyCost,
    materials,
    successChance,
    statMultiplier: +(1.05 + 0.008 * rank).toFixed(4),
    bonusStat: rank % 2 === 1 ? 'physicalPower' : 'critChance',
    bonusStatAmount: rank % 2 === 1 ? 10 * rank : +(0.001 * rank).toFixed(4),
    failurePolicy: rank >= 2 ? ('downgrade' as const) : ('retain' as const),
    downgradeRanks: rank >= 60 ? 3 : rank >= 25 ? 2 : 1,
    protectionMaterialId: rank >= 2 ? 'masterwork-seal' : undefined,
    protectionMaterialQuantity: rank >= 25 ? 2 : 1,
  };
});

const FORGE_ITEMS: ItemDefinition[] = STARTER_ITEMS;

const richWallet = (useProtection: boolean) => ({
  currency: 1_000_000_000,
  materials: {
    'tempering-stone': 99999,
    'refined-ore': 99999,
    'star-metal': 99999,
    'astral-core': 99999,
    'primordial-ingot': 99999,
    'void-crystal': 99999,
    'masterwork-core': 99999,
    'world-boss-heart': 99999,
    'warding-rune': useProtection ? 99999 : 0,
    'greater-warding-rune': useProtection ? 99999 : 0,
    'masterwork-seal': useProtection ? 99999 : 0,
  },
});

export const TemperingForgeView: React.FC<TemperingForgeViewProps> = ({ resources, onUpdateResources }) => {
  const [slots, setSlots] = useState<ForgeSlot[]>(() =>
    FORGE_ITEMS.map((item) => {
      const base = createCraftingUpgradeState(item);
      // Extend the anvil: tempering 1-100, masterwork 1-100
      return { item, state: { ...base, maxTemperLevel: MAX_LEVEL, maxMasterworkRank: MAX_LEVEL } };
    })
  );
  const [selectedId, setSelectedId] = useState<string>(FORGE_ITEMS[0]?.id ?? '');
  const [track, setTrack] = useState<CraftingTrack>('tempering');
  const [useProtection, setUseProtection] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [salvagePreview, setSalvagePreview] = useState<ReturnType<typeof computeRemains> | null>(null);

  const selected = slots.find((s) => s.item.id === selectedId) ?? slots[0];

  const nextLevel = useMemo(() => {
    if (!selected) return null;
    return track === 'tempering' ? selected.state.temperLevel + 1 : selected.state.masterworkRank + 1;
  }, [selected, track]);

  const rule = useMemo<TemperingLevel | MasterworkRank | null>(() => {
    if (!selected || nextLevel === null) return null;
    return track === 'tempering'
      ? TEMPER_TIERS.find((l) => l.level === nextLevel) ?? null
      : MASTERWORK_RANKS.find((r) => r.rank === nextLevel) ?? null;
  }, [selected, track, nextLevel]);

  const projected = useMemo(() => {
    if (!selected || nextLevel === null) return null;
    const nextState = { ...selected.state, ...(track === 'tempering' ? { temperLevel: nextLevel } : { masterworkRank: nextLevel }) };
    return applyUpgradeBonuses(selected.item, nextState);
  }, [selected, track, nextLevel]);

  const handleForge = () => {
    if (!selected || !rule) return;
    if (resources.crystal < CURRENCY_COST) {
      sound.play('warning');
      setResult({ ok: false, message: `Requires ${CURRENCY_COST.toLocaleString()} Crystal to run the forge cycle.` });
      return;
    }
    const roll = Math.random();
    let outcome: UpgradeResult;
    try {
      outcome = attemptUpgrade({
        item: selected.item,
        state: selected.state,
        wallet: richWallet(useProtection),
        playerId: 'commander',
        track,
        rules: rule,
        roll,
        useProtection,
        timestamp: Date.now(),
      });
    } catch (error) {
      sound.play('warning');
      setResult({ ok: false, message: error instanceof Error ? error.message : 'Forge cycle failed.' });
      return;
    }

    onUpdateResources({ crystal: resources.crystal - CURRENCY_COST });
    setSlots((prev) => prev.map((s) => (s.item.id === selected.item.id ? { ...s, state: outcome.state } : s)));
    if (outcome.success) {
      sound.play('confirm');
      setResult({ ok: true, message: `${(track === 'masterworking' ? 'Masterwork' : 'Tempering')} succeeded: level ${outcome.state[track === 'tempering' ? 'temperLevel' : 'masterworkRank']} — ${outcome.message}` });
    } else {
      sound.play('warning');
      setResult({ ok: false, message: outcome.message });
    }
  };

  if (!selected) return <div className="p-6 text-slate-400">No forgeable items available.</div>;

  const currentLevel = track === 'tempering' ? selected.state.temperLevel : selected.state.masterworkRank;
  const maxLevel = track === 'tempering' ? selected.state.maxTemperLevel : selected.state.maxMasterworkRank;
  const statMultiplier = rule?.statMultiplier ?? 1;
  const successChance = rule ? Math.round(rule.successChance * 100) : 0;
  const forgeLevel = selected.state.temperLevel + selected.state.masterworkRank;

  const handleSalvage = () => {
    if (forgeLevel === 0) {
      sound.play('warning');
      setResult({ ok: false, message: 'Item has no forge levels to salvage.' });
      return;
    }
    const outcome = breakDownItem(selected.item, selected.state);
    setSlots((prev) => prev.map((s) => (s.item.id === selected.item.id ? { ...s, state: outcome.state } : s)));
    setSalvagePreview(outcome.breakdown);
    sound.play('confirm');
    setResult({ ok: true, message: `${selected.item.name} broken down — ${outcome.breakdown.materials.length} material types and ${outcome.breakdown.remains.length} remains recovered (${outcome.breakdown.levelsConsumed} forge levels consumed).` });
  };

  return (
    <div className="space-y-6">
      <div id="tempering-forge-view" className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          RELIC FORGE ANVIL · TEMPERING 1–{MAX_LEVEL} & MASTERWORKING 1–{MAX_LEVEL}
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Forge & Masterworks Anvil</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-3xl leading-relaxed">
          Upgrade relic gear through {MAX_LEVEL} temper tiers, then forge {MAX_LEVEL} masterwork ranks. Failures can downgrade — protection runes hold the line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {slots.map(({ item, state }) => {
            const isSelected = item.id === selected.item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setSelectedId(item.id); setResult(null); }}
                className={`w-full text-left border p-4 transition-colors cursor-pointer ${isSelected ? 'border-[#111111] bg-amber-50' : 'border-[#dedede] bg-white hover:border-[#111111]'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#111111]">{item.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border bg-[#fafafa] border-[#dedede] uppercase text-[#666666]">{item.rarity}</span>
                </div>
                <div className="mt-2 flex gap-4 text-[11px] font-mono text-[#666666]">
                  <span>Temper <span className="text-[#111111] font-bold">{state.temperLevel}/{state.maxTemperLevel}</span></span>
                  <span>Masterwork <span className="text-[#111111] font-bold">{state.masterworkRank}/{state.maxMasterworkRank}</span></span>
                  {state.damaged && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Damaged</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="border border-[#dedede] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111111]">{selected.item.name}</h3>
              <div className="flex gap-2">
                {(['tempering', 'masterworking'] as CraftingTrack[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTrack(t); setResult(null); }}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${track === t ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#fafafa] text-[#111111] border-[#dedede] hover:border-[#111111]'}`}
                  >
                    {t === 'masterworking' ? 'Masterwork' : 'Temper'}
                  </button>
                ))}
              </div>
            </div>

            {rule ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-[#fafafa] p-3 border border-[#dedede]">
                  <div className="text-[10px] text-[#777777] uppercase font-bold">Next Level</div>
                  <div className="text-lg font-mono font-bold text-[#111111]">{currentLevel} → {nextLevel}</div>
                  <div className="text-[10px] text-[#777777]">Cap {maxLevel}</div>
                </div>
                <div className="bg-[#fafafa] p-3 border border-[#dedede]">
                  <div className="text-[10px] text-[#777777] uppercase font-bold">Success</div>
                  <div className={`text-lg font-mono font-bold ${successChance >= 70 ? 'text-emerald-700' : successChance >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{successChance}%</div>
                </div>
                <div className="bg-[#fafafa] p-3 border border-[#dedede]">
                  <div className="text-[10px] text-[#777777] uppercase font-bold">Stat Multiplier</div>
                  <div className="text-lg font-mono font-bold text-blue-700">×{statMultiplier.toFixed(2)}</div>
                </div>
                <div className="bg-[#fafafa] p-3 border border-[#dedede]">
                  <div className="text-[10px] text-[#777777] uppercase font-bold">Forge Cost</div>
                  <div className="text-lg font-mono font-bold text-[#111111]">{CURRENCY_COST.toLocaleString()} <span className="text-xs font-sans">Crystal</span></div>
                  <div className="text-[10px] text-[#777777]">Materials: {rule.materials.length} types</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#666666] mb-4 text-sm">
                <Lock className="w-4 h-4" /> Maximum {(track === 'masterworking' ? 'Masterwork' : 'Tempering')} level reached for this item.
              </div>
            )}

            {rule && (
              <div className="mb-4">
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mb-2">Required Materials</div>
                <div className="flex flex-wrap gap-2">
                  {rule.materials.map((m) => (
                    <span key={m.itemId} className="px-2 py-1 bg-[#fafafa] border border-[#dedede] text-[11px] font-mono text-[#111111]">
                      {m.itemId} ×{m.quantity}
                    </span>
                  ))}
                  {rule.protectionMaterialId && (
                    <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-[11px] font-mono text-blue-800 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {rule.protectionMaterialId} ×{rule.protectionMaterialQuantity ?? 1}
                    </span>
                  )}
                </div>
              </div>
            )}

            {rule && (rule as TemperingLevel).failurePolicy === 'downgrade' && (
              <div className="mb-4 flex items-start gap-2 border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Failure will downgrade this item by {(rule as { downgradeLevels?: number }).downgradeLevels ?? (rule as { downgradeRanks?: number }).downgradeRanks ?? 1} level(s). Enable a protection rune to keep the current level on failure.</span>
              </div>
            )}

            {projected && (
              <div className="mb-4 bg-[#fafafa] border border-[#dedede] p-3">
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Projected Profile</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono text-[#111111]">
                  {projected.pve.baseDamage !== undefined && <span>PvE Damage: <span className="font-bold">{Math.round(projected.pve.baseDamage)}</span></span>}
                  {projected.pve.armor !== undefined && <span>PvE Armor: <span className="font-bold">{Math.round(projected.pve.armor)}</span></span>}
                  {projected.pvp.baseDamage !== undefined && <span>PvP Damage: <span className="font-bold">{Math.round(projected.pvp.baseDamage)}</span></span>}
                  {projected.pvp.armor !== undefined && <span>PvP Armor: <span className="font-bold">{Math.round(projected.pvp.armor)}</span></span>}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleForge}
                disabled={!rule || selected.state.damaged}
                className="px-5 py-2.5 bg-[#111111] hover:bg-[#333333] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Hammer className="w-4 h-4" /> {selected.state.damaged ? 'Repair Required' : 'Forge'}
              </button>
              <button
                onClick={() => setUseProtection((v) => !v)}
                className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border flex items-center gap-2 transition-colors cursor-pointer ${useProtection ? 'bg-blue-700 text-white border-blue-700' : 'bg-[#fafafa] text-[#111111] border-[#dedede] hover:border-[#111111]'}`}
              >
                {useProtection ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                Protection Rune {useProtection ? 'Armed' : 'Off'}
              </button>
              {selected.state.damaged && (
                <button
                  onClick={() => {
                    setSlots((prev) => prev.map((s) => (s.item.id === selected.item.id ? { ...s, state: { ...s.state, damaged: false } } : s)));
                    sound.play('confirm');
                    setResult({ ok: true, message: 'Item restored at the anvil. Forge cycles resumed.' });
                  }}
                  className="px-4 py-2.5 bg-[#fafafa] border border-[#dedede] hover:border-[#111111] text-[#111111] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Repair Item
                </button>
              )}
            </div>

            {result && (
              <div className={`mt-4 flex items-start gap-2 p-3 text-sm font-semibold border-l-4 ${result.ok ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'bg-red-50 border-red-600 text-red-700'}`}>
                {result.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
                {result.message}
              </div>
            )}
          </div>

          <div className="border border-[#dedede] bg-white p-5">
            <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mb-3 flex items-center gap-1"><Recycle className="w-3 h-3" /> Remains System — Salvage & Reforge</div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={() => setSalvagePreview(computeRemains(selected.item, selected.state))}
                className="px-4 py-2 bg-[#fafafa] border border-[#dedede] hover:border-[#111111] text-[#111111] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Preview Salvage
              </button>
              <button
                onClick={handleSalvage}
                disabled={forgeLevel === 0}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Break Down Item ({forgeLevel} levels)
              </button>
            </div>
            {salvagePreview && salvagePreview.itemId === selected.item.id && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-bold mb-1.5">Refunded Materials</div>
                  {salvagePreview.materials.length === 0 ? <div className="text-xs text-[#999999]">None — item has no forge history.</div> : (
                    <div className="flex flex-wrap gap-1.5">
                      {salvagePreview.materials.map((m) => (
                        <span key={m.itemId} className="px-2 py-0.5 bg-[#fafafa] border border-[#dedede] text-[11px] font-mono text-[#111111]">{m.itemId} ×{m.quantity}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-bold mb-1.5">Salvage Remains</div>
                  {salvagePreview.remains.length === 0 ? <div className="text-xs text-[#999999]">Forge the item first — remains scale with forge level.</div> : (
                    <div className="flex flex-wrap gap-1.5">
                      {salvagePreview.remains.map((m) => (
                        <span key={m.itemId} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-800">{m.itemId} ×{m.quantity}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-[#eeeeee]">
              <div className="text-[10px] text-[#777777] uppercase font-bold mb-1.5">Reforge Recipes</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {REFORGE_RECIPES.map((r) => (
                  <div key={r.inputItemId} className="text-[11px] font-mono text-[#666666]">
                    {r.inputQuantity}× {r.inputItemId} → {r.outputs.map((o) => `${o.quantity}× ${o.itemId}`).join(' + ')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-[#dedede] bg-white p-5">
            <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mb-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Forge History — {selected.item.name}</div>
            {selected.state.history.length === 0 ? (
              <div className="text-sm text-[#666666]">No forge cycles recorded yet.</div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {[...selected.state.history].reverse().map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-[11px] font-mono border-b border-[#eeeeee] pb-1.5">
                    <span className={h.success ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{h.success ? '✔' : '✘'} {h.track} {h.fromLevel} → {h.toLevel}</span>
                    <span className="text-[#777777] truncate max-w-[50%]">{h.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
