"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  fetchMovies,
  getTop10Movies,
  getUpcomingMovies,
  TABS,
  type TabId
} from "@/lib/movies";
import type { MovieItem } from "@/types/movie";
import { MovieCard } from "@/components/MovieCard";
import { SearchHeader } from "@/components/SearchHeader";
import { TabBar } from "@/components/TabBar";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieRow } from "@/components/MovieRow";
import { SectionHeader } from "@/components/SectionHeader";

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
  homeSections?: {
    hero: MovieItem | null;
    top10: MovieItem[];
    upcoming: MovieItem[];
    trending: MovieItem[];
  };
};

function TabSection({
  loading,
  items,
  searchTerm,
  tabId,
  homeSections
}: TabSectionProps) {
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-t-[#e50914]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-16 text-center text-sm text-[#777]">
        {searchTerm
          ? `No results found for "${searchTerm}"`
          : tabId === "home"
            ? "No Data Found"
            : "Nothing here"}
      </p>
    );
  }

  if (tabId === "home" && !searchTerm && homeSections) {
    const { hero, top10, upcoming, trending } = homeSections;
    return (
      <div className="space-y-8 pb-8">
        {hero ? (
          <div className="px-4 sm:px-6">
            <HeroBanner item={hero} />
          </div>
        ) : null}

        {top10.length > 0 ? (
          <section>
            <SectionHeader title="Top 10 Movies" subtitle="Highest rated" />
            <MovieRow items={top10} cardSize="top10" />
          </section>
        ) : null}

        {upcoming.length > 0 ? (
          <section>
            <SectionHeader title="Upcoming & Latest" subtitle="New releases" />
            <MovieRow items={upcoming} cardSize="large" />
          </section>
        ) : null}

        {trending.length > 0 ? (
          <section>
            <SectionHeader title="Trending Now" />
            <MovieRow items={trending} cardSize="large" />
          </section>
        ) : null}

        <section>
          <SectionHeader title="Browse All" />
          <div className="grid grid-cols-3 gap-x-2 gap-y-4 px-4 sm:grid-cols-4 sm:gap-x-3 sm:gap-y-5 md:grid-cols-5">
            {items.slice(0, MAX_ITEMS_PER_TAB).map((item) => (
              <MovieCard key={`${tabId}-${item.id}`} item={item} size="default" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4 px-4 py-4 sm:grid-cols-4 sm:gap-x-3 sm:gap-y-5 md:grid-cols-5">
      {items.slice(0, MAX_ITEMS_PER_TAB).map((item) => (
        <MovieCard key={`${tabId}-${item.id}`} item={item} size="default" />
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
  const [headerScrolled, setHeaderScrolled] = useState(false);

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
        acc[tab.id] = allMovies.filter((item) =>
          item.searchBlob.includes(searchTerm)
        );
      } else {
        acc[tab.id] = byTab(allMovies, tab.id);
      }
      return acc;
    }, {} as Record<TabId, MovieItem[]>);
  }, [allMovies, searchTerm]);

  const homeSections = useMemo(() => {
    const homeItems = tabResults.home || [];
    const nonAdult = homeItems.filter((m) => !m.adult);
    const top10 = getTop10Movies(allMovies);
    const upcoming = getUpcomingMovies(allMovies);
    const hero =
      top10[0] || upcoming[0] || nonAdult.find((m) => m.poster) || null;
    const trending = nonAdult
      .filter((m) => m.rating !== "N/A")
      .sort((a, b) => {
        const ar = parseFloat(String(a.rating)) || 0;
        const br = parseFloat(String(b.rating)) || 0;
        return br - ar;
      })
      .slice(0, 12);
    return { hero, top10, upcoming, trending };
  }, [allMovies, tabResults.home]);

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
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#050505] text-white">
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          headerScrolled
            ? "bg-[#050505]/98 shadow-lg shadow-black/20 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
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
        className="flex min-h-[100dvh] transition-transform duration-300 ease-out"
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
          } else if (
            distance < -minSwipeDistance &&
            currentTabIndex < TABS.length - 1
          ) {
            switchTab(currentTabIndex + 1);
          }
        }}
      >
        {TABS.map((tab) => (
          <section
            key={tab.id}
            className="h-[100dvh] w-[100vw] shrink-0 overflow-y-auto pb-24 pt-[115px]"
            onScroll={(e) => {
              const target = e.currentTarget;
              setHeaderScrolled(target.scrollTop > 60);
            }}
          >
            <TabSection
              loading={loading}
              items={tabResults[tab.id] || []}
              searchTerm={searchTerm}
              tabId={tab.id}
              homeSections={tab.id === "home" ? homeSections : undefined}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
