import { PlanetColony } from '../types';
import { calculateColonyMaintenance as calculateEngineMaintenance } from '../engine/colonyEconomy';

export interface ColonyMaintenanceBreakdown {
  baseCost: number;
  levelMultiplier: number;
  homeworldDiscount: number;
  logisticalStrain: number;
  specializationModifier: number;
  taxPolicyModifier: number;
  totalMaintenanceCost: number;
  grossIncome: number;
  netIncome: number;
  profitMarginPercent: number;
  isDeficit: boolean;
  breakdownCategories: {
    administration: number;
    logistics: number;
    lifeSupport: number;
    security: number;
  };
}

export interface EmpireColonialSummary {
  totalColonies: number;
  totalColonyLevels: number;
  totalGrossIncome: number;
  totalMaintenanceCost: number;
  netColonialIncome: number;
  averageMaintenancePerLevel: number;
  expansionEfficiencyRating: 'Optimal' | 'Sustainable' | 'Strained' | 'Over-Extended';
  expansionEfficiencyPercent: number;
  expansionRecommendation: string;
}

/**
 * Calculates the exact maintenance cost for a single planetary colony
 * based on its tier level, homeworld status, tax policy, specialization,
 * and overall empire scale.
 */
export function calculateColonyMaintenance(colony: PlanetColony, totalColonies: number = 3): number {
  return calculateEngineMaintenance(colony, totalColonies).maintenance;
}

/**
 * Generates an in-depth maintenance breakdown and economic projection for a colony.
 */
export function getColonyMaintenanceDetails(colony: PlanetColony, totalColonies: number = 3): ColonyMaintenanceBreakdown {
  const maintenance = calculateEngineMaintenance(colony, totalColonies);
  const totalCost = maintenance.maintenance;
  const gross = colony.naquadahProductionRate ?? colony.incomeBonus ?? 0;
  const net = gross - totalCost;
  const margin = gross > 0 ? Math.round((net / gross) * 100) : 0;
  
  return {
    baseCost: colony.level * 2500 + Math.pow(colony.level, 1.45) * 850,
    levelMultiplier: colony.level || 1,
    homeworldDiscount: 1 - maintenance.modifiers.homeworld,
    logisticalStrain: maintenance.modifiers.logisticalStrain - 1,
    specializationModifier: maintenance.modifiers.specialization - 1,
    taxPolicyModifier: maintenance.modifiers.taxPolicy - 1,
    totalMaintenanceCost: totalCost,
    grossIncome: gross,
    netIncome: net,
    profitMarginPercent: margin,
    isDeficit: net < 0,
    breakdownCategories: {
      administration: Math.round(totalCost * 0.35),
      logistics: Math.round(totalCost * 0.25),
      lifeSupport: Math.round(totalCost * 0.20),
      security: Math.round(totalCost * 0.20),
    },
  };
}

/**
 * Calculates empire-wide colonial maintenance, aggregate revenue, and expansion efficiency.
 */
export function getEmpireColonialSummary(planets: PlanetColony[]): EmpireColonialSummary {
  const totalColonies = planets.length;
  let totalGross = 0;
  let totalMaintenance = 0;
  let totalLevels = 0;

  planets.forEach((p) => {
    totalGross += p.naquadahProductionRate ?? p.incomeBonus ?? 0;
    totalMaintenance += calculateColonyMaintenance(p, totalColonies);
    totalLevels += p.level || 1;
  });

  const netColonial = totalGross - totalMaintenance;
  const avgMaint = totalLevels > 0 ? Math.round(totalMaintenance / totalLevels) : 0;
  
  // Efficiency ratio: higher net income relative to gross income means higher efficiency
  const ratio = totalGross > 0 ? (netColonial / totalGross) : 0;
  const efficiencyPercent = Math.max(0, Math.min(100, Math.round(ratio * 100)));

  let rating: EmpireColonialSummary['expansionEfficiencyRating'] = 'Optimal';
  let recommendation = 'Your colonial holdings yield substantial net surpluses. Expansion capacity is healthy.';

  if (ratio < 0.25) {
    rating = 'Over-Extended';
    recommendation = 'CRITICAL OVER-EXPANSION: High colony levels are exhausting your treasury in logistical maintenance. Promote miners or adopt Extractive Tax Directives to prevent economic collapse.';
  } else if (ratio < 0.45) {
    rating = 'Strained';
    recommendation = 'Rapid expansion is generating substantial maintenance overhead. Focus on industrial workforce and mining infrastructure before upgrading further colony tiers.';
  } else if (ratio < 0.65) {
    rating = 'Sustainable';
    recommendation = 'Colonial maintenance is well-balanced against gross tribute. Maintain steady workforce growth to support additional world colonization.';
  }

  return {
    totalColonies,
    totalColonyLevels: totalLevels,
    totalGrossIncome: totalGross,
    totalMaintenanceCost: totalMaintenance,
    netColonialIncome: netColonial,
    averageMaintenancePerLevel: avgMaint,
    expansionEfficiencyRating: rating,
    expansionEfficiencyPercent: efficiencyPercent,
    expansionRecommendation: recommendation,
  };
}
