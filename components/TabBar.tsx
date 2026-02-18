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
    <nav className="border-b border-white/10 bg-[rgba(8,9,14,0.9)] px-2 pb-2 backdrop-blur-xl sm:px-4">
      <div className="mx-auto flex max-w-[1400px] overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSwitch(index)}
              aria-current={active ? "page" : undefined}
              className={`relative mr-2 shrink-0 rounded-full px-4 py-2.5 text-sm transition-all ${
                active
                  ? "bg-white text-black shadow-[0_8px_26px_rgba(255,255,255,0.25)]"
                  : "border border-white/15 bg-white/5 font-medium text-white/75 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
