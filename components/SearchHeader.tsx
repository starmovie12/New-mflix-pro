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
    <div className="border-b border-white/5 bg-[rgba(5,5,5,0.98)] px-3 py-2.5 backdrop-blur-md">
      <div className="flex items-center rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2">
        <div className="mr-2.5 whitespace-nowrap text-lg font-extrabold tracking-[-0.5px]">
          <span className="text-white">M</span>
          <span className="text-[#d32f2f]">FLIX</span>
        </div>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
          placeholder="Search actor, genre, year..."
          autoComplete="off"
          aria-label="Search Movies"
          className="w-full flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[#888]"
        />
        <button
          type="button"
          onClick={onGo}
          className="pl-2.5 text-sm font-semibold uppercase text-[#d32f2f]"
          aria-label="Search"
        >
          GO
        </button>
      </div>
    </div>
  );
}
