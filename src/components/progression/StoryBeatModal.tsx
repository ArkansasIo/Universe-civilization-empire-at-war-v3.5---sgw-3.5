import React from 'react';
import { Unlock, X, ChevronRight } from 'lucide-react';
import { getStoryBeatUnlocks, getStoryChapter, type StoryBeat } from '../../game/storyCampaign';

interface StoryBeatModalProps {
  beat: StoryBeat;
  /** Beats still waiting after this one (level-ups can reveal several at once). */
  remaining?: number;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

/** Story beat reveal, shown when a level-up opens new screens or when replayed from the story log. */
export const StoryBeatModal: React.FC<StoryBeatModalProps> = ({ beat, remaining = 0, onClose, onNavigate }) => {
  const chapter = getStoryChapter(beat.chapterId);
  const unlocks = getStoryBeatUnlocks(beat);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-beat-title"
    >
      <div id="story-beat-modal" className="max-w-2xl w-full my-auto bg-white border-2 border-[#111111] font-mono shadow-2xl">
        <div className="bg-[#111111] text-white px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
            Chapter {chapter?.number} · {chapter?.title} · Commander level {beat.level}
          </span>
          <button type="button" onClick={onClose} aria-label="Close story" className="text-white/70 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <h2 id="story-beat-title" className="text-2xl font-bold text-[#111111] tracking-tight">{beat.title}</h2>
          <p className="text-[10px] uppercase tracking-wider text-[#777777] font-bold">{beat.speaker}</p>
          <div className="space-y-3 text-sm leading-relaxed text-[#333333] font-sans">
            {beat.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {unlocks.length > 0 && (
            <div className="border border-[#dedede] bg-[#fafafa] p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-emerald-700">
                <Unlock size={12} /> Unlocked at level {beat.level}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {unlocks.map((entry) => (
                  <button
                    key={entry.route}
                    type="button"
                    disabled={!onNavigate}
                    onClick={() => {
                      onNavigate?.(entry.route);
                      onClose();
                    }}
                    className="px-2 py-1 text-[11px] border border-[#cccccc] bg-white hover:border-[#111111] hover:text-[#111111] text-[#444444] cursor-pointer disabled:cursor-default"
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-[#666666]">{beat.directive}</p>
        </div>

        <div className="px-5 sm:px-6 pb-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-[#111111] text-amber-400 px-4 py-2 text-xs font-bold uppercase hover:bg-black cursor-pointer"
          >
            {remaining > 0 ? `Next beat (${remaining} more)` : 'Continue'} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
