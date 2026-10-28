import React, { useMemo, useState } from 'react';
import { Cpu, Wrench, Shield, ArrowUpRight, CheckCircle2, Clock, Layers, Search } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';
import { INITIAL_EVE_BLUEPRINTS, EveBlueprint } from '../../blueprintSystemsData';
import { EVE_MODULE_MATRIX, MODULE_CLASSES, type ModuleClass } from '../../data/eveModuleMatrix';

interface EveBlueprintsViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
}

export const EveBlueprintsView: React.FC<EveBlueprintsViewProps> = ({
  resources,
  onUpdateResources,
}) => {
  const [blueprints, setBlueprints] = useState<EveBlueprint[]>([...INITIAL_EVE_BLUEPRINTS, ...EVE_MODULE_MATRIX]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<ModuleClass | 'all'>('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);

  // Index modules into class buckets by their position in the deterministic matrix.
  const classOf = (bp: EveBlueprint): ModuleClass | null => {
    const idx = EVE_MODULE_MATRIX.findIndex((m) => m.id === bp.id);
    if (idx < 0) return null; // authored starter BPOs
    return MODULE_CLASSES[Math.floor(idx / 30)]; // 30 per class
  };

  const filtered = useMemo(() => blueprints.filter((bp) => {
    const cls = classOf(bp);
    if (classFilter !== 'all' && cls !== classFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!bp.name.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [blueprints, classFilter, search]);

  const handleResearchME = (bpId: string) => {
    const bp = blueprints.find((b) => b.id === bpId);
    if (!bp) return;

    if (resources.crystal < 15000 || resources.deuterium < 5000) {
      sound.play('warning');
      setFeedback('Insufficient Crystal (15k) & Deuterium (5k) for Material Efficiency research.');
      return;
    }

    sound.play('confirm');
    onUpdateResources({
      crystal: resources.crystal - 15000,
      deuterium: resources.deuterium - 5000,
    });

    setBlueprints(
      blueprints.map((b) =>
        b.id === bpId ? { ...b, materialEfficiency: b.materialEfficiency + 1 } : b
      )
    );
    setFeedback(`Successfully researched Material Efficiency (ME) for ${bp.name}! Now ME +${bp.materialEfficiency + 1}`);
  };

  const handleResearchTE = (bpId: string) => {
    const bp = blueprints.find((b) => b.id === bpId);
    if (!bp) return;

    if (resources.crystal < 10000 || resources.deuterium < 8000) {
      sound.play('warning');
      setFeedback('Insufficient Crystal (10k) & Deuterium (8k) for Time Efficiency research.');
      return;
    }

    sound.play('confirm');
    onUpdateResources({
      crystal: resources.crystal - 10000,
      deuterium: resources.deuterium - 8000,
    });

    setBlueprints(
      blueprints.map((b) =>
        b.id === bpId ? { ...b, timeEfficiency: b.timeEfficiency + 2 } : b
      )
    );
    setFeedback(`Successfully researched Time Efficiency (TE) for ${bp.name}! Now TE +${bp.timeEfficiency + 2}%`);
  };

  const handleCopyBlueprint = (bpId: string) => {
    const bp = blueprints.find((b) => b.id === bpId);
    if (!bp || !bp.isOriginal) return;

    if (resources.metal < 5000 || resources.crystal < 5000) {
      sound.play('warning');
      setFeedback('Insufficient Metal & Crystal to copy blueprint (5,000 each).');
      return;
    }

    sound.play('confirm');
    onUpdateResources({
      metal: resources.metal - 5000,
      crystal: resources.crystal - 5000,
    });

    const newCopy: EveBlueprint = {
      ...bp,
      id: `bpc_${Date.now()}`,
      name: `${bp.name.replace(' (Original)', '')} BPC (Copy)`,
      isOriginal: false,
      runsRemaining: 10,
    };

    setBlueprints([...blueprints, newCopy]);
    setFeedback(`Successfully generated 10-run Blueprint Copy (BPC) for ${bp.name}!`);
  };

  return (
    <div id="eve-blueprints-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          EVE INDUSTRIAL BLUEPRINT MATRIX · ME / TE RESEARCH & MANUFACTURING
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">EVE Online Blueprint & Research Labs</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-3xl leading-relaxed">
          Manage Material Efficiency (ME) and Time Efficiency (TE) research, copy Originals (BPO) into manufacturing copies (BPC), and optimize production costs.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-[#fafafa] border border-[#111111] border-l-4 text-xs font-semibold flex justify-between items-center">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="border border-[#dedede] bg-white p-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider flex items-center gap-1 mr-1"><Layers className="w-3 h-3" /> Module Class</span>
        <select
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value as ModuleClass | 'all'); setVisibleCount(24); }}
          className="text-[11px] font-bold uppercase border border-[#dedede] bg-[#fafafa] px-2 py-1.5 cursor-pointer"
        >
          <option value="all">All Classes ({blueprints.length})</option>
          {MODULE_CLASSES.map((c) => (
            <option key={c} value={c}>{c} (30)</option>
          ))}
        </select>
        <div className="relative ml-2">
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2 top-2" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(24); }}
            placeholder="Search blueprints…"
            className="text-[11px] font-mono pl-7 pr-2 py-1.5 border border-[#dedede] bg-[#fafafa] focus:outline-none focus:border-[#111111] w-56"
          />
        </div>
        <span className="ml-auto font-mono text-[11px] text-[#777777]">Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}</span>
      </div>

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.slice(0, visibleCount).map((bp) => (
          <div key={bp.id} className="border border-[#dedede] bg-white p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 border uppercase ${bp.isOriginal ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                  {bp.isOriginal ? 'Original (BPO)' : 'Copy (BPC)'}
                </span>
                <span className="font-mono text-xs font-bold text-[#111111]">
                  Runs: {bp.runsRemaining}
                </span>
              </div>
              <h3 className="font-bold text-base text-[#111111]">{bp.name}</h3>
              {classOf(bp) && (
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mt-0.5">{classOf(bp)}</div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#fafafa] p-2.5 border border-[#dedede]">
                  <span className="text-[10px] text-[#777777] block font-bold uppercase">Material Efficiency</span>
                  <strong className="font-mono text-emerald-700 text-sm mt-0.5 block">ME +{bp.materialEfficiency}%</strong>
                </div>
                <div className="bg-[#fafafa] p-2.5 border border-[#dedede]">
                  <span className="text-[10px] text-[#777777] block font-bold uppercase">Time Efficiency</span>
                  <strong className="font-mono text-blue-700 text-sm mt-0.5 block">TE +{bp.timeEfficiency}%</strong>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#eeeeee]">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleResearchME(bp.id)}
                  className="py-2 bg-[#fafafa] border border-[#dedede] text-[#111111] text-[11px] font-bold uppercase hover:border-[#111111] transition-colors cursor-pointer"
                >
                  Res. ME (15k C)
                </button>
                <button
                  type="button"
                  onClick={() => handleResearchTE(bp.id)}
                  className="py-2 bg-[#fafafa] border border-[#dedede] text-[#111111] text-[11px] font-bold uppercase hover:border-[#111111] transition-colors cursor-pointer"
                >
                  Res. TE (10k C)
                </button>
                {bp.isOriginal ? (
                  <button
                    type="button"
                    onClick={() => handleCopyBlueprint(bp.id)}
                    className="py-2 bg-[#111111] text-white text-[11px] font-bold uppercase hover:bg-[#333333] transition-colors cursor-pointer"
                  >
                    Copy BPC
                  </button>
                ) : (
                  <div className="py-2 bg-neutral-100 text-neutral-400 text-[11px] font-bold uppercase text-center flex items-center justify-center">
                    Copy
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((v) => v + 24)}
          className="w-full py-3 bg-[#fafafa] border border-[#dedede] hover:border-[#111111] text-[#111111] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Load More Blueprints ({filtered.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
};
