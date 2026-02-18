import type { KeyboardEvent } from "react";

type SearchHeaderProps = {
  value: string;
  onChange: (value: string) => void;
  onGo: () => void;
};

export function SearchHeader({ value, onChange, onGo }: SearchHeaderProps) {
  const onEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") onGo();
  };

  return (
    <div className="border-b border-white/5 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141414]/90 px-4 py-2.5 shadow-inner backdrop-blur-sm transition focus-within:border-[#e50914]/50 focus-within:ring-2 focus-within:ring-[#e50914]/20">
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-xl font-black tracking-tight text-white sm:text-2xl">
            M
          </span>
          <span className="bg-gradient-to-r from-[#e50914] to-[#b20710] bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-2xl">
            FLIX
          </span>
        </div>
        <div className="h-5 w-px shrink-0 bg-white/20" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
          placeholder="Search movies, series, actors..."
          autoComplete="off"
          aria-label="Search Movies"
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[#666] focus:ring-0"
        />
        <button
          type="button"
          onClick={onGo}
          className="shrink-0 rounded-lg bg-gradient-to-r from-[#e50914] to-[#b20710] px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:from-[#f40612] hover:to-[#c40812] active:scale-[0.98]"
          aria-label="Search"
        >
          Search
        </button>
      </div>
    </div>
  );
}
