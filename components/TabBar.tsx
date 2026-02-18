"use client";

const TABS = [
  { id: "home", label: "Home" },
  { id: "movies", label: "Movies" },
  { id: "tvshow", label: "Series" },
  { id: "anime", label: "Anime" },
  { id: "adult", label: "18+" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="bg-[rgba(5,5,5,0.98)] border-b border-white/10">
      <div className="flex overflow-x-auto px-1.5 scrollbar-none whitespace-nowrap [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              shrink-0 px-5 h-11 flex justify-center items-center text-sm font-medium
              cursor-pointer relative transition-colors duration-300
              ${
                activeTab === tab.id
                  ? "text-white font-bold"
                  : "text-[#888]"
              }
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-mflix-accent rounded-t"
                aria-hidden
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
