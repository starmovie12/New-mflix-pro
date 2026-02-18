"use client";

import { Search } from "lucide-react";
import { useRef } from "react";

interface SearchHeaderProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export default function SearchHeader({ searchTerm, onSearch }: SearchHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    onSearch(inputRef.current?.value.trim().toLowerCase() || "");
  };

  return (
    <div className="bg-mflix-bg/[0.98] backdrop-blur-lg px-3 py-2.5 border-b border-white/5">
      <div className="flex items-center bg-mflix-card rounded-lg px-3 py-2 border border-white/20">
        {/* Logo */}
        <div className="text-lg font-extrabold tracking-tight mr-2.5 whitespace-nowrap">
          <span className="text-white">M</span>
          <span className="text-mflix-red-dark">FLIX</span>
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          defaultValue={searchTerm}
          placeholder="Search actor, genre, year..."
          autoComplete="off"
          aria-label="Search Movies"
          className="flex-grow w-full text-sm text-white bg-transparent border-none outline-none placeholder:text-gray-500"
          onChange={(e) => onSearch(e.target.value.trim().toLowerCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />

        {/* Go Button */}
        <button
          onClick={handleSubmit}
          className="text-mflix-red-dark text-sm font-semibold uppercase pl-2.5 flex items-center gap-1"
        >
          <Search className="w-4 h-4" />
          GO
        </button>
      </div>
    </div>
  );
}
