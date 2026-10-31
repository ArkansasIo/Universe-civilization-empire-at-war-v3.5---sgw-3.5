import React, { useMemo, useState } from 'react';
import { ContentArt } from '../ContentArt';
import { contentSlug } from '../../utils/contentImages';
import { FlaskConical, Search, Layers, Filter } from 'lucide-react';
import { sound } from '../../sound';
import { TECH_ARCHIVE, TECH_CLASSES, STAT_LABELS, type TechModule, type TechClass, type StatKey } from '../../data/techArchive';

export const TechArchiveView: React.FC = () => {
  const [classFilter, setClassFilter] = useState<TechClass | 'all'>('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(18);
  const [selected, setSelected] = useState<TechModule | null>(TECH_ARCHIVE[0]);

  const filtered = useMemo(() => TECH_ARCHIVE.filter((m) => {
    if (classFilter !== 'all' && m.techClass !== classFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return m.name.toLowerCase().includes(q) || m.subClass.toLowerCase().includes(q);
    }
    return true;
  }), [classFilter, search]);

  const statEntries = (m: TechModule, keys: StatKey[]) => {
    const merged = { ...m.stats, ...m.subStats };
    return keys.filter((k) => merged[k] !== undefined).map((k) => ({ key: k, label: STAT_LABELS[k], value: merged[k]! }));
  };

  const select = (m: TechModule) => {
    sound.play('click');
    setSelected(m);
  };

  return (
    <div id="tech-archive-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          GALACTIC TECHNOLOGY ARCHIVE · 90 MODULES · CLASS → SUB-CLASS → TYPE → SUB-TYPE
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Galactic Technology Archive</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-3xl leading-relaxed">
          Ninety imperial tech modules across 9 classes and 10 sub-classes each, with primary stats and sub-stats. Research the archive, compare tiers, and requisition blueprints.
        </p>
      </div>

      <div className="border border-[#dedede] bg-white p-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider flex items-center gap-1 mr-1"><Filter className="w-3 h-3" /> Class</span>
        <select
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value as TechClass | 'all'); setVisibleCount(18); }}
          className="text-[11px] font-bold uppercase border border-[#dedede] bg-[#fafafa] px-2 py-1.5 cursor-pointer"
        >
          <option value="all">All Classes ({TECH_ARCHIVE.length})</option>
          {TECH_CLASSES.map((c) => (
            <option key={c} value={c}>{c} (10)</option>
          ))}
        </select>
        <div className="relative ml-2">
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2 top-2" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(18); }}
            placeholder="Search modules or sub-classes…"
            className="text-[11px] font-mono pl-7 pr-2 py-1.5 border border-[#dedede] bg-[#fafafa] focus:outline-none focus:border-[#111111] w-56"
          />
        </div>
        <span className="ml-auto font-mono text-[11px] text-[#777777]">Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {filtered.slice(0, visibleCount).map((m) => {
            const isSelected = selected?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => select(m)}
                className={`w-full text-left border p-4 transition-colors cursor-pointer ${isSelected ? 'border-[#111111] bg-amber-50' : 'border-[#dedede] bg-white hover:border-[#111111]'}`}
              >
                <ContentArt
                  collection="tech_classes"
                  id={contentSlug(m.techClass)}
                  alt={m.techClass}
                  className="w-full h-20 border border-[#dedede] mb-2"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#111111]"><FlaskConical className="w-3.5 h-3.5 inline mr-1 text-[#777777]" />{m.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 border uppercase ${m.rarity === 'Mythic' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                      m.rarity === 'Legendary' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        m.rarity === 'Epic' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          m.rarity === 'Rare' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-neutral-50 text-neutral-700 border-neutral-200'}`}>{m.rarity}</span>
                </div>
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">
                  {m.techClass} · {m.subClass} · {m.type} · {m.subType} · Tier {m.tier}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                  {statEntries(m, ['attack', 'defense', 'shield', 'accuracy', 'evasion']).map((s) => (
                    <span key={s.key} className="px-1.5 py-0.5 bg-[#fafafa] border border-[#dedede] text-[#111111]">{s.label} +{s.value}</span>
                  ))}
                  {statEntries(m, ['critChance', 'critDamage', 'attackSpeed', 'armorPenetration', 'damageReduction', 'dodgeChance', 'cooldownReduction', 'poise', 'tenacity', 'shieldPower', 'hpRegen', 'moveSpeed']).map((s) => (
                    <span key={s.key} className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800">{s.label} +{s.value}</span>
                  ))}
                  <span className="px-1.5 py-0.5 bg-red-50 border border-red-200 text-red-700">Energy {m.energyCost}</span>
                </div>
              </button>
            );
          })}
          {visibleCount < filtered.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + 18)}
              className="w-full py-3 bg-[#fafafa] border border-[#dedede] hover:border-[#111111] text-[#111111] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Load More Modules ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </div>

        <div className="lg:col-span-5">
          {selected && (
            <div className="border-2 border-[#111111] bg-white p-6 space-y-4 sticky top-4">
              <div>
                <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">MODULE DOSSIER</div>
                <h3 className="text-lg font-black text-[#111111]">{selected.name}</h3>
                <div className="text-[11px] text-[#666666] mt-0.5 font-mono">
                  Class {selected.classId} · Sub-Class {selected.subClassId} · Type {selected.typeId} · Sub-Type {selected.subTypeId}
                </div>
              </div>

              <div className="text-[11px] text-[#666666] leading-relaxed">{selected.description}</div>

              <div>
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mb-2 flex items-center gap-1"><Layers className="w-3 h-3" /> Primary Stats</div>
                <div className="grid grid-cols-2 gap-2">
                  {statEntries(selected, ['attack', 'defense', 'shield', 'accuracy', 'evasion']).map((s) => (
                    <div key={s.key} className="bg-[#fafafa] p-2.5 border border-[#dedede]">
                      <span className="text-[10px] text-[#777777] block font-bold uppercase">{s.label}</span>
                      <strong className="font-mono text-emerald-700 text-sm">+{s.value}</strong>
                    </div>
                  ))}
                  <div className="bg-[#fafafa] p-2.5 border border-[#dedede]">
                    <span className="text-[10px] text-[#777777] block font-bold uppercase">Energy Cost</span>
                    <strong className="font-mono text-red-700 text-sm">{selected.energyCost}</strong>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mb-2">Sub-Stats</div>
                <div className="space-y-1.5">
                  {statEntries(selected, ['critChance', 'critDamage', 'attackSpeed', 'castSpeed', 'moveSpeed', 'armorPenetration', 'magicPenetration', 'damageReduction', 'blockChance', 'parryChance', 'dodgeChance', 'tenacity', 'poise', 'hpRegen', 'mpRegen', 'cooldownReduction', 'threatMultiplier', 'shieldPower']).map((s) => (
                    <div key={s.key} className="flex items-center justify-between text-[11px] border-b border-[#eeeeee] pb-1">
                      <span className="text-[#666666] font-bold uppercase text-[10px]">{s.label}</span>
                      <span className="font-mono text-blue-700 font-bold">+{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#eeeeee] font-mono text-[10px] text-[#777777]">
                Archive ID: {selected.id} · Tier {selected.tier}/10
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
