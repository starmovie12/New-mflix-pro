"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { fetchMovies, TABS, type TabId } from "@/lib/movies";
import type { MovieItem } from "@/types/movie";
import { MovieCard } from "@/components/MovieCard";
import { MovieRowCard } from "@/components/MovieRowCard";
import { SearchHeader } from "@/components/SearchHeader";
import { TabBar } from "@/components/TabBar";
import { HeroBanner } from "@/components/HeroBanner";
import { Top10Section } from "@/components/Top10Section";
import { UpcomingSection } from "@/components/UpcomingSection";
import { MovieRow } from "@/components/MovieRow";

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

function shuffled(items: MovieItem[]): MovieItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="animate-shimmer h-[240px] rounded-xl" />
      <div className="space-y-3">
        <div className="animate-shimmer h-5 w-40 rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-[195px] w-[130px] shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="animate-shimmer h-5 w-52 rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-[195px] w-[130px] shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

type HomeTabContentProps = {
  allMovies: MovieItem[];
};

function HomeTabContent({ allMovies }: HomeTabContentProps) {
  const highRated = useMemo(() => {
    return [...allMovies]
      .filter((m) => m.rating !== "N/A" && parseFloat(m.rating) >= 6)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }, [allMovies]);

  const movies = useMemo(() => byTab(allMovies, "movies"), [allMovies]);
  const series = useMemo(() => byTab(allMovies, "tvshow"), [allMovies]);
  const anime = useMemo(() => byTab(allMovies, "anime"), [allMovies]);

  const trendingMovies = useMemo(() => shuffled(allMovies).slice(0, 20), [allMovies]);
  const upcomingMovies = useMemo(() => shuffled(allMovies).slice(0, 15), [allMovies]);
  const newReleases = useMemo(() => [...allMovies].slice(0, 20), [allMovies]);

  const actionMovies = useMemo(() => {
    return allMovies.filter((m) => m.genre.toLowerCase().includes("action")).slice(0, 20);
  }, [allMovies]);

  const romanceMovies = useMemo(() => {
    return allMovies.filter((m) =>
      m.genre.toLowerCase().includes("romance") || m.genre.toLowerCase().includes("love")
    ).slice(0, 20);
  }, [allMovies]);

  const thrillerMovies = useMemo(() => {
    return allMovies.filter((m) =>
      m.genre.toLowerCase().includes("thriller") || m.genre.toLowerCase().includes("mystery")
    ).slice(0, 20);
  }, [allMovies]);

  return (
    <>
      <HeroBanner movies={highRated.length >= 5 ? highRated : allMovies} />

      <div className="relative z-10 -mt-4 space-y-2 pb-8">
        <MovieRow title="Trending Now" subtitle="What everyone is watching">
          {trendingMovies.map((item) => (
            <MovieRowCard key={`trending-${item.id}`} item={item} />
          ))}
        </MovieRow>

        <Top10Section movies={highRated} />

        <MovieRow title="New Releases" subtitle="Just added to MFLIX">
          {newReleases.map((item) => (
            <MovieRowCard key={`new-${item.id}`} item={item} />
          ))}
        </MovieRow>

        <UpcomingSection movies={upcomingMovies} />

        {movies.length > 0 && (
          <MovieRow title="Popular Movies" subtitle="Bollywood & Hollywood hits">
            {movies.slice(0, 20).map((item) => (
              <MovieRowCard key={`pmov-${item.id}`} item={item} />
            ))}
          </MovieRow>
        )}

        {series.length > 0 && (
          <MovieRow title="Binge-Worthy Series" subtitle="Top web series to watch">
            {series.slice(0, 20).map((item) => (
              <MovieRowCard key={`ser-${item.id}`} item={item} variant="landscape" />
            ))}
          </MovieRow>
        )}

        {actionMovies.length > 0 && (
          <MovieRow title="Action & Adventure" subtitle="High-octane thrills">
            {actionMovies.map((item) => (
              <MovieRowCard key={`action-${item.id}`} item={item} />
            ))}
          </MovieRow>
        )}

        {anime.length > 0 && (
          <MovieRow title="Anime Collection" subtitle="Japanese animation picks">
            {anime.slice(0, 20).map((item) => (
              <MovieRowCard key={`ani-${item.id}`} item={item} />
            ))}
          </MovieRow>
        )}

        {romanceMovies.length > 0 && (
          <MovieRow title="Romance & Drama" subtitle="Stories of love">
            {romanceMovies.map((item) => (
              <MovieRowCard key={`rom-${item.id}`} item={item} />
            ))}
          </MovieRow>
        )}

        {thrillerMovies.length > 0 && (
          <MovieRow title="Thriller & Mystery" subtitle="Edge of your seat">
            {thrillerMovies.map((item) => (
              <MovieRowCard key={`thr-${item.id}`} item={item} variant="landscape" />
            ))}
          </MovieRow>
        )}

        <MovieRow title="All Content" subtitle="Browse everything">
          {allMovies.slice(0, 30).map((item) => (
            <MovieRowCard key={`all-${item.id}`} item={item} />
          ))}
        </MovieRow>
      </div>
    </>
  );
}

type TabSectionProps = {
  loading: boolean;
  allMovies: MovieItem[];
  items: MovieItem[];
  searchTerm: string;
  tabId: TabId;
};

function TabSection({ loading, allMovies, items, searchTerm, tabId }: TabSectionProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (tabId === "home" && !searchTerm) {
    return <HomeTabContent allMovies={allMovies} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-3 text-4xl opacity-30">🎬</div>
        <p className="text-sm text-mflix-text-muted">
          {searchTerm
            ? `No results found for "${searchTerm}"`
            : tabId === "home"
              ? "No Data Found"
              : "Nothing here yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 px-3 py-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
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
    <div className="relative h-[100dvh] overflow-hidden bg-mflix-bg text-white">
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
            className="h-[100dvh] w-[100vw] shrink-0 overflow-y-auto pt-[96px]"
          >
            <TabSection
              loading={loading}
              allMovies={allMovies}
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
