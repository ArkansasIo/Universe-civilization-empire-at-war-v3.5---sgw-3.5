import React from 'react';
import { Lock, BookOpen, ArrowLeft } from 'lucide-react';
import {
  COMMANDER_XP_PER_TURN,
  getCommanderLevelProgress,
  getRouteLevelLock,
  getRoutesUnlockedAtLevel,
  xpForCommanderLevel,
} from '../../game/levelLocks';
import { STORY_BEATS } from '../../game/storyCampaign';

interface LevelLockedPanelProps {
  route: string;
  commanderXp: number;
  onNavigate: (route: string) => void;
}

/** Shown in place of a screen whose commander level requirement is not met. */
export const LevelLockedPanel: React.FC<LevelLockedPanelProps> = ({ route, commanderXp, onNavigate }) => {
  const lock = getRouteLevelLock(route);
  const requiredLevel = lock?.level ?? 1;
  const progress = getCommanderLevelProgress(commanderXp);
  const requiredXp = xpForCommanderLevel(requiredLevel);
  const xpToGo = Math.max(0, requiredXp - progress.xp);
  const beat = STORY_BEATS.find((b) => b.level === requiredLevel);
  const opensTogether = getRoutesUnlockedAtLevel(requiredLevel).filter((entry) => entry.route !== route);

  return (
    <section id="level-locked-panel" role="alert" className="border-2 border-[#111111] bg-white p-6 sm:p-8 font-mono">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[#111111] text-amber-400">
          <Lock size={22} />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-[#777777] font-bold">
            Commander clearance required
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Locked — reach level {requiredLevel}
          </h1>
          <p className="mt-1 text-xs text-[#555555]">
            {lock?.label ?? route} opens at commander level {requiredLevel}. You are level {progress.level}.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-[10px] uppercase text-[#777777] font-bold">
          <span>{progress.xp.toLocaleString()} / {requiredXp.toLocaleString()} XP</span>
          <span>{xpToGo.toLocaleString()} XP to go</span>
        </div>
        <div className="mt-1 h-2 bg-neutral-200">
          <div className="h-2 bg-amber-500" style={{ width: `${Math.min(100, (progress.xp / Math.max(1, requiredXp)) * 100)}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-[#555555]">
          Commander XP comes from settling turns ({COMMANDER_XP_PER_TURN} XP each) and from everything that earns glory:
          finishing buildings and research, winning battles and claiming missions.
        </p>
      </div>

      {beat && (
        <div className="mt-6 border-l-2 border-amber-500 bg-[#fafafa] p-3 text-xs text-[#333333]">
          <span className="text-[10px] uppercase font-bold text-amber-700">Story beat at level {requiredLevel}</span>
          <p className="font-bold text-[#111111]">{beat.title}</p>
          <p className="text-[#666666]">This chapter of the campaign is revealed when the screen unlocks.</p>
        </div>
      )}

      {opensTogether.length > 0 && (
        <p className="mt-4 text-[11px] text-[#555555]">
          <span className="font-bold uppercase text-[10px] text-[#777777]">Also opens at level {requiredLevel}: </span>
          {opensTogether.map((entry) => entry.label).join(', ')}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 border border-[#111111] px-4 py-2 text-xs font-bold uppercase hover:bg-[#111111] hover:text-white cursor-pointer"
        >
          <ArrowLeft size={14} /> Empire Overview
        </button>
        <button
          type="button"
          onClick={() => onNavigate('missions')}
          className="flex items-center gap-2 bg-[#111111] text-amber-400 px-4 py-2 text-xs font-bold uppercase hover:bg-black cursor-pointer"
        >
          <BookOpen size={14} /> Story & Missions
        </button>
      </div>
    </section>
  );
};
