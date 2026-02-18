"use client";

import { Search } from "lucide-react";

export function TopBar({
  search,
  onSearchChange,
  onGo
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onGo: () => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="border-b border-white/5 bg-[rgba(5,5,5,0.98)] px-3 py-[10px] backdrop-blur-[10px]">
        <div className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-[#1a1a1a] px-3 py-2">
          <div className="whitespace-nowrap text-[18px] font-extrabold tracking-[-0.5px]">
            <span className="text-white">M</span>
            <span className="text-mflix-red">FLIX</span>
          </div>

          <Search className="h-4 w-4 text-white/40" aria-hidden="true" />

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search actor, genre, year..."
            autoComplete="off"
            aria-label="Search Movies"
            className="w-full flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/35"
          />

          <button
            type="button"
            onClick={onGo}
            className="pl-[10px] text-[14px] font-semibold uppercase text-mflix-red"
          >
            GO
          </button>
        </div>
      </div>
    </header>
  );
}

