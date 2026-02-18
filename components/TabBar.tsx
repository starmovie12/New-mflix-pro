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
    <nav className="border-b border-white/10 bg-[rgba(5,5,5,0.82)] backdrop-blur-xl">
      <div className="flex overflow-x-auto whitespace-nowrap px-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSwitch(index)}
              className={`relative h-[45px] shrink-0 px-5 text-sm transition-colors ${
                active
                  ? "font-extrabold text-white"
                  : "font-semibold text-white/55 hover:text-white/75"
              }`}
            >
              {tab.label}
              {active ? (
                <span className="absolute bottom-0 left-1/2 h-[3px] w-1/2 -translate-x-1/2 rounded-t-sm bg-[#d32f2f] shadow-[0_-8px_24px_rgba(211,47,47,0.35)]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
