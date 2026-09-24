import React, { useState } from 'react';
import {
  Skull,
  Shield,
  Zap,
  Target,
  Swords,
  Crown,
  Eye,
  AlertTriangle,
  Award,
  Sparkles,
  Flame,
  History,
  TrendingUp,
  DollarSign,
  UserCheck,
  UserX,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Crosshair,
  Feather,
} from 'lucide-react';
import {
  NemesisRival,
  NemesisTrait,
  PlayerResources,
  PlayerProfile,
  VendettaMission,
} from '../../types';
import { sound } from '../../sound';
import {
  INITIAL_NEMESIS_HIERARCHY,
  INITIAL_VENDETTA_MISSIONS,
  generateRandomNemesis,
  NEMESIS_WEAKNESSES_POOL,
  NEMESIS_STRENGTHS_POOL,
} from '../../data/nemesisData';

interface NemesisSystemViewProps {
  resources: PlayerResources;
  onUpdateResources: (updates: Partial<PlayerResources>) => void;
  profile: PlayerProfile;
  onUpdateProfile?: (updates: Partial<PlayerProfile>) => void;
  onNavigate?: (route: string) => void;
}

export function NemesisSystemView({
  resources,
  onUpdateResources,
  profile,
  onUpdateProfile,
  onNavigate,
}: NemesisSystemViewProps) {
  // Persistence state
  const loadNemesis = (): NemesisRival[] => {
    try {
      const saved = localStorage.getItem('uc_state_nemesis_hierarchy');
      return saved ? JSON.parse(saved) : INITIAL_NEMESIS_HIERARCHY;
    } catch {
      return INITIAL_NEMESIS_HIERARCHY;
    }
  };

  const loadVendettas = (): VendettaMission[] => {
    try {
      const saved = localStorage.getItem('uc_state_vendetta_missions');
      return saved ? JSON.parse(saved) : INITIAL_VENDETTA_MISSIONS;
    } catch {
      return INITIAL_VENDETTA_MISSIONS;
    }
  };

  const [rivals, setRivals] = useState<NemesisRival[]>(loadNemesis);
  const [vendettas, setVendettas] = useState<VendettaMission[]>(loadVendettas);
  const [selectedRivalId, setSelectedRivalId] = useState<string>('nemesis-1');
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'vendettas' | 'grudges'>('hierarchy');

  // Duel / Battle Simulation state
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [battleRival, setBattleRival] = useState<NemesisRival | null>(null);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [rivalHp, setRivalHp] = useState<number>(100);
  const [battleRound, setBattleRound] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleFinished, setBattleFinished] = useState<boolean>(false);
  const [battleOutcome, setBattleOutcome] = useState<'victory' | 'defeat' | 'fled' | null>(null);

  // Notification / Alert message
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const saveRivals = (updated: NemesisRival[]) => {
    setRivals(updated);
    try {
      localStorage.setItem('uc_state_nemesis_hierarchy', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const saveVendettas = (updated: VendettaMission[]) => {
    setVendettas(updated);
    try {
      localStorage.setItem('uc_state_vendetta_missions', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const selectedRival = rivals.find((r) => r.id === selectedRivalId) || rivals[0];

  const overlord = rivals.find((r) => r.rankTier === 'overlord');
  const warlords = rivals.filter((r) => r.rankTier === 'warlord');
  const captains = rivals.filter((r) => r.rankTier === 'captain');
  const enforcers = rivals.filter((r) => r.rankTier === 'enforcer');

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // DYNAMIC HIERARCHY MUTINY / PROMOTION LOGIC
  // -------------------------------------------------------------
  const handlePromoteHierarchy = (defeatedId: string) => {
    const updated = [...rivals];
    const defIndex = updated.findIndex((r) => r.id === defeatedId);
    if (defIndex === -1) return;

    const defRival = updated[defIndex];
    // Find subordinate rivals who can be promoted
    let lowerTier: 'warlord' | 'captain' | 'enforcer' | null = null;
    if (defRival.rankTier === 'overlord') lowerTier = 'warlord';
    else if (defRival.rankTier === 'warlord') lowerTier = 'captain';
    else if (defRival.rankTier === 'captain') lowerTier = 'enforcer';

    let promoter = updated.find(
      (r) => lowerTier && r.rankTier === lowerTier && r.id !== defeatedId && !r.vassalOfPlayer
    );

    if (promoter) {
      promoter.rankTier = defRival.rankTier;
      promoter.hierarchyPosition = defRival.hierarchyPosition;
      promoter.level += 5;
      promoter.power = Math.floor(promoter.power * 1.3);
      promoter.history.unshift({
        id: `mem-${Date.now()}`,
        timestamp: new Date().toLocaleDateString(),
        eventType: 'promoted',
        text: `Promoted to ${defRival.rankTier.toUpperCase()} following the defeat of ${defRival.name}!`,
        powerImpact: 2000,
      });

      // Generate a fresh recruit for the vacated lower slot
      const freshRecruit = generateRandomNemesis(12, lowerTier || 'enforcer');
      updated.push(freshRecruit);
      triggerAlert(`🔥 Hierarchy Shakeup! ${promoter.name} promoted to ${defRival.rankTier.toUpperCase()}!`);
    } else {
      // Generate replacement
      const replacement = generateRandomNemesis(defRival.hierarchyPosition, defRival.rankTier);
      updated[defIndex] = replacement;
      triggerAlert(`⚡ New Warlord Emerges! ${replacement.name} seized command as ${defRival.rankTier.toUpperCase()}!`);
    }

    saveRivals(updated);
  };

  // -------------------------------------------------------------
  // ACTION: Bribe / Demand Tribute / Force Vassalage
  // -------------------------------------------------------------
  const handleForceVassalage = (rival: NemesisRival) => {
    sound.play('click');
    if (rival.vassalOfPlayer) {
      triggerAlert(`${rival.name} is already your loyal vassal!`);
      return;
    }

    const costNaquadah = rival.power * 100;
    if (resources.naquadah < costNaquadah) {
      sound.play('warning');
      triggerAlert(`Insufficient Naquadah! Subjugating ${rival.name} requires ${costNaquadah.toLocaleString()} NQ.`);
      return;
    }

    onUpdateResources({ naquadah: resources.naquadah - costNaquadah });

    const updated = rivals.map((r) => {
      if (r.id === rival.id) {
        return {
          ...r,
          vassalOfPlayer: true,
          history: [
            {
              id: `mem-${Date.now()}`,
              timestamp: new Date().toLocaleDateString(),
              eventType: 'tribute' as const,
              text: `Subjugated by Commander ${profile.username}! Now pays regular Naquadah tribute.`,
              powerImpact: -1000,
            },
            ...r.history,
          ],
        };
      }
      return r;
    });

    sound.play('confirm');
    saveRivals(updated);
    triggerAlert(`🤝 Vassalage Secured! ${rival.name} has sworn fealty and will pay tribute!`);
  };

  // -------------------------------------------------------------
  // ACTION: Infiltrate & Spy
  // -------------------------------------------------------------
  const handleInfiltrateSpy = (rival: NemesisRival) => {
    sound.play('click');
    const spyCost = 100000;
    if (resources.naquadah < spyCost) {
      sound.play('warning');
      triggerAlert(`Requires 100,000 Naquadah to launch deep subspace espionage.`);
      return;
    }

    onUpdateResources({ naquadah: resources.naquadah - spyCost });

    // Expose hidden trait or reveal weakness
    const unrevealedWeakness = NEMESIS_WEAKNESSES_POOL.find(
      (w) => !rival.weaknesses.some((rw) => rw.id === w.id)
    );

    const updated = rivals.map((r) => {
      if (r.id === rival.id) {
        const newWeaknesses = unrevealedWeakness
          ? [...r.weaknesses, unrevealedWeakness]
          : r.weaknesses;
        return {
          ...r,
          weaknesses: newWeaknesses,
          history: [
            {
              id: `mem-${Date.now()}`,
              timestamp: new Date().toLocaleDateString(),
              eventType: 'spied' as const,
              text: `Deep cover operative exposed tactical weaknesses in flagship systems.`,
              powerImpact: -500,
            },
            ...r.history,
          ],
        };
      }
      return r;
    });

    sound.play('confirm');
    saveRivals(updated);
    triggerAlert(`🕵️ Espionage Success! Uncovered vital weaknesses in ${rival.name}'s flagship!`);
  };

  // -------------------------------------------------------------
  // ACTION: Start Tactical Duel / Fleet Battle
  // -------------------------------------------------------------
  const handleStartBattle = (rival: NemesisRival) => {
    sound.play('combat');
    setBattleRival(rival);
    setPlayerHp(100);
    setRivalHp(rival.health);
    setBattleRound(1);
    setBattleLog([
      `⚔️ ENGAGING RIVAL WARLORD: ${rival.name} (${rival.title})`,
      `📢 ${rival.name}: "${rival.taunts.greeting}"`,
      `Tactical systems locked. Select your opening maneuver below.`,
    ]);
    setBattleFinished(false);
    setBattleOutcome(null);
    setInBattle(true);
  };

  // Battle Action Executions
  const handleExecuteBattleTurn = (
    move: 'all_out' | 'target_weakness' | 'shield_overcharge' | 'orbital_strike' | 'retreat'
  ) => {
    if (!battleRival || battleFinished) return;

    sound.play('click');
    const nextRound = battleRound + 1;

    if (move === 'retreat') {
      sound.play('warning');
      setBattleFinished(true);
      setBattleOutcome('fled');
      setBattleLog((prev) => [
        ...prev,
        `🚀 Emergency Hyperjump Initiated! Your fleet disengaged and fled from combat.`,
        `📢 ${battleRival.name}: "${battleRival.taunts.retreat}"`,
      ]);

      // Update history: player fled
      const updatedRivals = rivals.map((r) => {
        if (r.id === battleRival.id) {
          return {
            ...r,
            power: r.power + 500,
            history: [
              {
                id: `mem-${Date.now()}`,
                timestamp: new Date().toLocaleDateString(),
                eventType: 'player_victory' as const, // rival victory over player
                text: `Forced Commander ${profile.username} to flee the battlefield in disgrace.`,
                powerImpact: 500,
              },
              ...r.history,
            ],
          };
        }
        return r;
      });
      saveRivals(updatedRivals);
      return;
    }

    let pDamage = Math.floor(Math.random() * 20 + 15);
    let rDamageToPlayer = Math.floor((battleRival.power / 800) * (Math.random() * 15 + 10));

    let turnLog: string[] = [];

    // Calculate move modifiers
    if (move === 'all_out') {
      pDamage = Math.floor(pDamage * 1.5);
      rDamageToPlayer = Math.floor(rDamageToPlayer * 1.2);
      turnLog.push(`💥 Round ${battleRound}: Launching Heavy All-Out Plasma Salvo! (-${pDamage}% Rival HP)`);
    } else if (move === 'target_weakness') {
      const hasWeakness = battleRival.weaknesses.length > 0;
      if (hasWeakness) {
        const weak = battleRival.weaknesses[0];
        pDamage = Math.floor(pDamage * 2.2);
        turnLog.push(`🎯 Round ${battleRound}: Exploited Weakness [${weak.name}]! Crushing damage! (-${pDamage}% Rival HP)`);
      } else {
        pDamage = Math.floor(pDamage * 1.1);
        turnLog.push(`🎯 Round ${battleRound}: Targeted command node. (-${pDamage}% Rival HP)`);
      }
    } else if (move === 'shield_overcharge') {
      pDamage = Math.floor(pDamage * 0.7);
      rDamageToPlayer = Math.floor(rDamageToPlayer * 0.3);
      turnLog.push(`🛡️ Round ${battleRound}: Overcharged Deflector Shields! Reduced incoming damage. (-${pDamage}% Rival HP)`);
    } else if (move === 'orbital_strike') {
      if (resources.energy >= 50) {
        onUpdateResources({ energy: resources.energy - 50 });
        pDamage = Math.floor(pDamage * 2.5);
        turnLog.push(`⚡ Round ${battleRound}: Fired Planetary Ion Cannon Satellite! (-${pDamage}% Rival HP)`);
      } else {
        turnLog.push(`⚠️ Insufficient Power Grid Energy! Orbital Cannon missed focus!`);
      }
    }

    // Rival Strength activations
    if (battleRival.strengths.some((s) => s.id === 's-plasma-shield')) {
      pDamage = Math.floor(pDamage * 0.7);
      turnLog.push(`🛡️ ${battleRival.name}'s Overcharged Plasma Shield absorbed 30% of your strike!`);
    }

    if (battleRival.strengths.some((s) => s.id === 's-cybernetic-regen') && rivalHp < 50) {
      const regen = 8;
      turnLog.push(`🤖 ${battleRival.name}'s Cybernetic Nano-Regen restored +${regen}% Hull!`);
    }

    turnLog.push(`⚔️ ${battleRival.name} returned fire with dreadnought batteries! (-${rDamageToPlayer}% Shield/Hull)`);

    const newRivalHp = Math.max(0, rivalHp - pDamage);
    const newPlayerHp = Math.max(0, playerHp - rDamageToPlayer);

    setRivalHp(newRivalHp);
    setPlayerHp(newPlayerHp);
    setBattleRound(nextRound);
    setBattleLog((prev) => [...prev, ...turnLog]);

    // Check Victory / Defeat
    if (newRivalHp <= 0) {
      sound.play('success');
      setBattleFinished(true);
      setBattleOutcome('victory');

      const rewardNq = battleRival.bounty.rewardNaquadah || 1000000;
      const rewardMetal = battleRival.bounty.rewardMetal || 500000;
      const rewardGlory = battleRival.bounty.rewardGlory || 300;
      const rewardDM = battleRival.bounty.rewardDarkMatter || 100;

      onUpdateResources({
        naquadah: resources.naquadah + rewardNq,
        metal: resources.metal + rewardMetal,
        darkMatter: (resources.darkMatter || 0) + rewardDM,
      });

      if (onUpdateProfile) {
        onUpdateProfile({ glory: profile.glory + rewardGlory });
      }

      setBattleLog((prev) => [
        ...prev,
        `🎉 VICTORY! You annihilated ${battleRival.name}'s flagship!`,
        `📢 ${battleRival.name}: "${battleRival.taunts.death}"`,
        `💰 Rewards Claimed: +${rewardNq.toLocaleString()} NQ, +${rewardMetal.toLocaleString()} Metal, +${rewardGlory} Glory, +${rewardDM} Dark Matter.`,
      ]);

      // Complete associated vendettas
      const updatedVendettas = vendettas.map((v) =>
        v.nemesisId === battleRival.id ? { ...v, status: 'completed' as const } : v
      );
      saveVendettas(updatedVendettas);

      // Trigger hierarchy promotion / mutiny
      handlePromoteHierarchy(battleRival.id);
    } else if (newPlayerHp <= 0) {
      sound.play('warning');
      setBattleFinished(true);
      setBattleOutcome('defeat');

      setBattleLog((prev) => [
        ...prev,
        `☠️ CRITICAL DEFEAT! Your fleet was overwhelmed by ${battleRival.name}.`,
        `📢 ${battleRival.name}: "${battleRival.taunts.defeatPlayer}"`,
      ]);

      // Update rival stats (level up rival)
      const updatedRivals = rivals.map((r) => {
        if (r.id === battleRival.id) {
          return {
            ...r,
            level: r.level + 3,
            power: Math.floor(r.power * 1.25),
            killsOnPlayer: r.killsOnPlayer + 1,
            history: [
              {
                id: `mem-${Date.now()}`,
                timestamp: new Date().toLocaleDateString(),
                eventType: 'player_defeat' as const,
                text: `Defeated Commander ${profile.username} in high orbit combat and leveled up to Lvl ${r.level + 3}!`,
                powerImpact: 1500,
              },
              ...r.history,
            ],
          };
        }
        return r;
      });
      saveRivals(updatedRivals);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-lg text-red-400">
                <Skull className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                  Nemesis System & Rival Warlord Hierarchy
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono">
                    DYNAMIC VENDETTAS
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Procedural AI rival commanders that remember battles, promote through power struggles, gain cybernetic scars, and harbor vengeful grudges.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Supreme Overlord</span>
              <span className="text-sm font-bold text-red-400 flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                {overlord?.name || 'Vacant'}
              </span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Active Rivals</span>
              <span className="text-lg font-bold text-white font-mono">{rivals.length}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Active Vendettas</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {vendettas.filter((v) => v.status === 'active').length}
              </span>
            </div>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alertMessage && (
          <div className="mt-4 p-3 bg-red-950/90 border border-red-500/60 rounded-lg text-red-200 text-sm flex items-center gap-2 animate-fade-in font-medium">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {alertMessage}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('hierarchy');
          }}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'hierarchy'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          Command Hierarchy Tree
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('vendettas');
          }}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'vendettas'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          Active Vendettas & Bounties ({vendettas.filter((v) => v.status === 'active').length})
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('grudges');
          }}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'grudges'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Galactic Grudge Log
        </button>
      </div>

      {/* TAB 1: HIERARCHY TREE & SELECTED RIVAL DETAILS */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* HIERARCHY TREE COLUMNS (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* TIER 1: OVERLORD */}
            {overlord && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Tier I: Supreme Overlord
                </div>
                <div
                  onClick={() => {
                    sound.play('click');
                    setSelectedRivalId(overlord.id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRivalId === overlord.id
                      ? 'bg-red-950/60 border-red-500 shadow-xl shadow-red-950/50 ring-2 ring-red-500/50'
                      : 'bg-slate-900/90 border-slate-800 hover:border-red-500/50 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl p-2 bg-slate-950 rounded-lg border border-red-500/30">
                        {overlord.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{overlord.name}</h3>
                          {overlord.vassalOfPlayer && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                              VASSAL
                            </span>
                          )}
                          {overlord.bounty.active && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                              BOUNTY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-red-400 font-medium">{overlord.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{overlord.race}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">Lvl {overlord.level}</span>
                      <span className="text-sm font-bold text-red-400 font-mono">
                        {overlord.power.toLocaleString()} PWR
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TIER 2: WARLORDS */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
                <Swords className="w-4 h-4 text-amber-400" />
                Tier II: Fleet Warlords
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {warlords.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => {
                      sound.play('click');
                      setSelectedRivalId(w.id);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRivalId === w.id
                        ? 'bg-amber-950/60 border-amber-500 shadow-lg ring-2 ring-amber-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{w.avatar}</span>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white truncate">{w.name}</h4>
                        <span className="text-xs text-amber-400 block font-mono">Lvl {w.level} • {w.power.toLocaleString()} PWR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 3: CAPTAINS */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Tier III: System Captains
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {captains.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      sound.play('click');
                      setSelectedRivalId(c.id);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRivalId === c.id
                        ? 'bg-blue-950/60 border-blue-500 shadow-lg ring-2 ring-blue-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-blue-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.avatar}</span>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                        <span className="text-[11px] text-blue-400 block font-mono">{c.power.toLocaleString()} PWR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 4: ENFORCERS */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Tier IV: Enforcers & Recruits
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {enforcers.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      sound.play('click');
                      setSelectedRivalId(e.id);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRivalId === e.id
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-lg ring-2 ring-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{e.avatar}</span>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">{e.name}</h4>
                        <span className="text-[10px] text-emerald-400 block font-mono">{e.power.toLocaleString()} PWR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SELECTED RIVAL DETAILS PANEL (5 cols) */}
          <div className="lg:col-span-5">
            {selectedRival ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 sticky top-4 shadow-2xl">
                {/* Profile Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                      {selectedRival.avatar}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                        {selectedRival.rankTier}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">{selectedRival.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{selectedRival.title}</p>
                      <p className="text-xs text-slate-500">{selectedRival.race}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">Level {selectedRival.level}</span>
                    <span className="text-lg font-bold text-red-400 font-mono">
                      {selectedRival.power.toLocaleString()} PWR
                    </span>
                  </div>
                </div>

                {/* Voice Taunt Box */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs italic text-slate-300 flex items-start gap-2">
                  <Feather className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 not-italic block mb-0.5">Taunt / Message:</span>
                    "{selectedRival.taunts.greeting}"
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">
                      Strengths & Buffs
                    </span>
                    <div className="space-y-1">
                      {selectedRival.strengths.map((s) => (
                        <div
                          key={s.id}
                          className="p-2 bg-red-950/40 border border-red-900/50 rounded text-xs text-red-200"
                        >
                          <span className="font-bold text-red-400">{s.name}:</span> {s.effect}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      Known Weaknesses & Vulnerabilities
                    </span>
                    {selectedRival.weaknesses.length > 0 ? (
                      <div className="space-y-1">
                        {selectedRival.weaknesses.map((w) => (
                          <div
                            key={w.id}
                            className="p-2 bg-emerald-950/40 border border-emerald-900/50 rounded text-xs text-emerald-200"
                          >
                            <span className="font-bold text-emerald-400">{w.name}:</span> {w.effect}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No weaknesses currently exposed. Launch espionage to uncover.</p>
                    )}
                  </div>
                </div>

                {/* Scarring & Cybernetics */}
                {selectedRival.cyberneticsScars.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
                      Battle Scars & Augmentations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRival.cyberneticsScars.map((sc, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-800 rounded font-medium"
                        >
                          ⚡ {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Hub Buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => handleStartBattle(selectedRival)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" />
                    Engage Tactical Fleet Duel
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleInfiltrateSpy(selectedRival)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      Infiltrate (100k NQ)
                    </button>

                    <button
                      onClick={() => handleForceVassalage(selectedRival)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Subjugate Vassal
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                Select a commander from the hierarchy chart to view details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE VENDETTAS */}
      {activeTab === 'vendettas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendettas.map((v) => {
              const rival = rivals.find((r) => r.id === v.nemesisId);
              return (
                <div
                  key={v.id}
                  className={`p-5 rounded-xl border space-y-4 ${
                    v.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-900/50'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        {v.type.toUpperCase()}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{v.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{v.description}</p>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        v.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {v.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Reward details */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Naquadah</span>
                      <span className="font-mono font-bold text-amber-400">
                        +{v.reward.naquadah.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Metal</span>
                      <span className="font-mono font-bold text-slate-300">
                        +{v.reward.metal.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Glory</span>
                      <span className="font-mono font-bold text-purple-400">+{v.reward.glory}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Dark Matter</span>
                      <span className="font-mono font-bold text-cyan-400">+{v.reward.darkMatter}</span>
                    </div>
                  </div>

                  {v.status === 'active' && rival && (
                    <button
                      onClick={() => handleStartBattle(rival)}
                      className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Crosshair className="w-4 h-4" />
                      Execute Vendetta Strike against {rival.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GALACTIC GRUDGE LOG */}
      {activeTab === 'grudges' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-red-400" />
            Galactic Memory & Rivalry Logs
          </h3>

          <div className="space-y-2">
            {rivals
              .flatMap((r) => r.history.map((m) => ({ ...m, rivalName: r.name, avatar: r.avatar })))
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
              .map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{mem.avatar}</span>
                    <div>
                      <span className="font-bold text-white">{mem.rivalName}:</span>{' '}
                      <span className="text-slate-300">{mem.text}</span>
                    </div>
                  </div>

                  <span className="text-slate-500 font-mono shrink-0 ml-4">{mem.timestamp}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TACTICAL DUEL BATTLE MODAL */}
      {inBattle && battleRival && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-950 rounded-lg border border-red-500/40">
                  {battleRival.avatar}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Tactical Fleet Duel vs {battleRival.name}</h3>
                  <p className="text-xs text-red-400">{battleRival.title} • Level {battleRival.level}</p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                Round <span className="text-amber-400 text-sm font-bold">{battleRound}</span>
              </div>
            </div>

            {/* Health Bars */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {/* Player HP */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-blue-400">Player Fleet Shield/Hull</span>
                  <span className="text-white font-mono">{playerHp}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${playerHp}%` }}
                  />
                </div>
              </div>

              {/* Rival HP */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-red-400">{battleRival.name} Hull</span>
                  <span className="text-white font-mono">{rivalHp}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${rivalHp}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Battle Output Console */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-48 overflow-y-auto space-y-1 font-mono text-xs text-slate-300">
              {battleLog.map((log, i) => (
                <div key={i} className="py-0.5 border-b border-slate-900/50">
                  {log}
                </div>
              ))}
            </div>

            {/* Tactical Choices or Close */}
            {!battleFinished ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleExecuteBattleTurn('all_out')}
                  className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <Swords className="w-4 h-4" />
                  All-Out Barrage
                </button>

                <button
                  onClick={() => handleExecuteBattleTurn('target_weakness')}
                  className="p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <Target className="w-4 h-4" />
                  Target Weakness
                </button>

                <button
                  onClick={() => handleExecuteBattleTurn('shield_overcharge')}
                  className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Shield Overcharge
                </button>

                <button
                  onClick={() => handleExecuteBattleTurn('retreat')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  Tactical Retreat
                </button>
              </div>
            ) : (
              <button
                onClick={() => setInBattle(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all border border-slate-700"
              >
                Close Tactical Combat
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
