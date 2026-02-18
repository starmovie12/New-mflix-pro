"use client";

import { useState, useMemo } from "react";
import { X, Search, Play } from "lucide-react";
import { NormalizedSeason } from "@/lib/types";

interface EpisodeListProps {
  seasons: NormalizedSeason[];
  currentSeason: number;
  currentEpisode: number;
  onPlayEpisode: (seasonIndex: number, episodeIndex: number) => void;
  onClose: () => void;
}

export default function EpisodeList({
  seasons,
  currentSeason,
  currentEpisode,
  onPlayEpisode,
  onClose,
}: EpisodeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("all");

  const totalEpisodes = useMemo(() => {
    let count = 0;
    seasons.forEach((season, sIndex) => {
      if (selectedSeason !== "all" && selectedSeason !== `s-${sIndex}`) return;
      season.episodes.forEach((ep) => {
        if (
          searchQuery &&
          !ep.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return;
        count++;
      });
    });
    return count;
  }, [seasons, selectedSeason, searchQuery]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(3,5,10,0.95)] backdrop-blur-sm grid place-items-center">
      <div className="w-[min(940px,96vw)] max-h-[90vh] border border-white/[0.14] rounded-2xl bg-[#0f1522] grid grid-rows-[auto_auto_1fr] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center gap-2.5 p-3 border-b border-white/[0.11]">
          <h3 className="text-base font-bold m-0">Episodes</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 text-[11px] text-[#c5cee2] px-2.5 py-1.5 rounded-full border border-white/[0.16] bg-white/[0.04]">
              {totalEpisodes} episodes
            </span>
            <button
              onClick={onClose}
              className="w-[38px] h-[38px] border border-white/[0.26] rounded-full bg-black/50 text-white inline-flex items-center justify-center"
              title="Close episodes"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Season Filter */}
        <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2.5 border-b border-white/[0.11]">
          <div className="flex items-center border border-white/[0.16] rounded-[10px] px-2.5 py-2 bg-white/[0.05]">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search episode title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
            />
          </div>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="border border-white/[0.16] rounded-[10px] px-2.5 py-2 bg-white/[0.05] text-white text-sm outline-none"
          >
            <option value="all">All Seasons</option>
            {seasons.map((season, index) => (
              <option key={index} value={`s-${index}`}>
                {season.name}
              </option>
            ))}
          </select>
        </div>

        {/* Episode List Body */}
        <div className="overflow-auto px-3 py-2.5">
          {seasons.map((season, sIndex) => {
            if (
              selectedSeason !== "all" &&
              selectedSeason !== `s-${sIndex}`
            )
              return null;

            const filteredEpisodes = season.episodes
              .map((ep, eIndex) => ({ ep, eIndex }))
              .filter(({ ep }) => {
                if (!searchQuery) return true;
                return ep.title
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
              });

            if (filteredEpisodes.length === 0) return null;

            return (
              <section key={sIndex} className="mb-3.5">
                <h4 className="text-[#ffc94a] text-sm font-bold mb-2">
                  {season.name}
                </h4>
                {filteredEpisodes.map(({ ep, eIndex }) => {
                  const isActive =
                    currentSeason === sIndex && currentEpisode === eIndex;
                  return (
                    <button
                      key={eIndex}
                      onClick={() => {
                        onPlayEpisode(sIndex, eIndex);
                        onClose();
                      }}
                      className={`w-full border rounded-[10px] px-2.5 py-2 mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2.5 bg-white/[0.03] text-left hover:bg-white/[0.08] transition-colors ${
                        isActive
                          ? "border-mflix-accent/60 shadow-[inset_0_0_0_1px_rgba(229,9,20,0.3)]"
                          : "border-white/[0.12]"
                      }`}
                    >
                      <span className="text-gray-400 font-bold text-xs">
                        E{eIndex + 1}
                      </span>
                      <span className="text-[13px] text-white truncate">
                        {ep.title}
                      </span>
                      <Play className="w-3.5 h-3.5 text-white/60" />
                    </button>
                  );
                })}
              </section>
            );
          })}
          {totalEpisodes === 0 && (
            <p className="text-gray-400 text-center py-4">
              No episodes matched your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
