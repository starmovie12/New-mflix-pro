"use client";

import { ArrowLeft, Settings2, StepForward } from "lucide-react";

type PlayerControlsProps = {
  title: string;
  onBack: () => void;
  onToggleQuality: () => void;
  onNextEpisode: () => void;
  showNextEpisode: boolean;
};

export function PlayerControls({
  title,
  onBack,
  onToggleQuality,
  onNextEpisode,
  showNextEpisode
}: PlayerControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
        >
          <ArrowLeft size={16} />
        </button>
        <p className="max-w-[48vw] truncate rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white">
          {title}
        </p>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        {showNextEpisode ? (
          <button
            type="button"
            onClick={onNextEpisode}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
            aria-label="Next episode"
            title="Next episode"
          >
            <StepForward size={16} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleQuality}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
          aria-label="Quality settings"
          title="Quality settings"
        >
          <Settings2 size={16} />
        </button>
      </div>
    </div>
  );
}
