import React, { useState } from 'react';
import { BookOpen, Lock, Play } from 'lucide-react';
import { getCommanderLevelProgress } from '../../game/levelLocks';
import {
  STORY_CHAPTERS,
  getNextStoryBeat,
  getStoryBeatUnlocks,
  getStoryBeatsForChapter,
  type StoryBeat,
} from '../../game/storyCampaign';
import { StoryBeatModal } from './StoryBeatModal';

interface StoryLogPanelProps {
  commanderXp: number;
  isAdmin?: boolean;
  onNavigate: (route: string) => void;
}

/** Commander story log for the Missions screen: revealed beats can be replayed, locked ones show their level. */
export const StoryLogPanel: React.FC<StoryLogPanelProps> = ({ commanderXp, isAdmin = false, onNavigate }) => {
  const [openBeat, setOpenBeat] = useState<StoryBeat | null>(null);
  const progress = getCommanderLevelProgress(commanderXp);
  const nextBeat = getNextStoryBeat(progress.level);

  return (
    <div id="story-log-panel" className="space-y-4 font-mono">
      <div className="p-5 bg-white border border-[#dedede] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#777777] font-bold">
            <BookOpen className="w-4 h-4 text-[#111111]" /> Commander campaign
          </div>
          <h2 className="text-xl font-bold text-[#111111]">The Long Dawn</h2>
          <p className="text-xs text-[#555555] mt-1">
            Each commander level milestone opens new screens and reveals the next part of the story.
          </p>
        </div>
        <div className="min-w-[220px]">
          <div className="flex justify-between text-[10px] uppercase font-bold text-[#777777]">
            <span>Commander level {progress.level}</span>
            <span>{progress.nextLevelXp === null ? 'Max' : `${progress.xp.toLocaleString()} / ${progress.nextLevelXp.toLocaleString()} XP`}</span>
          </div>
          <div className="mt-1 h-2 bg-neutral-200">
            <div className="h-2 bg-amber-500" style={{ width: `${Math.round(progress.fraction * 100)}%` }} />
          </div>
          {nextBeat && (
            <p className="mt-1 text-[10px] text-[#666666]">Next beat at level {nextBeat.level}: {nextBeat.title}</p>
          )}
        </div>
      </div>

      {STORY_CHAPTERS.map((chapter) => {
        const beats = getStoryBeatsForChapter(chapter.id);
        const chapterOpen = isAdmin || beats.some((beat) => beat.level <= progress.level);
        return (
          <section key={chapter.id} className="bg-white border border-[#dedede]">
            <header className={`px-5 py-3 border-b border-[#eeeeee] ${chapterOpen ? '' : 'opacity-60'}`}>
              <span className="text-[10px] uppercase font-bold text-amber-700">Chapter {chapter.number}</span>
              <h3 className="text-base font-bold text-[#111111]">{chapter.title}</h3>
              <p className="text-[11px] text-[#666666]">{chapterOpen ? chapter.synopsis : `Begins at commander level ${beats[0]?.level}.`}</p>
            </header>
            <ul className="divide-y divide-[#f0f0f0]">
              {beats.map((beat) => {
                const revealed = isAdmin || beat.level <= progress.level;
                const unlockCount = getStoryBeatUnlocks(beat).length;
                return (
                  <li key={beat.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#888888]">Level {beat.level}</span>
                      <p className={`text-sm font-bold truncate ${revealed ? 'text-[#111111]' : 'text-[#aaaaaa]'}`}>
                        {revealed ? beat.title : 'Classified'}
                      </p>
                      <p className="text-[11px] text-[#777777]">
                        {unlockCount} screen{unlockCount === 1 ? '' : 's'} {revealed ? 'unlocked' : 'unlock'} at this beat
                      </p>
                    </div>
                    {revealed ? (
                      <button
                        type="button"
                        onClick={() => setOpenBeat(beat)}
                        className="shrink-0 flex items-center gap-1.5 border border-[#111111] px-3 py-1.5 text-[11px] font-bold uppercase hover:bg-[#111111] hover:text-white cursor-pointer"
                      >
                        <Play size={12} /> Read
                      </button>
                    ) : (
                      <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase text-[#999999] border border-dashed border-[#cccccc]">
                        <Lock size={12} /> Lv {beat.level}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {openBeat && <StoryBeatModal beat={openBeat} onClose={() => setOpenBeat(null)} onNavigate={onNavigate} />}
    </div>
  );
};
