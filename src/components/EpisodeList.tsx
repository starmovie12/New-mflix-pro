"use client";

import { X, Play, Search } from "lucide-react";
import { useState, useMemo } from "react";
import type { Season } from "@/lib/types";

interface EpisodeListProps {
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onEpisodeSelect: (seasonIndex: number, episodeIndex: number) => void;
  onClose: () => void;
}

export default function EpisodeList({
  seasons,
  currentSeason,
  currentEpisode,
  onEpisodeSelect,
  onClose,
}: EpisodeListProps) {
  const [search, setSearch] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("all");

  const filteredSeasons = useMemo(() => {
    return seasons
      .map((season, sIndex) => {
        if (selectedSeason !== "all" && selectedSeason !== `s-${sIndex}`) {
          return null;
        }
        const episodes = season.episodes.filter((ep) => {
          if (!search) return true;
          return ep.title.toLowerCase().includes(search.toLowerCase());
        });
        if (episodes.length === 0) return null;
        return { ...season, episodes, originalIndex: sIndex };
      })
      .filter(Boolean) as (Season & { originalIndex: number })[];
  }, [seasons, search, selectedSeason]);

  const totalEpisodes = filteredSeasons.reduce((sum, s) => sum + s.episodes.length, 0);

  return (
    <div className="fixed inset-0 z-[2000] episodes-overlay-bg backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/15 bg-[#111] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-bold text-lg m-0">Episodes</h3>
          <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
            {totalEpisodes} episodes
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close episodes"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-[1fr_auto] gap-2 p-3 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search episodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-gray-500"
          />
        </div>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm outline-none"
        >
          <option value="all">All Seasons</option>
          {seasons.map((season, i) => (
            <option key={i} value={`s-${i}`}>
              {season.name}
            </option>
          ))}
        </select>
      </div>

      {/* Episode List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSeasons.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">No episodes matched your search.</p>
        ) : (
          filteredSeasons.map((season) => (
            <div key={season.originalIndex} className="mb-5">
              <h4 className="text-mflix-gold font-bold mb-2.5 text-base">
                {season.name}
              </h4>
              <div className="space-y-2">
                {season.episodes.map((ep, eIndex) => {
                  const originalEpIndex = seasons[season.originalIndex].episodes.indexOf(ep);
                  const isActive =
                    currentSeason === season.originalIndex &&
                    currentEpisode === originalEpIndex;

                  return (
                    <button
                      key={eIndex}
                      onClick={() => {
                        onEpisodeSelect(season.originalIndex, originalEpIndex);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                        isActive
                          ? "border-mflix-red bg-mflix-red/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-400 w-7 text-center">
                        E{originalEpIndex + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-white text-left">
                        {ep.title}
                      </span>
                      <Play
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-mflix-red" : "text-gray-500"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
