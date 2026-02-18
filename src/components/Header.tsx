"use client";

import { Search } from "lucide-react";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export default function Header({
  searchTerm,
  onSearchChange,
  onSearch,
}: HeaderProps) {
  return (
    <div className="bg-[rgba(5,5,5,0.98)] backdrop-blur-[10px] px-3 py-2.5 border-b border-white/5">
      <div className="flex items-center bg-mflix-card rounded-lg px-3 py-2 border border-[#333]">
        <div className="text-lg font-extrabold tracking-tight mr-2.5 whitespace-nowrap">
          <span className="text-white">M</span>
          <span className="text-mflix-accent-dark">FLIX</span>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Search actor, genre, year..."
          autoComplete="off"
          aria-label="Search Movies"
          className="flex-grow w-full text-sm text-white bg-transparent border-none outline-none placeholder-gray-500"
        />
        <button
          onClick={onSearch}
          className="text-mflix-accent-dark pl-2.5 cursor-pointer flex items-center gap-1"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase hidden sm:inline">
            GO
          </span>
        </button>
      </div>
    </div>
  );
}
