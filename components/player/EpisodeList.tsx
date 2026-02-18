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
    <div className="fixed inset-0 z-50 flex flex-col bg-mflix-bg/98 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-mflix-border bg-mflix-surface px-5 py-4">
        <h3 className="text-base font-bold text-white">Episodes</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close episodes"
          className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {seasons.length === 0 && (
          <p className="py-10 text-center text-sm text-mflix-text-muted">No episodes found.</p>
        )}

        {seasons.map((season, sIndex) => (
          <section key={`${season.name}-${sIndex}`} className="mb-6">
            <h4 className="mb-3 text-sm font-bold text-mflix-red">{season.name}</h4>
            <div className="space-y-2">
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
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? "border-mflix-red/60 bg-mflix-red/10"
                        : "border-mflix-border bg-mflix-card hover:bg-mflix-card-hover"
                    }`}
                  >
                    <span className={`w-6 text-center text-sm font-bold ${active ? "text-mflix-red" : "text-mflix-text-muted"}`}>
                      {eIndex + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-white">
                      {episode.title || `Episode ${eIndex + 1}`}
                    </span>
                    <PlayCircle size={16} className={active ? "text-mflix-red" : "text-white/40"} />
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
