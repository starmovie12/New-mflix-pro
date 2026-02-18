import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";

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
    <div className="border-b border-mflix-border bg-mflix-bg/95 px-3 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="shrink-0 select-none text-xl font-extrabold tracking-tight">
          <span className="text-white">M</span>
          <span className="text-mflix-red">FLIX</span>
        </div>

        <div className="flex flex-1 items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-2 transition-colors focus-within:border-mflix-red/50 focus-within:bg-white/8">
          <Search size={15} className="mr-2 shrink-0 text-mflix-text-muted" />
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onEnter}
            placeholder="Search movies, series, anime..."
            autoComplete="off"
            aria-label="Search Movies"
            className="w-full flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-mflix-text-muted"
          />
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => { onChange(""); onGo(); }}
              className="ml-1 text-xs text-mflix-text-muted hover:text-white"
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
