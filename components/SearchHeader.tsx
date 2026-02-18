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
    <div className="border-b border-white/5 bg-[rgba(5,5,5,0.82)] px-3 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
        <div className="mr-1 whitespace-nowrap text-lg font-extrabold tracking-[-0.5px]">
          <span className="text-white">M</span>
          <span className="text-[#d32f2f]">FLIX</span>
        </div>
        <span className="h-5 w-px bg-white/10" aria-hidden="true" />
        <Search size={16} className="shrink-0 text-white/55" aria-hidden="true" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
          placeholder="Search actor, genre, year..."
          autoComplete="off"
          aria-label="Search Movies"
          className="w-full flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/45"
        />
        <button
          type="button"
          onClick={onGo}
          className="rounded-full bg-[#d32f2f] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-[0_10px_30px_rgba(211,47,47,0.25)] active:scale-[0.98]"
          aria-label="Search"
        >
          GO
        </button>
      </div>
    </div>
  );
}
