"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import type { Season, Episode } from "@/types/movie";

interface EpisodeListProps {
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (seasonIndex: number, episodeIndex: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function EpisodeList({
  seasons,
  currentSeason,
  currentEpisode,
  onSelectEpisode,
  onClose,
  isOpen,
}: EpisodeListProps) {
  const [search, setSearch] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("all");

  const filteredContent = useMemo(() => {
    const term = search.toLowerCase().trim();
    return seasons.map((season, sIndex) => {
      const seasonKey = `s-${sIndex}`;
      if (selectedSeason !== "all" && selectedSeason !== seasonKey) return null;

      const episodes = (season.episodes || season.list || []).map((ep, eIndex) => ({
        episode: ep,
        sIndex,
        eIndex,
      })).filter(
        ({ episode }) =>
          !term ||
          (episode.title || episode.name || "").toLowerCase().includes(term)
      );

      if (episodes.length === 0) return null;
      return { season, sIndex, episodes };
    }).filter(Boolean) as { season: Season; sIndex: number; episodes: { episode: Episode; sIndex: number; eIndex: number }[] }[];
  }, [seasons, search, selectedSeason]);

  const totalEpisodes = filteredContent.reduce(
    (sum, block) => sum + block.episodes.length,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-[940px] max-h-[90vh] rounded-2xl border border-white/14 bg-[#0f1522] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center gap-2 p-3 border-b border-white/11">
          <h3 className="text-base font-semibold m-0">Episodes</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1.5 rounded-full border border-white/16 bg-white/4">
              {totalEpisodes} episodes
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2 p-2.5 border-b border-white/11">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search episode title..."
            className="border border-white/16 rounded-lg py-2 px-2.5 bg-white/5 text-white placeholder:text-gray-400"
          />
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="border border-white/16 rounded-lg py-2 px-2.5 bg-white/5 text-white"
          >
            <option value="all">All Seasons</option>
            {seasons.map((s, i) => (
              <option key={i} value={`s-${i}`}>
                {s.name || s.title || `Season ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-auto p-2.5 flex-1">
          {filteredContent.length === 0 ? (
            <p className="text-center text-[#9ca3b8]">No episodes matched your search.</p>
          ) : (
            filteredContent.map(({ season, sIndex, episodes }) => (
              <section key={sIndex} className="mb-3.5">
                <h4 className="m-0 mb-2 text-sm text-[#ffc94a]">
                  {season.name || season.title || `Season ${sIndex + 1}`}
                </h4>
                {episodes.map(({ episode, eIndex }) => {
                  const isActive =
                    currentSeason === sIndex && currentEpisode === eIndex;
                  return (
                    <button
                      key={`${sIndex}-${eIndex}`}
                      onClick={() => {
                        onSelectEpisode(sIndex, eIndex);
                        onClose();
                      }}
                      className={`w-full text-left rounded-lg py-2 px-2.5 mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2.5 border transition-colors ${
                        isActive
                          ? "border-[#E50914]/35 bg-[#E50914]/10"
                          : "border-white/12 bg-white/3 hover:bg-white/8"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#8d99b8]">
                        E{eIndex + 1}
                      </span>
                      <span className="text-sm">
                        {episode.title || episode.name || `Episode ${eIndex + 1}`}
                      </span>
                    </button>
                  );
                })}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
