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
    <nav className="border-b border-mflix-border bg-mflix-bg/95 backdrop-blur-xl">
      <div className="scrollbar-hide flex overflow-x-auto px-1">
        {tabs.map((tab, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSwitch(index)}
              className={`relative h-11 shrink-0 px-5 text-[13px] transition-all duration-200 ${
                active
                  ? "font-bold text-white"
                  : "font-medium text-mflix-text-muted hover:text-white/70"
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 h-[2.5px] w-3/5 -translate-x-1/2 rounded-t bg-mflix-red" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
