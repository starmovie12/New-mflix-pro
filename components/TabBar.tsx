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
    <nav className="border-b border-white/10 bg-[rgba(5,5,5,0.98)]">
      <div className="flex overflow-x-auto whitespace-nowrap px-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSwitch(index)}
              className={`relative h-[45px] shrink-0 px-5 text-sm transition-colors ${
                active ? "font-bold text-white" : "font-medium text-[#888]"
              }`}
            >
              {tab.label}
              {active ? (
                <span className="absolute bottom-0 left-1/2 h-[3px] w-1/2 -translate-x-1/2 rounded-t-sm bg-[#d32f2f]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
