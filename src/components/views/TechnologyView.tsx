import React, { useState } from 'react';
import { Cpu, Zap, Shield, Eye, ShieldCheck } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources, Technology } from '../../types';

interface TechnologyViewProps {
  resources: PlayerResources;
  technologies: Technology[];
  activeBranchFilter?: string;
  onUpgradeTech: (techId: string) => { success: boolean; message: string };
}

export const TechnologyView: React.FC<TechnologyViewProps> = ({
  resources,
  technologies,
  activeBranchFilter,
  onUpgradeTech,
}) => {
  const [filter, setFilter] = useState<string>(activeBranchFilter || 'all');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (activeBranchFilter) {
      setFilter(activeBranchFilter);
    }
  }, [activeBranchFilter]);

  const filteredTechs = technologies.filter((t) => {
    if (filter === 'all') return true;
    return t.category === filter;
  });

  const handleUpgrade = (tech: Technology) => {
    const res = onUpgradeTech(tech.id);
    if (res.success) {
      sound.play('research');
      setNotice({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setNotice({ type: 'error', text: res.message });
    }
  };

  const getUpgradeCost = (t: Technology) => {
    return Math.round(t.baseCost * Math.pow(t.costGrowth, t.level));
  };

  return (
    <div id="technology-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          RESEARCH LABORATORIES · SCIENTIFIC ADVANCEMENT
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Galactic Technology Archive</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
          Upgrade plasma weaponry, phase shielding, tachyon recon suites, and cloaking generators. Each
          level compounds your operational combat potency across the galaxy.
        </p>
      </div>

      {notice && (
        <div
          className={`p-4 border text-xs font-semibold flex justify-between items-center ${
            notice.type === 'success'
              ? 'bg-[#fafafa] border-[#111111] text-[#111111] border-l-4'
              : 'bg-[#fff5f5] border-[#dc2626] text-[#dc2626] border-l-4'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex border-b border-[#dedede] bg-white px-4">
        {[
          { id: 'all', label: 'All Technologies' },
          { id: 'offense', label: 'Offensive Systems' },
          { id: 'defense', label: 'Defensive Shields' },
          { id: 'covert', label: 'Covert Infiltration' },
          { id: 'anti-covert', label: 'Counter-Espionage' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sound.play('click');
              setFilter(tab.id);
            }}
            className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 ${
              filter === tab.id
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tech Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTechs.map((tech) => {
          const cost = getUpgradeCost(tech);
          const canAfford = resources.naquadah >= cost;

          return (
            <div key={tech.id} className="border border-[#dedede] bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                      {tech.category} discipline
                    </span>
                    <h3 className="text-base font-bold text-[#111111]">{tech.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-[#111111] text-white font-mono text-xs font-bold">
                    Level {tech.level}
                  </span>
                </div>

                <p className="text-xs text-[#666666] mb-4 leading-relaxed">{tech.description}</p>

                <div className="border border-[#eeeeee] bg-[#fafafa] p-3 text-xs space-y-1 mb-5">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Current Multiplier:</span>
                    <b className="font-mono text-[#111111]">×{(1 + tech.level * 0.15).toFixed(2)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Next Level Multiplier:</span>
                    <b className="font-mono text-[#111111]">×{(1 + (tech.level + 1) * 0.15).toFixed(2)}</b>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#eeeeee]">
                <span className="text-xs text-[#666666]">
                  Cost:{' '}
                  <b className="font-mono text-[#111111] font-bold">{cost.toLocaleString()} Naquadah</b>
                </span>
                <button
                  type="button"
                  onClick={() => handleUpgrade(tech)}
                  disabled={!canAfford}
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Upgrade to Level {tech.level + 1} →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
