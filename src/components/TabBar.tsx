"use client";

import { useRef, useEffect } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

export default function TabBar({ tabs, activeIndex, onTabChange }: TabBarProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  return (
    <nav className="bg-mflix-bg/[0.98] border-b border-white/10">
      <div className="flex overflow-x-auto px-1 scrollbar-hide whitespace-nowrap">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            onClick={() => onTabChange(index)}
            className={`flex-shrink-0 px-5 h-[45px] flex justify-center items-center text-sm font-medium relative transition-colors duration-300 ${
              activeIndex === index
                ? "text-white font-bold"
                : "text-gray-500"
            }`}
          >
            {tab.label}
            {activeIndex === index && (
              <span className="absolute bottom-0 w-1/2 h-[3px] bg-mflix-red-dark rounded-t" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
