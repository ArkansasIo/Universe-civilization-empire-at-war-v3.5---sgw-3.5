import React, { useState } from 'react';
import {
  OGameTechnology,
  OGameTechCategory,
  PlayerResources,
  ResearchQueueItem,
  LabSpecialization,
} from '../../types';
import { sound } from '../../sound';

interface ResearchLibraryViewProps {
  technologies: OGameTechnology[];
  resources: PlayerResources;
  researchQueue: ResearchQueueItem[];
  labSpecialization: LabSpecialization;
  onSelectLabSpecialization: (spec: LabSpecialization) => void;
  onStartResearch: (techId: string) => void;
  onCancelResearch: (queueId: string) => void;
  onInstantCompleteResearch?: (queueId: string) => void;
}

const CATEGORIES: { id: string; categoryValue: OGameTechCategory | 'all'; label: string; icon: string }[] = [
  { id: 'cat_all', categoryValue: 'all', label: 'All Categories', icon: '✦' },
  { id: 'cat_energy', categoryValue: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'cat_mining', categoryValue: 'mining', label: 'Mining', icon: '⛏' },
  { id: 'cat_materials', categoryValue: 'materials', label: 'Materials', icon: '🧱' },
  { id: 'cat_computing', categoryValue: 'computing', label: 'Computing', icon: '💻' },
  { id: 'cat_physics', categoryValue: 'physics', label: 'Physics', icon: '⚛' },
  { id: 'cat_propulsion', categoryValue: 'propulsion', label: 'Propulsion', icon: '🚀' },
  { id: 'cat_weapons', categoryValue: 'weapons', label: 'Weapons', icon: '⚔' },
  { id: 'cat_shields', categoryValue: 'shields', label: 'Shields', icon: '🛡' },
  { id: 'cat_armor', categoryValue: 'armor', label: 'Armor', icon: '🛡' },
  { id: 'cat_espionage', categoryValue: 'espionage', label: 'Espionage', icon: '👁' },
  { id: 'cat_colonization', categoryValue: 'colonization', label: 'Colonization', icon: '🪐' },
  { id: 'cat_fleet', categoryValue: 'fleet', label: 'Fleet Command', icon: '🛸' },
  { id: 'cat_ai', categoryValue: 'ai', label: 'Artificial Intel', icon: '🤖' },
  { id: 'cat_quantum', categoryValue: 'quantum', label: 'Quantum Tech', icon: '🔬' },
  { id: 'cat_dimensional', categoryValue: 'dimensional', label: 'Dimensional', icon: '🌀' },
  { id: 'cat_megastructure', categoryValue: 'megastructure', label: 'Megastructures', icon: '☀️' },
];

const LAB_SPECIALIZATIONS: {
  id: LabSpecialization;
  name: string;
  bonus: string;
  categories: OGameTechCategory[];
}[] = [
  { id: 'physics', name: 'Physics Laboratory', bonus: '+15% Energy & Quantum Research Speed', categories: ['energy', 'quantum', 'physics'] },
  { id: 'engineering', name: 'Engineering Laboratory', bonus: '+15% Materials & Mining Research Speed', categories: ['mining', 'materials', 'megastructure'] },
  { id: 'propulsion', name: 'Propulsion Laboratory', bonus: '+15% Propulsion & Fleet Research Speed', categories: ['propulsion', 'fleet'] },
  { id: 'military', name: 'Military Weapons Lab', bonus: '+15% Weapons, Shields & Armor Speed', categories: ['weapons', 'shields', 'armor'] },
  { id: 'computer', name: 'Supercomputing Center', bonus: '+15% Computing & Espionage Speed', categories: ['computing', 'espionage'] },
  { id: 'ai', name: 'Autonomous AI Complex', bonus: '+20% AI & Neural Network Speed', categories: ['ai', 'computing'] },
  { id: 'dimensional', name: 'Dimensional Rift Core', bonus: '+25% Dimensional & Endgame Research Speed', categories: ['dimensional', 'megastructure'] },
];

export const ResearchLibraryView: React.FC<ResearchLibraryViewProps> = ({
  technologies,
  resources,
  researchQueue,
  labSpecialization,
  onSelectLabSpecialization,
  onStartResearch,
  onCancelResearch,
  onInstantCompleteResearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OGameTechCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTechId, setActiveTechId] = useState<string>(technologies[0]?.id || '');

  const activeTech = technologies.find((t) => t.id === activeTechId) || technologies[0];

  const filteredTechs = technologies.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const checkPrerequisitesMet = (tech: OGameTechnology): boolean => {
    return tech.prerequisites.every((req) => {
      if (req.type === 'tech') {
        const found = technologies.find((t) => t.id === req.id);
        return found && found.level >= req.requiredLevel;
      }
      return true;
    });
  };

  const getCostForNextLevel = (tech: OGameTechnology) => {
    const mult = Math.pow(tech.costMultiplier, tech.level);
    return {
      metal: Math.round(tech.baseCost.metal * mult),
      crystal: Math.round(tech.baseCost.crystal * mult),
      deuterium: Math.round(tech.baseCost.deuterium * mult),
      energy: Math.round(tech.baseCost.energy * mult),
      timeSeconds: Math.round(tech.baseTimeSeconds * Math.pow(1.3, tech.level)),
    };
  };

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const canAfford = (tech: OGameTechnology): boolean => {
    const cost = getCostForNextLevel(tech);
    return (
      (resources.metal ?? 0) >= cost.metal &&
      (resources.crystal ?? 0) >= cost.crystal &&
      (resources.deuterium ?? 0) >= cost.deuterium &&
      (resources.energy ?? 0) >= cost.energy
    );
  };

  const isResearching = (techId: string) => researchQueue.some((q) => q.techId === techId);

  return (
    <div className="space-y-6">
      {/* Top Banner with Spec Layout Title */}
      <div className="border border-[#111111] bg-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider">RESEARCH LIBRARY DATABASE</span>
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#111111] bg-[#f8fafc]">
                GAME SPEC §14
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-1">
              Universal galactic repository of theoretical, military, and industrial science.
              Configure laboratory focus and commit resources to upgrade empire-wide capabilities.
            </p>
          </div>

          {/* Laboratory Specialization Indicator */}
          <div className="border border-[#111111] bg-[#f8fafc] p-3 text-xs min-w-[260px]">
            <div className="text-[10px] font-mono text-[#666666] uppercase">ACTIVE LAB FOCUS</div>
            <div className="font-bold text-[#111111] mt-0.5">
              {LAB_SPECIALIZATIONS.find((l) => l.id === labSpecialization)?.name}
            </div>
            <div className="text-[11px] font-mono text-[#22c55e] mt-1">
              {LAB_SPECIALIZATIONS.find((l) => l.id === labSpecialization)?.bonus}
            </div>
          </div>
        </div>

        {/* Laboratory Specialization Quick Switch */}
        <div className="mt-4 pt-3 border-t border-[#e2e8f0]">
          <div className="text-xs font-bold text-[#111111] mb-2">Assign Planetary Lab Specialization:</div>
          <div className="flex flex-wrap gap-1.5">
            {LAB_SPECIALIZATIONS.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => {
                  sound.play('click');
                  onSelectLabSpecialization(spec.id);
                }}
                className={`px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer border ${
                  labSpecialization === spec.id
                    ? 'border-[#111111] bg-[#111111] text-white font-bold'
                    : 'border-[#cccccc] hover:border-[#111111] bg-white text-[#111111]'
                }`}
              >
                {spec.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Research Queue Tracker */}
      {researchQueue.length > 0 && (
        <div className="border border-[#111111] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-ping" />
              PLANETARY RESEARCH QUEUE ({researchQueue.length} Active)
            </span>
          </div>

          <div className="space-y-3">
            {researchQueue.map((item) => {
              const progressPercent = Math.min(
                100,
                Math.max(
                  5,
                  ((item.durationSeconds - item.remainingSeconds) / item.durationSeconds) * 100
                )
              );

              return (
                <div key={item.id} className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="font-bold text-[#111111]">
                      {item.techName} — Target Level {item.targetLevel}
                    </span>
                    <span className="text-[#666666]">
                      Time Remaining: {formatSeconds(item.remainingSeconds)}
                    </span>
                  </div>

                  <div className="w-full bg-[#e2e8f0] h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-[#111111] h-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#666666]">
                      Invested: M {item.metalCost.toLocaleString()} | C {item.crystalCost.toLocaleString()} | D {item.deuteriumCost.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-3">
                      {onInstantCompleteResearch && (
                        <button
                          type="button"
                          onClick={() => onInstantCompleteResearch(item.id)}
                          className="text-[#2563eb] hover:underline font-bold cursor-pointer"
                        >
                          [Accelerate Instant]
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onCancelResearch(item.id)}
                        className="text-[#dc2626] hover:underline cursor-pointer"
                      >
                        [Cancel Project]
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Layout: Left Sidebar Filter + Middle List + Right Spec-14 Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Filter List (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="border border-[#111111] bg-white p-3">
            <div className="text-xs font-bold text-[#111111] mb-2 uppercase tracking-wider">
              Categories
            </div>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setSelectedCategory(cat.categoryValue);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer flex items-center justify-between border ${
                    selectedCategory === cat.categoryValue
                      ? 'border-[#111111] bg-[#111111] text-white font-bold'
                      : 'border-transparent hover:border-[#cccccc] hover:bg-[#f8fafc] text-[#111111]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="text-[10px] opacity-70">
                    {cat.categoryValue === 'all'
                      ? technologies.length
                      : technologies.filter((t) => t.category === cat.categoryValue).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Technologies List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border border-[#111111] bg-white p-3">
            <input
              type="text"
              placeholder="Search Technology Database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-[#cccccc] focus:border-[#111111] outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredTechs.map((tech) => {
              const prereqsMet = checkPrerequisitesMet(tech);
              const cost = getCostForNextLevel(tech);
              const affordable = canAfford(tech);
              const researching = isResearching(tech.id);
              const isSelected = activeTech.id === tech.id;

              return (
                <div
                  key={tech.id}
                  onClick={() => {
                    sound.play('click');
                    setActiveTechId(tech.id);
                  }}
                  className={`border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#111111] bg-white ring-2 ring-[#111111]'
                      : 'border-[#cccccc] hover:border-[#111111] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-[#666666] uppercase">
                        {tech.category}
                      </div>
                      <h4 className="text-sm font-bold text-[#111111]">{tech.name}</h4>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold border border-[#111111] bg-[#f8fafc]">
                        Lv {tech.level}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#555555] line-clamp-1 mt-1">
                    {tech.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-[#f1f5f9]">
                    <span className="text-[#666666]">
                      M: {cost.metal.toLocaleString()} | C: {cost.crystal.toLocaleString()}
                    </span>
                    <span
                      className={`font-semibold ${
                        researching
                          ? 'text-[#22c55e]'
                          : !prereqsMet
                          ? 'text-[#dc2626]'
                          : affordable
                          ? 'text-[#111111]'
                          : 'text-[#888888]'
                      }`}
                    >
                      {researching
                        ? 'Researching'
                        : !prereqsMet
                        ? 'Locked'
                        : affordable
                        ? 'Available'
                        : 'Need Ore'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Spec Section 14 Complete Terminal Dossier (4 cols) */}
        <div className="lg:col-span-4">
          {activeTech && (
            <div className="border border-[#111111] bg-white p-5 sticky top-6 font-mono text-xs space-y-4">
              <div className="border-b border-[#111111] pb-3">
                <div className="text-[10px] text-[#666666] uppercase tracking-wider">
                  SPEC §14 TECHNOLOGY SHEET
                </div>
                <div className="text-base font-bold text-[#111111] mt-0.5">
                  {activeTech.name}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span>Level: {activeTech.level}</span>
                  <span
                    className={`font-bold ${
                      checkPrerequisitesMet(activeTech) ? 'text-[#22c55e]' : 'text-[#dc2626]'
                    }`}
                  >
                    Status: {checkPrerequisitesMet(activeTech) ? 'Available' : 'Prerequisites Missing'}
                  </span>
                </div>
              </div>

              {/* Prerequisites Section */}
              <div>
                <div className="font-bold text-[#111111] mb-1.5">Prerequisites:</div>
                {activeTech.prerequisites.length === 0 ? (
                  <div className="text-[#22c55e]">✓ Fundamental Science (No Prerequisites)</div>
                ) : (
                  <div className="space-y-1">
                    {activeTech.prerequisites.map((pr, idx) => {
                      const found = technologies.find((t) => t.id === pr.id);
                      const met = found ? found.level >= pr.requiredLevel : false;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 ${
                            met ? 'text-[#22c55e]' : 'text-[#dc2626]'
                          }`}
                        >
                          <span>{met ? '✓' : '✗'}</span>
                          <span>
                            {pr.name} Level {pr.requiredLevel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Effects Section */}
              <div className="border-t border-[#e2e8f0] pt-3">
                <div className="font-bold text-[#111111] mb-1.5">Effects:</div>
                <div className="space-y-1 bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
                  {activeTech.effects.map((ef, idx) => (
                    <div key={idx} className="text-[#111111]">
                      +{ef.valuePerLevel * (activeTech.level + 1)}
                      {ef.unit} {ef.label}
                    </div>
                  ))}
                  {activeTech.unlockTargets && activeTech.unlockTargets.length > 0 && (
                    <div className="pt-1 text-[11px] text-[#444444]">
                      <span className="font-semibold">Unlocks:</span>{' '}
                      {activeTech.unlockTargets.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Section */}
              {(() => {
                const cost = getCostForNextLevel(activeTech);
                const affordable = canAfford(activeTech);
                const prereqsMet = checkPrerequisitesMet(activeTech);
                const researching = isResearching(activeTech.id);

                return (
                  <div className="border-t border-[#e2e8f0] pt-3 space-y-3">
                    <div>
                      <div className="font-bold text-[#111111] mb-1.5">
                        Upgrade Cost (Level {activeTech.level + 1}):
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#666666]">Metal:</span>
                          <span className="font-bold text-[#111111]">
                            {cost.metal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666666]">Crystal:</span>
                          <span className="font-bold text-[#111111]">
                            {cost.crystal.toLocaleString()}
                          </span>
                        </div>
                        {cost.deuterium > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#666666]">Deuterium:</span>
                            <span className="font-bold text-[#111111]">
                              {cost.deuterium.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {cost.energy > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#666666]">Energy Req:</span>
                            <span className="font-bold text-[#111111]">
                              {cost.energy.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs py-1 border-y border-[#e2e8f0]">
                      <span className="text-[#666666]">Research Time:</span>
                      <span className="font-bold text-[#111111]">
                        {formatSeconds(cost.timeSeconds)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!prereqsMet || !affordable || researching || activeTech.level >= activeTech.maxLevel}
                      onClick={() => onStartResearch(activeTech.id)}
                      className={`w-full py-3 text-xs font-bold transition-colors cursor-pointer border ${
                        researching
                          ? 'border-[#cccccc] bg-[#f1f5f9] text-[#666666] cursor-not-allowed'
                          : activeTech.level >= activeTech.maxLevel
                          ? 'border-[#cccccc] bg-[#e2e8f0] text-[#888888] cursor-not-allowed'
                          : !prereqsMet
                          ? 'border-[#fca5a5] bg-[#fef2f2] text-[#dc2626] cursor-not-allowed'
                          : !affordable
                          ? 'border-[#cccccc] bg-[#f8fafc] text-[#888888] cursor-not-allowed'
                          : 'border-[#111111] bg-[#111111] text-white hover:bg-black'
                      }`}
                    >
                      {researching
                        ? '[ IN QUEUE ]'
                        : activeTech.level >= activeTech.maxLevel
                        ? '[ MAX LEVEL REACHED ]'
                        : !prereqsMet
                        ? '[ PREREQUISITES NOT MET ]'
                        : !affordable
                        ? '[ INSUFFICIENT ORE ]'
                        : '[ COMMENCE RESEARCH ]'}
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
