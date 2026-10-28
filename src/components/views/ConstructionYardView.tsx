import React, { useMemo, useState, useEffect } from 'react';
import { Building2, Hammer, Clock, Layers, Zap, Filter, Factory } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';
import { YARD_BLUEPRINTS, BLUEPRINT_CATEGORIES, type YardBlueprint, type BlueprintCategory } from '../../data/yardBlueprints';

interface ConstructionYardViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
}

type ProjectKind = 'ship' | 'module' | 'ammunition' | 'drone' | 'facility';

interface YardProject {
  id: string;
  kind: ProjectKind;
  name: string;
  remainingSeconds: number;
  totalSeconds: number;
  cost: { metal: number; crystal: number; deuterium: number };
}

interface FacilityPlan {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseCost: { metal: number; crystal: number; deuterium: number };
  baseSeconds: number;
  benefit: string;
}

const FACILITY_PLANS: FacilityPlan[] = [
  { id: 'orbital-drydock', name: 'Orbital Drydock Expansion', icon: '🏗️', description: 'Adds a parallel construction slip, reducing shipyard queue pressure.', baseCost: { metal: 60000, crystal: 24000, deuterium: 12000 }, baseSeconds: 300, benefit: '+1 shipyard queue slot' },
  { id: 'foundry-forge', name: 'Masterworks Foundry', icon: '⚒️', description: 'Industrial-scale forge feeding the Tempering Anvil with refined alloys.', baseCost: { metal: 45000, crystal: 40000, deuterium: 18000 }, baseSeconds: 240, benefit: '+5% temper success chance (flavor)' },
  { id: 'blueprint-vault', name: 'Blueprint Cryptographic Vault', icon: '🗄️', description: 'Secure archive accelerating ME/TE research on stored BPOs.', baseCost: { metal: 30000, crystal: 55000, deuterium: 22000 }, baseSeconds: 200, benefit: '-10% blueprint research time' },
  { id: 'mass-driver', name: 'Orbital Mass Driver', icon: '🚀', description: 'Electromagnetic launch loop cutting hull delivery delays.', baseCost: { metal: 80000, crystal: 20000, deuterium: 30000 }, baseSeconds: 360, benefit: '-8% ship build time' },
  { id: 'refinery', name: 'Deep-Core Refinery', icon: '⚙️', description: 'Cracks asteroid ore into refined construction alloys.', baseCost: { metal: 50000, crystal: 30000, deuterium: 15000 }, baseSeconds: 260, benefit: '+10% metal refining yield' },
  { id: 'assembly-nexus', name: 'Nanite Assembly Nexus', icon: '🧬', description: 'Replicator-style swarms assembling hull sections around the clock.', baseCost: { metal: 70000, crystal: 65000, deuterium: 40000 }, baseSeconds: 420, benefit: '-12% module build time' },
];

const KIND_LABEL: Record<ProjectKind, string> = {
  ship: 'Hull',
  module: 'Module',
  ammunition: 'Munitions',
  drone: 'Drone Wing',
  facility: 'Facility',
};

// ============================================================================
// FABRICATOR SYSTEM — raw resources refined into construction components.
// Components are an empire-wide ledger keyed by component id.
// ============================================================================
export type FabricatorTier = 'standard' | 'advanced' | 'exotic' | 'relic';

export interface FabricatorComponent {
  id: string;
  name: string;
  tier: FabricatorTier;
  category: 'hull-plating' | 'drive-system' | 'weapon-frame' | 'shield-lattice' | 'control-circuit';
  description: string;
  input: { metal: number; crystal: number; deuterium: number };
  seconds: number;
}

export const FABRICATOR_COMPONENTS: FabricatorComponent[] = [
  // Standard tier — cheap, feeds everyday hulls
  { id: 'fab-ferro-plate', name: 'Ferro-Ceramic Plate', tier: 'standard', category: 'hull-plating', description: 'Baseline stamped armor sheet for interceptor and corvette hulls.', input: { metal: 2500, crystal: 500, deuterium: 0 }, seconds: 10 },
  { id: 'fab-ion-thruster', name: 'Ion Thruster Nozzle', tier: 'standard', category: 'drive-system', description: 'Mass-produced sublight drive for escorts and haulers.', input: { metal: 3000, crystal: 800, deuterium: 400 }, seconds: 12 },
  { id: 'fab-pulse-mount', name: 'Pulse Weapon Mount', tier: 'standard', category: 'weapon-frame', description: 'Universal hardening bracket for light pulse weaponry.', input: { metal: 2800, crystal: 1200, deuterium: 200 }, seconds: 11 },
  { id: 'fab-deflector-mesh', name: 'Deflector Mesh', tier: 'standard', category: 'shield-lattice', description: 'Passive grid of shield relay nodes for small craft.', input: { metal: 1500, crystal: 2200, deuterium: 300 }, seconds: 10 },
  { id: 'fab-logic-board', name: 'Fire-Control Logic Board', tier: 'standard', category: 'control-circuit', description: 'Standard targeting and fire-control circuit stack.', input: { metal: 900, crystal: 2600, deuterium: 250 }, seconds: 9 },
  // Advanced tier — capital-grade
  { id: 'fab-trinium-frame', name: 'Trinium Composite Frame', tier: 'advanced', category: 'hull-plating', description: 'Naquadah-enriched trinium superstructure for capital hulls.', input: { metal: 18000, crystal: 6000, deuterium: 2500 }, seconds: 40 },
  { id: 'fab-hyper-coil', name: 'Hyperspace Field Coil', tier: 'advanced', category: 'drive-system', description: 'Warp-capable coil assembly rated for cruiser-class drives.', input: { metal: 14000, crystal: 12000, deuterium: 9000 }, seconds: 45 },
  { id: 'fab-plasma-lattice', name: 'Plasma Cannon Lattice', tier: 'advanced', category: 'weapon-frame', description: 'Containment lattice for heavy plasma and beam arrays.', input: { metal: 16000, crystal: 14000, deuterium: 6000 }, seconds: 42 },
  { id: 'fab-shield-matrix', name: 'Nested Shield Matrix', tier: 'advanced', category: 'shield-lattice', description: 'Layered buffer matrix for battleship-grade deflector grids.', input: { metal: 12000, crystal: 20000, deuterium: 7000 }, seconds: 48 },
  { id: 'fab-quantum-core', name: 'Quantum Command Core', tier: 'advanced', category: 'control-circuit', description: 'Fleet-networked quantum processor for fire coordination.', input: { metal: 8000, crystal: 22000, deuterium: 5000 }, seconds: 38 },
  // Exotic tier — precursor-derived
  { id: 'fab-crystal-shell', name: 'Crystalline Reactive Shell', tier: 'exotic', category: 'hull-plating', description: 'Self-healing crystal plating grown in zero-G vats.', input: { metal: 60000, crystal: 90000, deuterium: 20000 }, seconds: 110 },
  { id: 'fab-singularity-drive', name: 'Singularity Drive Core', tier: 'exotic', category: 'drive-system', description: 'Micro-singularity containment drive for super-capitals.', input: { metal: 50000, crystal: 80000, deuterium: 60000 }, seconds: 130 },
  { id: 'fab-annihilator-array', name: 'Annihilator Beam Array', tier: 'exotic', category: 'weapon-frame', description: 'Precursor-pattern beam array with void-piercing emitters.', input: { metal: 70000, crystal: 65000, deuterium: 45000 }, seconds: 120 },
  { id: 'fab-void-barrier', name: 'Void Barrier Lattice', tier: 'exotic', category: 'shield-lattice', description: 'Dark-matter barrier lattice resisting singularity events.', input: { metal: 45000, crystal: 100000, deuterium: 55000 }, seconds: 125 },
  { id: 'fab-neural-cortex', name: 'Neural Cortex Nexus', tier: 'exotic', category: 'control-circuit', description: 'Sentient-grade cortex for autonomous fleet command.', input: { metal: 40000, crystal: 95000, deuterium: 30000 }, seconds: 105 },
  // Relic tier — endgame, one component per boss-tier hull
  { id: 'fab-world-heart-plate', name: 'World-Heart Forged Plate', tier: 'relic', category: 'hull-plating', description: 'Plate cold-forged around a world-boss heart fragment.', input: { metal: 250000, crystal: 300000, deuterium: 120000 }, seconds: 300 },
  { id: 'fab-gate-span-drive', name: 'Gate-Span Stellar Drive', tier: 'relic', category: 'drive-system', description: 'Drive core keyed to stargate wormhole harmonics.', input: { metal: 220000, crystal: 260000, deuterium: 200000 }, seconds: 330 },
  { id: 'fab-omega-lance', name: 'Omega Annihilation Lance', tier: 'relic', category: 'weapon-frame', description: 'Class-X apex weapon frame for cosmic arc titans.', input: { metal: 280000, crystal: 240000, deuterium: 180000 }, seconds: 310 },
  { id: 'fab-aegis-prism', name: 'Aegis Infinity Prism', tier: 'relic', category: 'shield-lattice', description: 'Prismatic shield lattice folding space into armor.', input: { metal: 200000, crystal: 320000, deuterium: 160000 }, seconds: 320 },
  { id: 'fab-crown-circuit', name: 'Imperial Crown Circuit', tier: 'relic', category: 'control-circuit', description: 'Sovereign command circuit etched with imperial glyphs.', input: { metal: 180000, crystal: 300000, deuterium: 140000 }, seconds: 280 },
];

export interface FabricatorJob {
  id: string;
  componentId: string;
  componentName: string;
  remaining: number;
  total: number;
}

interface FabricatorProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  stock: Record<string, number>;
  onStockChange: (delta: Record<string, number>) => void;
}

const FabricatorPanel: React.FC<FabricatorProps> = ({ resources, onUpdateResources, stock, onStockChange }) => {
  const [jobs, setJobs] = useState<FabricatorJob[]>([]);
  const [tierFilter, setTierFilter] = useState<FabricatorTier | 'all'>('all');
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const visible = FABRICATOR_COMPONENTS.filter((c) => tierFilter === 'all' || c.tier === tierFilter);

  const say = (ok: boolean, message: string) => {
    setFeedback({ ok, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const canAfford = (c: FabricatorComponent) =>
    resources.metal >= c.input.metal && resources.crystal >= c.input.crystal && resources.deuterium >= c.input.deuterium;

  const startJob = (c: FabricatorComponent) => {
    if (!canAfford(c)) {
      sound.play('warning');
      say(false, `Insufficient resources — need ${c.input.metal.toLocaleString()} metal, ${c.input.crystal.toLocaleString()} crystal, ${c.input.deuterium.toLocaleString()} deuterium.`);
      return;
    }
    sound.play('confirm');
    onUpdateResources({
      metal: resources.metal - c.input.metal,
      crystal: resources.crystal - c.input.crystal,
      deuterium: resources.deuterium - c.input.deuterium,
    });
    setJobs((prev) => [...prev, { id: `fab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, componentId: c.id, componentName: c.name, remaining: c.seconds, total: c.seconds }]);
    say(true, `${c.name} fabrication started — ${c.seconds}s cycle.`);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setJobs((prev) => {
        const completed: FabricatorJob[] = [];
        const rest: FabricatorJob[] = [];
        for (const j of prev) {
          if (j.remaining <= 1) completed.push(j);
          else rest.push({ ...j, remaining: j.remaining - 1 });
        }
        if (completed.length > 0) {
          const delta: Record<string, number> = {};
          for (const j of completed) delta[j.componentId] = (delta[j.componentId] ?? 0) + 1;
          onStockChange(delta);
          sound.play('success');
          setTimeout(() => say(true, `Fabrication complete: ${completed.map((c) => c.componentName).join(', ')}.`), 0);
        }
        return rest;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelJob = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const comp = FABRICATOR_COMPONENTS.find((c) => c.id === job.componentId)!;
    sound.play('warning');
    onUpdateResources({
      metal: resources.metal + Math.floor(comp.input.metal * 0.7),
      crystal: resources.crystal + Math.floor(comp.input.crystal * 0.7),
      deuterium: resources.deuterium + Math.floor(comp.input.deuterium * 0.7),
    });
    setJobs((prev) => prev.filter((j) => j.id !== id));
    say(true, `${job.componentName} cancelled — 70% of materials recovered.`);
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#dedede] bg-white p-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider flex items-center gap-1 mr-2"><Factory className="w-3 h-3" /> Component Fabricator</span>
        {(['all', 'standard', 'advanced', 'exotic', 'relic'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTierFilter(t)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase border transition-colors cursor-pointer ${tierFilter === t ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#fafafa] text-[#111111] border-[#dedede] hover:border-[#111111]'}`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-[#777777]">{jobs.length} active job(s)</span>
      </div>

      {feedback && (
        <div className={`p-4 border-l-4 text-xs font-semibold ${feedback.ok ? 'bg-[#fafafa] border-[#111111]' : 'bg-red-50 border-red-600 text-red-800'}`}>
          {feedback.ok ? '✔ ' : '✘ '}{feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((c) => {
          const affordable = canAfford(c);
          const held = stock[c.id] ?? 0;
          return (
            <div key={c.id} className="border border-[#dedede] bg-white p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-[#111111]">{c.name}</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 border uppercase ${
                    c.tier === 'standard' ? 'bg-neutral-50 text-neutral-700 border-neutral-200' :
                    c.tier === 'advanced' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    c.tier === 'exotic' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'}`}>{c.tier}</span>
                </div>
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">{c.category.replace('-', ' ')} · In stock: <span className="font-mono text-[#111111]">{held}</span></div>
                <p className="text-[11px] text-[#666666] mt-1.5">{c.description}</p>
              </div>
              <div className="space-y-2 pt-3 border-t border-[#eeeeee]">
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Metal</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{c.input.metal.toLocaleString()}</strong></div>
                  <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Crystal</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{c.input.crystal.toLocaleString()}</strong></div>
                  <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Deut.</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{c.input.deuterium.toLocaleString()}</strong></div>
                  <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Cycle</span><strong className="font-mono text-[#111111]">{c.seconds}s</strong></div>
                </div>
                <button
                  type="button"
                  onClick={() => startJob(c)}
                  disabled={!affordable}
                  className={`w-full py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${affordable ? 'bg-[#111111] text-white hover:bg-[#333333]' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                >
                  {affordable ? '⬤ Fabricate' : 'Insufficient Resources'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length > 0 && (
        <div className="border border-[#dedede] bg-white p-4 space-y-2">
          <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">Fabrication Queue</div>
          {jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#111111]"><Zap className="w-3 h-3 inline mr-1" />{j.componentName}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#666666]">{j.remaining}s / {j.total}s</span>
                <button type="button" onClick={() => cancelJob(j.id)} className="text-[10px] px-2 py-1 border border-red-300 bg-red-50 text-red-700 font-bold uppercase hover:border-red-600 cursor-pointer">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ConstructionYardView: React.FC<ConstructionYardViewProps> = ({ resources, onUpdateResources }) => {
  const [projects, setProjects] = useState<YardProject[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [tab, setTab] = useState<'blueprints' | 'facilities' | 'fabricator' | 'queue'>('blueprints');
  const [componentStock, setComponentStock] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('uc_fabricator_stock') || '{}'); } catch { return {}; }
  });
  const [categoryFilter, setCategoryFilter] = useState<BlueprintCategory | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(24);

  const blueprints = useMemo(() => YARD_BLUEPRINTS.filter(
    (bp) => (categoryFilter === 'all' || bp.category === categoryFilter) &&
            (tierFilter === 'all' || bp.tier === tierFilter)
  ), [categoryFilter, tierFilter]);

  const effectiveBuild = useMemo(() => {
    const map = new Map<string, { cost: { metal: number; crystal: number; deuterium: number }; seconds: number }>();
    for (const bp of blueprints) {
      const meFactor = 1 - bp.materialEfficiency * 0.01; // ME reduces material cost
      const teFactor = 1 - bp.timeEfficiency * 0.01;    // TE reduces build time
      map.set(bp.id, {
        cost: {
          metal: Math.max(1, Math.floor(bp.baseBuildCost.metal * meFactor)),
          crystal: Math.max(1, Math.floor(bp.baseBuildCost.crystal * meFactor)),
          deuterium: Math.max(1, Math.floor(bp.baseBuildCost.deuterium * meFactor)),
        },
        seconds: Math.max(5, Math.floor(bp.baseBuildTimeSeconds * teFactor)),
      });
    }
    return map;
  }, [blueprints]);

  const say = (ok: boolean, message: string) => {
    setFeedback({ ok, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const canAfford = (cost: { metal: number; crystal: number; deuterium: number }) =>
    resources.metal >= cost.metal && resources.crystal >= cost.crystal && resources.deuterium >= cost.deuterium;

  const startProject = (kind: ProjectKind, name: string, cost: { metal: number; crystal: number; deuterium: number }, seconds: number) => {
    if (!canAfford(cost)) {
      sound.play('warning');
      say(false, `Insufficient resources — need ${cost.metal.toLocaleString()} metal, ${cost.crystal.toLocaleString()} crystal, ${cost.deuterium.toLocaleString()} deuterium.`);
      return;
    }
    sound.play('confirm');
    onUpdateResources({
      metal: resources.metal - cost.metal,
      crystal: resources.crystal - cost.crystal,
      deuterium: resources.deuterium - cost.deuterium,
    });
    setProjects((prev) => [
      ...prev,
      { id: `yard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, name, remainingSeconds: seconds, totalSeconds: seconds, cost },
    ]);
    say(true, `${name} laid down in the yard — ${seconds}s build cycle started.`);
  };

  const tickProjects = () => {
    setProjects((prev) => {
      const completed: YardProject[] = [];
      const remaining: YardProject[] = [];
      for (const p of prev) {
        if (p.remainingSeconds <= 1) completed.push(p);
        else remaining.push({ ...p, remainingSeconds: p.remainingSeconds - 1 });
      }
      if (completed.length > 0) {
        sound.play('success');
        setTimeout(() => say(true, `Construction complete: ${completed.map((c) => c.name).join(', ')}.`), 0);
      }
      return remaining;
    });
  };

  React.useEffect(() => {
    const timer = window.setInterval(tickProjects, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    sound.play('warning');
    onUpdateResources({
      metal: resources.metal + Math.floor(project.cost.metal * 0.7),
      crystal: resources.crystal + Math.floor(project.cost.crystal * 0.7),
      deuterium: resources.deuterium + Math.floor(project.cost.deuterium * 0.7),
    });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    say(true, `${project.name} scrapped — 70% of materials recovered.`);
  };

  return (
    <div id="construction-yard-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          IMPERIAL CONSTRUCTION YARD · BLUEPRINT FABRICATION & FACILITY ASSEMBLY
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Construction Yard</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-3xl leading-relaxed">
          Lay down hulls, modules and imperial facilities from researched blueprints. Material Efficiency trims cost; Time Efficiency trims the clock.
        </p>
      </div>

      <div className="flex gap-2">
        {([['blueprints', 'Blueprint Builds'], ['facilities', 'Facility Projects'], ['fabricator', 'Component Fabricator'], ['queue', `Queue (${projects.length})`]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${tab === id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#fafafa] text-[#111111] border-[#dedede] hover:border-[#111111]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`p-4 border-l-4 text-xs font-semibold flex justify-between items-center ${feedback.ok ? 'bg-[#fafafa] border-[#111111]' : 'bg-red-50 border-red-600 text-red-800'}`}>
          <span>{feedback.ok ? '✔ ' : '✘ '}{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {tab === 'blueprints' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="border border-[#dedede] bg-white p-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider flex items-center gap-1 mr-2"><Filter className="w-3 h-3" /> Filter</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value as BlueprintCategory | 'all'); setVisibleCount(24); }}
              className="text-[11px] font-bold uppercase border border-[#dedede] bg-[#fafafa] px-2 py-1.5 cursor-pointer"
            >
              <option value="all">All Categories ({YARD_BLUEPRINTS.length})</option>
              {BLUEPRINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c} ({YARD_BLUEPRINTS.filter((b) => b.category === c).length})</option>
              ))}
            </select>
            <select
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setVisibleCount(24); }}
              className="text-[11px] font-bold uppercase border border-[#dedede] bg-[#fafafa] px-2 py-1.5 cursor-pointer"
            >
              <option value="all">All Tiers</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                <option key={t} value={t}>Tier {t}</option>
              ))}
            </select>
            <span className="ml-auto font-mono text-[11px] text-[#777777]">Showing {Math.min(visibleCount, blueprints.length)} of {blueprints.length} blueprints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blueprints.slice(0, visibleCount).map((bp) => {
            const build = effectiveBuild.get(bp.id)!;
            const affordable = canAfford(build.cost);
            return (
              <div key={bp.id} className="border border-[#dedede] bg-white p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 border uppercase ${bp.isOriginal ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                      {bp.isOriginal ? 'Original (BPO)' : 'Copy (BPC)'}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#111111]">
                      Tier {bp.tier} · Runs: {bp.runsRemaining === Infinity ? '∞' : bp.runsRemaining}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#111111]">{bp.name}</h3>
                  <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mt-0.5">{bp.category}</div>
                  <p className="text-[11px] text-[#666666] mt-2 leading-relaxed">{bp.description}</p>
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
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Metal</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{build.cost.metal.toLocaleString()}</strong></div>
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Crystal</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{build.cost.crystal.toLocaleString()}</strong></div>
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Deut.</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{build.cost.deuterium.toLocaleString()}</strong></div>
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Cycle</span><strong className="font-mono text-[#111111]">{build.seconds}s</strong></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startProject(bp.type as ProjectKind, bp.name, build.cost, build.seconds)}
                    disabled={!affordable}
                    className={`w-full py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${affordable ? 'bg-[#111111] text-white hover:bg-[#333333]' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                  >
                    {affordable ? '⬤ Lay Down Hull' : 'Insufficient Resources'}
                  </button>
                </div>
              </div>
            );
            })}
          </div>

          {visibleCount < blueprints.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + 24)}
              className="w-full py-3 bg-[#fafafa] border border-[#dedede] hover:border-[#111111] text-[#111111] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Load More Blueprints ({blueprints.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}

      {tab === 'fabricator' && (
        <FabricatorPanel
          resources={resources}
          onUpdateResources={onUpdateResources}
          stock={componentStock}
          onStockChange={(delta) => {
            setComponentStock((prev) => {
              const next = { ...prev };
              for (const [id, qty] of Object.entries(delta)) next[id] = (next[id] ?? 0) + qty;
              try { localStorage.setItem('uc_fabricator_stock', JSON.stringify(next)); } catch { /* ignore */ }
              return next;
            });
          }}
        />
      )}

      {tab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FACILITY_PLANS.map((plan) => {
            const affordable = canAfford(plan.baseCost);
            return (
              <div key={plan.id} className="border border-[#dedede] bg-white p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{plan.icon}</span>
                      <div>
                        <h3 className="font-bold text-base text-[#111111]">{plan.name}</h3>
                        <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">Facility Blueprint</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 border bg-emerald-50 text-emerald-800 border-emerald-200 uppercase">{plan.benefit}</span>
                  </div>
                  <p className="text-xs text-[#666666] mt-1">{plan.description}</p>
                </div>
                <div className="space-y-2 pt-4 border-t border-[#eeeeee]">
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Metal</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{plan.baseCost.metal.toLocaleString()}</strong></div>
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Crystal</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{plan.baseCost.crystal.toLocaleString()}</strong></div>
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Deut.</span><strong className={`font-mono ${affordable ? 'text-[#111111]' : 'text-red-600'}`}>{plan.baseCost.deuterium.toLocaleString()}</strong></div>
                    <div className="bg-[#fafafa] p-2 border border-[#dedede]"><span className="text-[9px] text-[#777777] block font-bold uppercase">Build</span><strong className="font-mono text-[#111111]">{plan.baseSeconds}s</strong></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startProject('facility', plan.name, plan.baseCost, plan.baseSeconds)}
                    disabled={!affordable}
                    className={`w-full py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${affordable ? 'bg-[#111111] text-white hover:bg-[#333333]' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                  >
                    {affordable ? '⬤ Begin Construction' : 'Insufficient Resources'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'queue' && (
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="border border-[#dedede] bg-white p-10 text-center">
              <Layers className="w-8 h-8 mx-auto mb-2 text-[#cccccc]" />
              <div className="text-sm text-[#666666]">The yard is quiet. Lay down a hull or facility to begin construction.</div>
            </div>
          ) : (
            projects.map((p) => {
              const pct = Math.round(((p.totalSeconds - p.remainingSeconds) / p.totalSeconds) * 100);
              return (
                <div key={p.id} className="border border-[#dedede] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#111111]" />
                      <span className="font-bold text-sm text-[#111111]">{p.name}</span>
                      <span className="text-[9px] text-[#777777] uppercase font-bold tracking-wider border border-[#dedede] bg-[#fafafa] px-1.5 py-0.5">{KIND_LABEL[p.kind]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#666666]">{p.remainingSeconds}s remaining</span>
                      <button onClick={() => cancelProject(p.id)} className="text-[10px] px-2 py-1 border border-red-300 bg-red-50 text-red-700 font-bold uppercase hover:border-red-600 transition-colors cursor-pointer">Scrap · 70% Refund</button>
                    </div>
                  </div>
                  <div className="h-2.5 bg-[#fafafa] border border-[#dedede] overflow-hidden">
                    <div className="h-full bg-[#111111] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="font-mono text-[10px] text-[#777777] mt-1 text-right">{pct}% complete</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
