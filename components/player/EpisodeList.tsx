"use client";

import { PlayCircle, X } from "lucide-react";

import type { Season } from "@/types/movie";

type EpisodeListProps = {
  open: boolean;
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onClose: () => void;
  onSelectEpisode: (seasonIndex: number, episodeIndex: number) => void;
};

export function EpisodeList({
  open,
  seasons,
  currentSeason,
  currentEpisode,
  onClose,
  onSelectEpisode
}: EpisodeListProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#111] p-5">
        <h3 className="text-base font-semibold text-white">Episodes</h3>
        <button type="button" onClick={onClose} aria-label="Close episodes">
          <X className="text-white" size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {seasons.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#888]">No episodes found.</p>
        ) : null}

        {seasons.map((season, sIndex) => (
          <section key={`${season.name}-${sIndex}`} className="mb-5">
            <h4 className="mb-2.5 text-base font-bold text-[#ffc107]">{season.name}</h4>
            <div className="space-y-2.5">
              {season.episodes.map((episode, eIndex) => {
                const active = currentSeason === sIndex && currentEpisode === eIndex;
                return (
                  <button
                    key={`${season.name}-${episode.title}-${eIndex}`}
                    type="button"
                    onClick={() => {
                      onSelectEpisode(sIndex, eIndex);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                      active
                        ? "border-[#e50914] bg-[#2a1113]"
                        : "border-[#333] bg-[#222] hover:bg-[#333]"
                    }`}
                  >
                    <span className="w-6 text-sm font-bold text-[#aaa]">{eIndex + 1}</span>
                    <span className="flex-1 text-sm font-medium text-white">
                      {episode.title || `Episode ${eIndex + 1}`}
                    </span>
                    <PlayCircle size={16} className="text-[#e50914]" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
