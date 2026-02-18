"use client";

import { Play } from "lucide-react";

type SourceSelectorProps = {
  servers: string[];
  qualities: string[];
  selectedServer: string;
  selectedQuality: string;
  onServerChange: (value: string) => void;
  onQualityChange: (value: string) => void;
  onPlay: () => void;
};

export function SourceSelector({
  servers,
  qualities,
  selectedServer,
  selectedQuality,
  onServerChange,
  onQualityChange,
  onPlay
}: SourceSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
      <select
        value={selectedServer}
        onChange={(event) => onServerChange(event.target.value)}
        className="h-11 rounded-md border border-white/10 bg-[#1a1a1a] px-3 text-sm text-white outline-none"
      >
        {servers.map((server) => (
          <option key={server} value={server}>
            {server}
          </option>
        ))}
      </select>

      <select
        value={selectedQuality}
        onChange={(event) => onQualityChange(event.target.value)}
        className="h-11 rounded-md border border-white/10 bg-[#1a1a1a] px-3 text-sm text-white outline-none"
      >
        {qualities.map((quality) => (
          <option key={quality} value={quality}>
            {quality}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onPlay}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#e50914] px-5 text-sm font-bold text-white"
      >
        <Play size={14} />
        Play
      </button>
    </div>
  );
}
