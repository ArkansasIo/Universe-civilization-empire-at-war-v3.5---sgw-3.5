import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Building,
  Globe,
  Users,
  Pickaxe,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PlayerProfile, PlayerResources, PlanetColony } from '../../types';
import { RACES } from '../../gameData';
import {
  getEmpireColonialSummary,
  getColonyMaintenanceDetails,
  calculateColonyMaintenance,
} from '../../utils/colonyCalculations';

interface IncomeViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  naturalIncome: number;
  planets?: PlanetColony[];
  onNavigate?: (route: string) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  profile,
  resources,
  naturalIncome,
  planets = [],
  onNavigate,
}) => {
  const currentRace = RACES.find((r) => r.id === profile.race);

  // Exact formula terms
  const untrainedYield = resources.untrainedUnits * 20;
  const workforceYield = (resources.miners + resources.lifers) * 80;

  // Empire colonial analytics
  const colonialSummary = getEmpireColonialSummary(planets);
  const grossColonyYield = colonialSummary.totalGrossIncome;
  const colonyMaintenanceTotal = colonialSummary.totalMaintenanceCost;
  const netColonyYield = colonialSummary.netColonialIncome;

  // Gross base subtotal before race & defcon modifiers
  const grossBaseSubtotal = untrainedYield + workforceYield + grossColonyYield;
  const netBaseSubtotal = Math.max(0, grossBaseSubtotal - colonyMaintenanceTotal);

  const raceMultiplier = currentRace?.incomeModifier || 1.0;
  const defconMultipliers: Record<number, number> = {
    0: 1.0,
    1: 0.9,
    2: 0.8,
    3: 0.6,
    4: 0.3,
  };
  const defconMultiplier = defconMultipliers[profile.defconLevel] ?? 1.0;

  return (
    <div id="income-view" className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          ECONOMIC PROJECTIONS · EMPIRE FISCAL LEDGER
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#111111]">Income Model & Colonial Upkeep Calculations</h2>
            <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
              Natural income is generated automatically every 30-minute turn cycle. Untrained population provides basic trade tax, miners extract ore, and colonies generate tribute minus compounding <strong>Planetary Maintenance Costs</strong> per colony level.
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('planet-list')}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Globe size={14} />
              <span>Manage Colonies →</span>
            </button>
          )}
        </div>
      </div>

      {/* Net Income Headline Tile */}
      <div className="border border-[#dedede] bg-[#fafafa] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
            Total Net Natural Income per Turn Cycle
          </span>
          <strong className="block text-3xl sm:text-4xl font-mono font-bold text-[#111111] mt-1">
            +{naturalIncome.toLocaleString()} Naquadah
          </strong>
          <small className="text-xs text-[#666666] block mt-1 font-mono">
            Calculated across 48 turns/day = ~{(naturalIncome * 48).toLocaleString()} Naquadah daily net output
          </small>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border border-[#dedede] bg-white p-3.5 text-xs">
            <span className="text-[10px] font-bold text-[#777777] uppercase block">Gross Colonial Output:</span>
            <strong className="font-mono text-emerald-700 text-sm block mt-0.5">
              +{grossColonyYield.toLocaleString()} NQ
            </strong>
            <small className="text-[10px] text-[#888888]">{planets.length} Colonized Worlds</small>
          </div>

          <div className="border border-rose-200 bg-rose-50/50 p-3.5 text-xs">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">Colony Maintenance:</span>
            <strong className="font-mono text-rose-700 text-sm block mt-0.5">
              -{colonyMaintenanceTotal.toLocaleString()} NQ
            </strong>
            <small className="text-[10px] text-rose-900/70">{colonialSummary.totalColonyLevels} Total Colony Levels</small>
          </div>

          <div className="border border-[#dedede] bg-white p-3.5 text-xs">
            <span className="text-[10px] font-bold text-[#777777] uppercase block">Colonial Net Yield:</span>
            <strong className="font-mono text-[#111111] text-sm block mt-0.5">
              {netColonyYield >= 0 ? `+${netColonyYield.toLocaleString()}` : `${netColonyYield.toLocaleString()}`} NQ
            </strong>
            <small className="text-[10px] text-[#888888]">
              {colonialSummary.expansionEfficiencyPercent}% Retention
            </small>
          </div>
        </div>
      </div>

      {/* Strategic Expansion Trade-off Advisory Box */}
      <div className={`p-5 border ${
        colonialSummary.expansionEfficiencyRating === 'Optimal'
          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
          : colonialSummary.expansionEfficiencyRating === 'Sustainable'
          ? 'bg-blue-50/60 border-blue-300 text-blue-900'
          : colonialSummary.expansionEfficiencyRating === 'Strained'
          ? 'bg-amber-50/60 border-amber-300 text-amber-900'
          : 'bg-rose-50/70 border-rose-300 text-rose-900'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/80 rounded-none border border-current shrink-0 mt-0.5">
            {colonialSummary.expansionEfficiencyRating === 'Optimal' || colonialSummary.expansionEfficiencyRating === 'Sustainable' ? (
              <CheckCircle2 className="w-5 h-5 text-current" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-current" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm uppercase tracking-wide">
                Expansion Efficiency Rating: {colonialSummary.expansionEfficiencyRating} ({colonialSummary.expansionEfficiencyPercent}% Net Yield Margin)
              </h4>
              <span className="px-2 py-0.5 bg-black/10 text-[10px] font-mono font-bold uppercase">
                {colonialSummary.expansionEfficiencyRating}
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {colonialSummary.expansionRecommendation}
            </p>
            <p className="text-[11px] font-mono pt-1 opacity-75">
              ⚖️ Strategic Rule: Each colony tier level adds +6,500 Gross Output but incurs base +2,500 to +4,500 logistical overhead. Unchecked rapid colonization without sufficient industrial workforce will drag overall turn income down into deficit.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Breakdown Table */}
      <div className="border border-[#dedede] bg-white p-6">
        <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider border-b border-[#eeeeee] pb-3 mb-4 flex items-center justify-between">
          <span>Natural Revenue & Maintenance Components</span>
          <span className="text-[10px] font-mono text-[#777777] font-normal">Formula: [Untrained + Workforce + (Colony Gross - Maintenance)] × Race × DefCon</span>
        </h3>

        <div className="divide-y divide-[#eeeeee] text-xs">
          {/* Untrained Pop */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-[#666666]" />
              <div>
                <strong className="text-[#111111] block">Untrained Population Yield</strong>
                <small className="text-[#777777]">{resources.untrainedUnits.toLocaleString()} units × 20 Naquadah / turn</small>
              </div>
            </div>
            <span className="font-mono font-bold text-[#111111]">+{untrainedYield.toLocaleString()} NQ</span>
          </div>

          {/* Workforce */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Pickaxe size={16} className="text-[#666666]" />
              <div>
                <strong className="text-[#111111] block">Industrial Workforce (Miners & Lifers)</strong>
                <small className="text-[#777777]">
                  {(resources.miners + resources.lifers).toLocaleString()} miners × 80 Naquadah / turn
                </small>
              </div>
            </div>
            <span className="font-mono font-bold text-[#111111]">+{workforceYield.toLocaleString()} NQ</span>
          </div>

          {/* Gross Colony Output */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe size={16} className="text-emerald-700" />
              <div>
                <strong className="text-[#111111] block">Gross Off-World Colony Output</strong>
                <small className="text-[#777777]">
                  Sum of gross tribute across {planets.length} colonized worlds ({colonialSummary.totalColonyLevels} total tiers)
                </small>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-700">+{grossColonyYield.toLocaleString()} NQ</span>
          </div>

          {/* Colony Maintenance Cost Deduction */}
          <div className="py-3 flex items-center justify-between bg-rose-50/40 -mx-6 px-6">
            <div className="flex items-center gap-2.5">
              <Building size={16} className="text-rose-700" />
              <div>
                <strong className="text-rose-900 block">Planetary Maintenance & Logistical Overhead</strong>
                <small className="text-rose-800/80">
                  Compounding civil administration, life support, power loads, and supply lines per colony level
                </small>
              </div>
            </div>
            <span className="font-mono font-bold text-rose-700">-{colonyMaintenanceTotal.toLocaleString()} NQ</span>
          </div>

          {/* Base Subtotal */}
          <div className="py-3 flex items-center justify-between bg-[#fafafa] -mx-6 px-6 font-bold">
            <span className="text-[#111111]">Net Natural Base Subtotal</span>
            <span className="font-mono text-[#111111]">{netBaseSubtotal.toLocaleString()} Naquadah</span>
          </div>

          {/* Race Mod */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <strong className="text-[#111111] block">Race Biology & Faction Modifier ({currentRace?.name})</strong>
              <small className="text-[#777777]">{currentRace?.bonusLabel}</small>
            </div>
            <span className="font-mono text-[#111111]">×{raceMultiplier.toFixed(3)}</span>
          </div>

          {/* DefCon */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <strong className="text-[#111111] block">DefCon Alert Readiness Penalty</strong>
              <small className="text-[#777777]">
                {profile.defconLevel === 0 ? 'DefCon 0: Zero economic diversion' : `DefCon ${profile.defconLevel}: Increased military mobilization tax`}
              </small>
            </div>
            <span className="font-mono text-[#111111]">×{defconMultiplier.toFixed(2)}</span>
          </div>

          {/* Final Net Turn Output */}
          <div className="py-3.5 flex items-center justify-between bg-[#111111] text-white -mx-6 px-6 font-bold text-sm">
            <span>Net Natural Income per Turn</span>
            <span className="font-mono">+{naturalIncome.toLocaleString()} Naquadah</span>
          </div>
        </div>
      </div>

      {/* Per-Colony Maintenance & Revenue Ledger Table */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#eeeeee] pb-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Colony Maintenance & Profitability Breakdown
            </h3>
            <p className="text-xs text-[#666666]">
              Detailed individual fiscal balance sheet for all {planets.length} colonial holdings.
            </p>
          </div>
          <span className="text-xs font-mono text-[#777777]">
            Avg Upkeep / Tier: <strong>~{colonialSummary.averageMaintenancePerLevel.toLocaleString()} NQ</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#dedede] bg-[#fafafa] text-[#777777] uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">World / Coordinate</th>
                <th className="py-2.5 px-3">Colony Tier</th>
                <th className="py-2.5 px-3">Directive / Spec</th>
                <th className="py-2.5 px-3 text-right">Gross Tribute</th>
                <th className="py-2.5 px-3 text-right">Maintenance Cost</th>
                <th className="py-2.5 px-3 text-right">Net Contribution</th>
                <th className="py-2.5 px-3 text-center">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeee] font-mono">
              {planets.map((p) => {
                const details = getColonyMaintenanceDetails(p, planets.length);
                return (
                  <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        {p.isHomeworld && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">
                            👑 Capital
                          </span>
                        )}
                        <strong className="text-[#111111] block">{p.name}</strong>
                      </div>
                      <span className="text-[11px] text-[#777777] font-mono">[{p.coordinate}] · {p.biome}</span>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 bg-[#111111] text-white font-mono font-bold text-[11px]">
                        Tier {p.level}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-sans text-[#666666]">
                      <span className="capitalize font-semibold text-[#111111] block">
                        {p.specialization || 'Homeworld'}
                      </span>
                      <small className="text-[10px] text-[#777777] capitalize">
                        Tax: {p.taxPolicy || 'balanced'}
                      </small>
                    </td>

                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                      +{details.grossIncome.toLocaleString()} NQ
                    </td>

                    <td className="py-3 px-3 text-right text-rose-700 font-bold">
                      -{details.totalMaintenanceCost.toLocaleString()} NQ
                    </td>

                    <td className={`py-3 px-3 text-right font-bold ${details.netIncome >= 0 ? 'text-[#111111]' : 'text-rose-700'}`}>
                      {details.netIncome >= 0 ? `+${details.netIncome.toLocaleString()}` : `${details.netIncome.toLocaleString()}`} NQ
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 font-bold text-[10px] ${
                        details.profitMarginPercent >= 50
                          ? 'bg-emerald-100 text-emerald-800'
                          : details.profitMarginPercent >= 20
                          ? 'bg-blue-100 text-blue-800'
                          : details.profitMarginPercent >= 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {details.profitMarginPercent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#111111] bg-[#fafafa] font-bold font-mono">
                <td colSpan={3} className="py-3 px-3 font-sans text-xs text-[#111111]">
                  Total Colonial Ledger Summary ({planets.length} Worlds)
                </td>
                <td className="py-3 px-3 text-right text-emerald-700">
                  +{grossColonyYield.toLocaleString()} NQ
                </td>
                <td className="py-3 px-3 text-right text-rose-700">
                  -{colonyMaintenanceTotal.toLocaleString()} NQ
                </td>
                <td className="py-3 px-3 text-right text-[#111111]">
                  +{netColonyYield.toLocaleString()} NQ
                </td>
                <td className="py-3 px-3 text-center text-xs">
                  {colonialSummary.expansionEfficiencyPercent}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
