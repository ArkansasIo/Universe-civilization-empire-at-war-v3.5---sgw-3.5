import React, { useMemo, useState } from 'react';
import { Building2, Hammer, Clock, CheckCircle2, XCircle, Layers, Zap } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';
import { INITIAL_EVE_BLUEPRINTS, EveBlueprint } from '../../blueprintSystemsData';

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

export const ConstructionYardView: React.FC<ConstructionYardViewProps> = ({ resources, onUpdateResources }) => {
  const [projects, setProjects] = useState<YardProject[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [tab, setTab] = useState<'blueprints' | 'facilities' | 'queue'>('blueprints');

  const blueprints = INITIAL_EVE_BLUEPRINTS;

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
        {([['blueprints', 'Blueprint Builds'], ['facilities', 'Facility Projects'], ['queue', `Queue (${projects.length})`]] as const).map(([id, label]) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blueprints.map((bp) => {
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
                      Runs: {bp.runsRemaining}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#111111]">{bp.name}</h3>
                  <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider mt-0.5">{KIND_LABEL[bp.type as ProjectKind]} Classification</div>
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
