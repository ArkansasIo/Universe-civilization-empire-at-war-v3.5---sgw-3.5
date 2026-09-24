import React, { useState, useEffect } from 'react';
import {
  Users,
  Pickaxe,
  Shield,
  Crosshair,
  Eye,
  ShieldAlert,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';

interface TrainingViewProps {
  resources: PlayerResources;
  activeRoute?: string;
  onTrainUnits: (
    type: 'attack' | 'defense' | 'miners' | 'spies' | 'antiSpies' | 'superUnits',
    count: number
  ) => {
    success: boolean;
    message: string;
  };
  onUpgradeProduction: () => { success: boolean; message: string };
  onNavigate?: (route: string) => void;
}

type TrainingFilterCategory = 'all' | 'miners' | 'combat' | 'espionage' | 'super' | 'facilities';

export const TrainingView: React.FC<TrainingViewProps> = ({
  resources,
  activeRoute,
  onTrainUnits,
  onUpgradeProduction,
  onNavigate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<TrainingFilterCategory>('all');
  const [trainAmounts, setTrainAmounts] = useState<Record<string, number>>({
    attack: 50,
    defense: 50,
    miners: 50,
    spies: 20,
    antiSpies: 20,
    superUnits: 5,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeRoute === 'miners') setSelectedFilter('miners');
    else if (activeRoute === 'super-units') setSelectedFilter('super');
    else if (activeRoute === 'unit-production') setSelectedFilter('facilities');
    else if (activeRoute === 'units') setSelectedFilter('all');
  }, [activeRoute]);

  const upgradeCost = (resources.unitProduction ?? 10) * 5000 + 10000;

  const handleTrain = (type: 'attack' | 'defense' | 'miners' | 'spies' | 'antiSpies' | 'superUnits') => {
    const count = trainAmounts[type] || 1;
    const res = onTrainUnits(type, count);
    if (res.success) {
      sound.play('confirm');
      setFeedback({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleUpgradeProd = () => {
    const res = onUpgradeProduction();
    if (res.success) {
      sound.play('research');
      setFeedback({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const setAmount = (type: string, val: number) => {
    setTrainAmounts((prev) => ({ ...prev, [type]: Math.max(1, val) }));
  };

  const setQuickAmount = (type: string, val: number) => {
    setTrainAmounts((prev) => ({ ...prev, [type]: Math.max(1, val) }));
  };

  const setMaxAmount = (type: string, costPerUnit: number = 1) => {
    const maxAvailable = Math.floor((resources.untrainedUnits ?? 0) / costPerUnit);
    setTrainAmounts((prev) => ({ ...prev, [type]: Math.max(1, maxAvailable) }));
  };

  return (
    <div id="training-view" className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1 font-mono">
              PERSONNEL ACADEMY & WORKFORCE CYBERNETICS · BARRACKS & DRILL GROUNDS
            </div>
            <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
              Workforce Recruitment & Specialized Academy
            </h2>
            <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
              Enlist raw citizen population into frontline combat divisions, orbital defense garrisons, deep-mantle Naquadah miners, or covert espionage operatives.
            </p>
          </div>

          <div className="p-3 bg-[#fafafa] border border-[#dedede] font-mono text-right shrink-0">
            <span className="text-[10px] text-[#777777] uppercase block font-semibold">UNTRAINED RECRUITS</span>
            <strong className="text-2xl font-bold text-blue-700">
              {(resources.untrainedUnits ?? 0).toLocaleString()}
            </strong>
            <span className="text-[10px] text-emerald-700 block font-semibold">
              +{resources.unitProduction ?? 10} recruits/turn
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 border text-xs font-semibold flex justify-between items-center shadow-2xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 border-l-4'
              : 'bg-rose-50 border-rose-300 text-rose-950 border-l-4'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-bold cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subpage Filters Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border border-[#dedede] bg-white p-2">
        {[
          { id: 'all', label: 'All Divisions', count: (resources.attackUnits ?? 0) + (resources.defenseUnits ?? 0) + (resources.miners ?? 0) },
          { id: 'miners', label: 'Naquadah Miners', count: resources.miners ?? 0 },
          { id: 'combat', label: 'Ground Troops (Atk/Def)', count: (resources.attackUnits ?? 0) + (resources.defenseUnits ?? 0) },
          { id: 'espionage', label: 'Intelligence Corps', count: (resources.spies ?? 0) + (resources.antiSpies ?? 0) },
          { id: 'super', label: 'Super Units', count: resources.superUnits ?? 0 },
          { id: 'facilities', label: 'Cloning Facilities', count: `+${resources.unitProduction ?? 10}/t` },
        ].map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.play('click');
                setSelectedFilter(tab.id as TrainingFilterCategory);
              }}
              className={`px-3 py-1.5 text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#111111] text-amber-400 shadow-2xs'
                  : 'bg-[#f7f7f7] text-[#555555] hover:bg-[#eeeeee] hover:text-[#111111]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-2xs ${isActive ? 'bg-[#222222] text-amber-300' : 'bg-[#e5e5e5] text-[#666666]'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cloning Facilities Upgrade Banner */}
      {(selectedFilter === 'all' || selectedFilter === 'facilities') && (
        <div className="border border-[#dedede] bg-[#fafafa] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider font-mono">
              POPULATION GROWTH ACCELERATOR
            </span>
            <h3 className="text-lg font-bold text-[#111111] font-mono mt-0.5">
              Generating +{resources.unitProduction ?? 10} Untrained Civilians / Turn
            </h3>
            <p className="text-xs text-[#666666] mt-1">
              Expand biodome gestation pods and planetary cloning faculties to yield +2 additional civilians every turn.
            </p>
          </div>

          <button
            type="button"
            id="upgrade-production-btn"
            onClick={handleUpgradeProd}
            disabled={resources.naquadah < upgradeCost}
            className="px-5 py-2.5 bg-[#111111] text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors disabled:opacity-50 cursor-pointer shrink-0 font-mono shadow-2xs"
          >
            Upgrade Facility ({upgradeCost.toLocaleString()} NQ) →
          </button>
        </div>
      )}

      {/* Training Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attack Troops */}
        {(selectedFilter === 'all' || selectedFilter === 'combat') && (
          <div className="border border-[#dedede] bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <div className="flex items-center gap-2">
                <Crosshair size={16} className="text-rose-600" />
                <strong className="text-xs font-bold text-[#111111] uppercase font-mono">Attack Troops</strong>
              </div>
              <span className="font-mono text-xs font-bold text-rose-700">{resources.attackUnits.toLocaleString()} active</span>
            </div>
            <p className="text-[11px] text-[#666666] min-h-[32px]">
              Frontline shock troops that pilot boarding craft and execute ground invasions on enemy worlds.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#888888]">
              <span>Quick:</span>
              <button type="button" onClick={() => setQuickAmount('attack', 10)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">10</button>
              <button type="button" onClick={() => setQuickAmount('attack', 50)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">50</button>
              <button type="button" onClick={() => setQuickAmount('attack', 250)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">250</button>
              <button type="button" onClick={() => setMaxAmount('attack')} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 font-bold text-[#111111]">Max</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={resources.untrainedUnits}
                value={trainAmounts.attack}
                onChange={(e) => setAmount('attack', parseInt(e.target.value, 10) || 1)}
                className="w-24 border border-[#cccccc] px-2 py-1 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleTrain('attack')}
                disabled={resources.untrainedUnits < trainAmounts.attack}
                className="flex-1 py-1.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] disabled:opacity-50 font-mono cursor-pointer"
              >
                Enlist Troops
              </button>
            </div>
          </div>
        )}

        {/* Defense Troops */}
        {(selectedFilter === 'all' || selectedFilter === 'combat') && (
          <div className="border border-[#dedede] bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-600" />
                <strong className="text-xs font-bold text-[#111111] uppercase font-mono">Defense Troops</strong>
              </div>
              <span className="font-mono text-xs font-bold text-blue-700">{resources.defenseUnits.toLocaleString()} active</span>
            </div>
            <p className="text-[11px] text-[#666666] min-h-[32px]">
              Stationary garrison guards defending bunker perimeters, planetary shields, and stargate blast doors.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#888888]">
              <span>Quick:</span>
              <button type="button" onClick={() => setQuickAmount('defense', 10)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">10</button>
              <button type="button" onClick={() => setQuickAmount('defense', 50)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">50</button>
              <button type="button" onClick={() => setQuickAmount('defense', 250)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">250</button>
              <button type="button" onClick={() => setMaxAmount('defense')} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 font-bold text-[#111111]">Max</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={resources.untrainedUnits}
                value={trainAmounts.defense}
                onChange={(e) => setAmount('defense', parseInt(e.target.value, 10) || 1)}
                className="w-24 border border-[#cccccc] px-2 py-1 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleTrain('defense')}
                disabled={resources.untrainedUnits < trainAmounts.defense}
                className="flex-1 py-1.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] disabled:opacity-50 font-mono cursor-pointer"
              >
                Deploy Guards
              </button>
            </div>
          </div>
        )}

        {/* Industrial Miners */}
        {(selectedFilter === 'all' || selectedFilter === 'miners') && (
          <div className="border border-[#dedede] bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <div className="flex items-center gap-2">
                <Pickaxe size={16} className="text-amber-600" />
                <strong className="text-xs font-bold text-[#111111] uppercase font-mono">Naquadah Miners</strong>
              </div>
              <span className="font-mono text-xs font-bold text-amber-700">{resources.miners.toLocaleString()} active</span>
            </div>
            <p className="text-[11px] text-[#666666] min-h-[32px]">
              Specialized deep-core drill engineers extracting liquid Naquadah ore (+80 NQ/turn per miner).
            </p>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#888888]">
              <span>Quick:</span>
              <button type="button" onClick={() => setQuickAmount('miners', 10)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">10</button>
              <button type="button" onClick={() => setQuickAmount('miners', 50)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">50</button>
              <button type="button" onClick={() => setQuickAmount('miners', 250)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">250</button>
              <button type="button" onClick={() => setMaxAmount('miners')} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 font-bold text-[#111111]">Max</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={resources.untrainedUnits}
                value={trainAmounts.miners}
                onChange={(e) => setAmount('miners', parseInt(e.target.value, 10) || 1)}
                className="w-24 border border-[#cccccc] px-2 py-1 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleTrain('miners')}
                disabled={resources.untrainedUnits < trainAmounts.miners}
                className="flex-1 py-1.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] disabled:opacity-50 font-mono cursor-pointer"
              >
                Assign Drillers
              </button>
            </div>
          </div>
        )}

        {/* Spies */}
        {(selectedFilter === 'all' || selectedFilter === 'espionage') && (
          <div className="border border-[#dedede] bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-purple-600" />
                <strong className="text-xs font-bold text-[#111111] uppercase font-mono">Covert Spies</strong>
              </div>
              <span className="font-mono text-xs font-bold text-purple-700">{resources.spies.toLocaleString()} active</span>
            </div>
            <p className="text-[11px] text-[#666666] min-h-[32px]">
              Espionage operatives trained in phase cloak camouflage, signal interception, and covert surveillance.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#888888]">
              <span>Quick:</span>
              <button type="button" onClick={() => setQuickAmount('spies', 5)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">5</button>
              <button type="button" onClick={() => setQuickAmount('spies', 20)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">20</button>
              <button type="button" onClick={() => setQuickAmount('spies', 100)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">100</button>
              <button type="button" onClick={() => setMaxAmount('spies')} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 font-bold text-[#111111]">Max</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={resources.untrainedUnits}
                value={trainAmounts.spies}
                onChange={(e) => setAmount('spies', parseInt(e.target.value, 10) || 1)}
                className="w-24 border border-[#cccccc] px-2 py-1 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleTrain('spies')}
                disabled={resources.untrainedUnits < trainAmounts.spies}
                className="flex-1 py-1.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] disabled:opacity-50 font-mono cursor-pointer"
              >
                Train Agents
              </button>
            </div>
          </div>
        )}

        {/* Anti-Spies */}
        {(selectedFilter === 'all' || selectedFilter === 'espionage') && (
          <div className="border border-[#dedede] bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-indigo-600" />
                <strong className="text-xs font-bold text-[#111111] uppercase font-mono">Counter-Intel</strong>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-700">{resources.antiSpies.toLocaleString()} active</span>
            </div>
            <p className="text-[11px] text-[#666666] min-h-[32px]">
              Homeland security agents monitoring stargate wormholes to detect and neutralize foreign spies.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#888888]">
              <span>Quick:</span>
              <button type="button" onClick={() => setQuickAmount('antiSpies', 5)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">5</button>
              <button type="button" onClick={() => setQuickAmount('antiSpies', 20)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">20</button>
              <button type="button" onClick={() => setQuickAmount('antiSpies', 100)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">100</button>
              <button type="button" onClick={() => setMaxAmount('antiSpies')} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 font-bold text-[#111111]">Max</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={resources.untrainedUnits}
                value={trainAmounts.antiSpies}
                onChange={(e) => setAmount('antiSpies', parseInt(e.target.value, 10) || 1)}
                className="w-24 border border-[#cccccc] px-2 py-1 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleTrain('antiSpies')}
                disabled={resources.untrainedUnits < trainAmounts.antiSpies}
                className="flex-1 py-1.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] disabled:opacity-50 font-mono cursor-pointer"
              >
                Deploy Patrol
              </button>
            </div>
          </div>
        )}

        {/* Super Units */}
        {(selectedFilter === 'all' || selectedFilter === 'super') && (
          <div className="border border-[#dedede] bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <strong className="text-xs font-bold text-[#111111] uppercase font-mono">Super Units</strong>
              </div>
              <span className="font-mono text-xs font-bold text-amber-600">{resources.superUnits.toLocaleString()} active</span>
            </div>
            <p className="text-[11px] text-[#666666] min-h-[32px]">
              Elite bio-engineered warriors (Kull hybrids / Asgard battle drones) providing massive combat power.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#888888]">
              <span>Quick:</span>
              <button type="button" onClick={() => setQuickAmount('superUnits', 1)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">1</button>
              <button type="button" onClick={() => setQuickAmount('superUnits', 5)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">5</button>
              <button type="button" onClick={() => setQuickAmount('superUnits', 25)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200">25</button>
              <button type="button" onClick={() => setMaxAmount('superUnits', 5)} className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 font-bold text-[#111111]">Max</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={Math.floor(resources.untrainedUnits / 5)}
                value={trainAmounts.superUnits}
                onChange={(e) => setAmount('superUnits', parseInt(e.target.value, 10) || 1)}
                className="w-24 border border-[#cccccc] px-2 py-1 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleTrain('superUnits')}
                disabled={resources.untrainedUnits < trainAmounts.superUnits * 5}
                className="flex-1 py-1.5 bg-[#111111] text-amber-400 text-xs font-bold uppercase hover:bg-[#333333] disabled:opacity-50 font-mono cursor-pointer shadow-2xs"
              >
                Synthesize (5 pop/ea)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
