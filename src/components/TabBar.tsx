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
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  return (
    <nav className="bg-[rgba(5,5,5,0.98)] border-b border-white/10">
      <div className="flex overflow-x-auto scrollbar-hide px-1 whitespace-nowrap">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            onClick={() => onTabChange(index)}
            className={`flex-shrink-0 px-5 h-[45px] flex justify-center items-center text-sm cursor-pointer relative transition-colors duration-300
              ${
                activeIndex === index
                  ? "text-white font-bold"
                  : "text-mflix-muted font-medium"
              }`}
          >
            {tab.label}
            {activeIndex === index && (
              <span className="absolute bottom-0 w-1/2 h-[3px] bg-mflix-accent-dark rounded-t" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
