import type { TabId } from "@/lib/movies";

type TabItem = {
  id: TabId;
  label: string;
};

type TabBarProps = {
  tabs: TabItem[];
  currentIndex: number;
  onSwitch: (index: number) => void;
};

export function TabBar({ tabs, currentIndex, onSwitch }: TabBarProps) {
  return (
    <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="flex overflow-x-auto whitespace-nowrap px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
        {tabs.map((tab, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSwitch(index)}
              className={`relative shrink-0 px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "text-white"
                  : "text-[#888] hover:text-[#bbb]"
              }`}
            >
              {tab.label}
              {active ? (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#e50914] to-[#b20710]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
