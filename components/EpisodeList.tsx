"use client";

import { X, Play } from "lucide-react";

export interface Episode {
  title?: string;
  url?: string;
  link?: string;
}

export interface Season {
  name?: string;
  title?: string;
  episodes?: Episode[];
  list?: Episode[];
}

interface EpisodeListProps {
  seasons: Season[];
  isOpen: boolean;
  onClose: () => void;
  onEpisodeSelect: (episode: Episode, seasonIndex: number, episodeIndex: number) => void;
  currentEpisode?: Episode | null;
}

export function EpisodeList({
  seasons,
  isOpen,
  onClose,
  onEpisodeSelect,
  currentEpisode,
}: EpisodeListProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[2000] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Episodes"
    >
      <div className="flex justify-between items-center p-5 border-b border-[#333] bg-[#111]">
        <h3 className="m-0 text-white text-lg font-bold">Episodes</h3>
        <button
          type="button"
          onClick={onClose}
          className="bg-transparent border-none text-white text-2xl cursor-pointer p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Close episodes"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!seasons || seasons.length === 0 ? (
          <p className="text-[#888] text-center py-8">No episodes found.</p>
        ) : (
          seasons.map((season, sIndex) => (
            <div key={sIndex} className="mb-5">
              <div className="text-amber-400 font-bold mb-2.5 text-base">
                {season.name || season.title || `Season ${sIndex + 1}`}
              </div>
              {(season.episodes || season.list || []).map((ep, eIndex) => {
                const url = ep.url || ep.link;
                const isActive =
                  currentEpisode?.url === url ||
                  currentEpisode?.link === url;
                return (
                  <div
                    key={eIndex}
                    role="button"
                    tabIndex={0}
                    onClick={() => url && onEpisodeSelect(ep, sIndex, eIndex)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && url) onEpisodeSelect(ep, sIndex, eIndex);
                    }}
                    className={`flex items-center gap-4 p-3 mb-2.5 rounded-lg cursor-pointer border transition-colors ${
                      isActive
                        ? "bg-mflix-accent/20 border-mflix-accent"
                        : "bg-[#222] border-[#333] hover:bg-[#333]"
                    }`}
                  >
                    <div className="text-sm font-bold text-[#aaa] w-6">
                      {eIndex + 1}
                    </div>
                    <div className="flex-1 text-sm font-medium text-white">
                      {ep.title || `Episode ${eIndex + 1}`}
                    </div>
                    <Play className="w-5 h-5 text-mflix-accent shrink-0" />
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
