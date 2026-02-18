"use client";

import { cn } from "@/lib/cn";
import { TAB_CONFIG } from "@/lib/constants";

export function TabBar({
  activeIndex,
  onSelect
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="fixed left-0 right-0 top-[62px] z-50 border-b border-white/10 bg-[rgba(5,5,5,0.98)]">
      <div className="no-scrollbar flex h-[45px] items-center overflow-x-auto whitespace-nowrap px-[5px]">
        {TAB_CONFIG.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(idx)}
            className={cn(
              "relative flex h-[45px] shrink-0 items-center justify-center px-5 text-[14px] font-medium text-[#888] transition-colors",
              idx === activeIndex && "font-bold text-white"
            )}
          >
            {t.label}
            {idx === activeIndex ? (
              <span className="absolute bottom-0 h-[3px] w-1/2 rounded-t-[2px] bg-mflix-red" />
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  );
}

