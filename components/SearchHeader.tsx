import type { KeyboardEvent } from "react";
import { Bell, Search, UserRound } from "lucide-react";

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
    <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,10,18,0.96),rgba(8,8,10,0.86))] px-3 py-2.5 backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2.5 sm:gap-3">
        <div className="shrink-0 whitespace-nowrap text-lg font-extrabold tracking-[-0.5px] sm:text-xl">
          <span className="text-white">M</span>
          <span className="text-[#e50914]">FLIX</span>
        </div>

        <div className="relative flex flex-1 items-center">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
          />
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onEnter}
            placeholder="Search actor, genre, year..."
            autoComplete="off"
            aria-label="Search Movies"
            className="h-10 w-full rounded-full border border-white/20 bg-black/45 pl-9 pr-3 text-sm text-white outline-none ring-[#e50914]/70 transition focus:border-white/30 focus:ring-2 placeholder:text-white/45"
          />
        </div>

        <button
          type="button"
          onClick={onGo}
          className="hidden h-10 rounded-full bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-white/90 sm:inline-flex sm:items-center sm:justify-center"
          aria-label="Search"
        >
          Search
        </button>

        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 transition hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 transition hover:bg-white/10"
          aria-label="Account"
        >
          <UserRound size={16} />
        </button>
      </div>
    </div>
  );
}
