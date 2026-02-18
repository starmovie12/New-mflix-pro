"use client";

import { Play, X } from "lucide-react";

export type Episode = { title?: string; url?: string; link?: string };
export type Season = { name?: string; episodes?: Episode[] };

export function EpisodeList({
  open,
  seasons,
  onClose,
  onPlayEpisode
}: {
  open: boolean;
  seasons: Season[];
  onClose: () => void;
  onPlayEpisode: (ep: Episode) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-black/95">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#111] p-5">
        <h3 className="text-base font-bold text-white">Episodes</h3>
        <button type="button" onClick={onClose} className="text-white">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {seasons?.length ? (
          seasons.map((season, sIndex) => (
            <div key={season.name || sIndex} className="mb-5">
              <div className="mb-2 text-[16px] font-bold text-[#ffc107]">
                {season.name || `Season ${sIndex + 1}`}
              </div>

              {season.episodes?.length ? (
                season.episodes.map((ep, eIndex) => (
                  <button
                    key={`${sIndex}-${eIndex}`}
                    type="button"
                    onClick={() => onPlayEpisode(ep)}
                    className="mb-2 flex w-full items-center gap-3 rounded-[8px] border border-white/10 bg-[#222] px-3 py-3 text-left hover:bg-[#333]"
                  >
                    <div className="w-7 shrink-0 text-[14px] font-bold text-white/60">{eIndex + 1}</div>
                    <div className="min-w-0 flex-1 truncate text-[14px] font-medium text-white">
                      {ep.title || `Episode ${eIndex + 1}`}
                    </div>
                    <Play className="h-5 w-5 shrink-0 text-mflix-red" />
                  </button>
                ))
              ) : (
                <div className="text-center text-sm text-white/50">No episodes found.</div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-white/50">No episodes found.</div>
        )}
      </div>
    </div>
  );
}

