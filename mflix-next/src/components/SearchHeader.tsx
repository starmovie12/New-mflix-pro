"use client";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export function SearchHeader({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
}: SearchHeaderProps) {
  return (
    <div className="bg-[rgba(5,5,5,0.98)] backdrop-blur-[10px] px-3 py-2.5 border-b border-white/5">
      <div className="flex items-center bg-[#1a1a1a] rounded-lg py-2 px-3 border border-[#333]">
        <div className="text-lg font-extrabold tracking-tight mr-2.5 whitespace-nowrap">
          <span className="text-white">M</span>
          <span className="text-[#E50914]">FLIX</span>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          placeholder="Search actor, genre, year..."
          autoComplete="off"
          aria-label="Search Movies"
          className="flex-1 w-full text-sm text-white bg-transparent border-none outline-none min-w-0"
        />
        <button
          type="button"
          onClick={onSearchSubmit}
          className="text-[#E50914] text-sm font-semibold uppercase pl-2.5 cursor-pointer"
        >
          GO
        </button>
      </div>
    </div>
  );
}
