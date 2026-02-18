"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { fetchMovies, TABS, type TabId } from "@/lib/movies";
import type { MovieItem } from "@/types/movie";
import { MovieCard } from "@/components/MovieCard";
import { SearchHeader } from "@/components/SearchHeader";
import { TabBar } from "@/components/TabBar";

const MAX_ITEMS_PER_TAB = 100;

function byTab(items: MovieItem[], tabId: TabId): MovieItem[] {
  if (tabId === "home") return items;
  if (tabId === "movies") {
    return items.filter((item) => item.category.includes("movie"));
  }
  if (tabId === "tvshow") {
    return items.filter(
      (item) =>
        item.category.includes("series") ||
        item.category.includes("tv") ||
        item.isSeries
    );
  }
  if (tabId === "anime") {
    return items.filter((item) => item.category.includes("anime"));
  }
  return items.filter((item) => item.adult);
}

type TabSectionProps = {
  loading: boolean;
  items: MovieItem[];
  searchTerm: string;
  tabId: TabId;
};

function TabSection({ loading, items, searchTerm, tabId }: TabSectionProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/15 border-t-[#d32f2f]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-12 text-center text-sm text-[#777]">
        {searchTerm
          ? `No results found for "${searchTerm}"`
          : tabId === "home"
            ? "No Data Found"
            : "Nothing here"}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-y-[15px] gap-x-2 px-2 py-2.5">
      {items.slice(0, MAX_ITEMS_PER_TAB).map((item) => (
        <MovieCard key={`${tabId}-${item.id}`} item={item} />
      ))}
    </div>
  );
}

export function HomeClient() {
  const [allMovies, setAllMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const touchStartX = useRef(0);
  const minSwipeDistance = 50;

  useEffect(() => {
    const run = async () => {
      try {
        const movies = await fetchMovies();
        setAllMovies(movies);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const tabResults = useMemo(() => {
    return TABS.reduce<Record<TabId, MovieItem[]>>((acc, tab) => {
      if (searchTerm) {
        acc[tab.id] = allMovies.filter((item) => item.searchBlob.includes(searchTerm));
      } else {
        acc[tab.id] = byTab(allMovies, tab.id);
      }
      return acc;
    }, {} as Record<TabId, MovieItem[]>);
  }, [allMovies, searchTerm]);

  const applySearch = (value: string) => {
    const normalized = value.trim().toLowerCase();
    setSearchTerm(normalized);
    if (normalized.length > 0 && currentTabIndex !== 0) {
      setCurrentTabIndex(0);
    }
  };

  const switchTab = (index: number) => {
    if (index < 0 || index >= TABS.length) return;
    setCurrentTabIndex(index);
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#050505] text-white">
      <header className="fixed left-0 right-0 top-0 z-50">
        <SearchHeader
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
            applySearch(value);
          }}
          onGo={() => applySearch(searchValue)}
        />
        <TabBar tabs={TABS} currentIndex={currentTabIndex} onSwitch={switchTab} />
      </header>

      <div
        className="flex h-[100dvh] transition-transform duration-300 ease-out"
        style={{
          width: `${TABS.length * 100}vw`,
          transform: `translateX(-${currentTabIndex * 100}vw)`
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0].screenX;
        }}
        onTouchEnd={(event) => {
          const touchEndX = event.changedTouches[0].screenX;
          const distance = touchEndX - touchStartX.current;
          if (distance > minSwipeDistance && currentTabIndex > 0) {
            switchTab(currentTabIndex - 1);
          } else if (distance < -minSwipeDistance && currentTabIndex < TABS.length - 1) {
            switchTab(currentTabIndex + 1);
          }
        }}
      >
        {TABS.map((tab) => (
          <section
            key={tab.id}
            className="h-[100dvh] w-[100vw] shrink-0 overflow-y-auto pb-20 pt-[110px]"
          >
            <TabSection
              loading={loading}
              items={tabResults[tab.id] || []}
              searchTerm={searchTerm}
              tabId={tab.id}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
