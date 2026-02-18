"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { fetchMovies, TABS, type TabId } from "@/lib/movies";
import type { MovieItem } from "@/types/movie";
import { MovieCard } from "@/components/MovieCard";
import { SearchHeader } from "@/components/SearchHeader";
import { TabBar } from "@/components/TabBar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { RailRow } from "@/components/home/RailRow";
import { PosterTile } from "@/components/home/PosterTile";

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

function asNumber(value: string) {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function yearNumber(value: string) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
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
    <div className="grid grid-cols-3 gap-y-[15px] gap-x-2 px-2 py-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
      {items.slice(0, MAX_ITEMS_PER_TAB).map((item) => (
        <MovieCard key={`${tabId}-${item.id}`} item={item} />
      ))}
    </div>
  );
}

type HomeFeedProps = {
  items: MovieItem[];
};

function HomeFeed({ items }: HomeFeedProps) {
  const safeItems = useMemo(() => items.filter((item) => !item.adult), [items]);

  const featured = useMemo(() => {
    const sorted = [...safeItems].sort((a, b) => {
      const scoreA = asNumber(a.rating) * 10 + yearNumber(a.year) / 100;
      const scoreB = asNumber(b.rating) * 10 + yearNumber(b.year) / 100;
      return scoreB - scoreA;
    });
    return sorted[0] || null;
  }, [safeItems]);

  const topTen = useMemo(() => {
    return [...safeItems]
      .filter((item) => item.poster)
      .sort((a, b) => {
        const byRating = asNumber(b.rating) - asNumber(a.rating);
        if (byRating !== 0) return byRating;
        return yearNumber(b.year) - yearNumber(a.year);
      })
      .slice(0, 10);
  }, [safeItems]);

  const upcoming = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const tagged = safeItems.filter((item) => {
      const year = yearNumber(item.year);
      const blob = `${item.title} ${item.genre} ${item.category} ${item.searchBlob}`.toLowerCase();
      return year >= currentYear || blob.includes("upcoming") || blob.includes("coming soon");
    });

    const list = (tagged.length ? tagged : safeItems)
      .sort((a, b) => yearNumber(b.year) - yearNumber(a.year))
      .slice(0, 20);

    return list;
  }, [safeItems]);

  const moviesRail = useMemo(() => {
    return safeItems
      .filter((item) => item.category.includes("movie"))
      .sort((a, b) => yearNumber(b.year) - yearNumber(a.year))
      .slice(0, 20);
  }, [safeItems]);

  const seriesRail = useMemo(() => {
    return safeItems
      .filter((item) => item.isSeries || item.category.includes("series") || item.category.includes("tv"))
      .sort((a, b) => yearNumber(b.year) - yearNumber(a.year))
      .slice(0, 20);
  }, [safeItems]);

  const animeRail = useMemo(() => {
    return safeItems
      .filter((item) => item.category.includes("anime"))
      .sort((a, b) => yearNumber(b.year) - yearNumber(a.year))
      .slice(0, 20);
  }, [safeItems]);

  return (
    <div className="pb-6">
      <HeroBanner item={featured} />

      <div className="mt-6 space-y-7">
        <RailRow title="Top 10 Today" subtitle="Most loved picks right now">
          {topTen.map((item, index) => (
            <div key={item.id} className="pl-7">
              <PosterTile item={item} rank={index + 1} />
            </div>
          ))}
        </RailRow>

        <RailRow title="Upcoming" subtitle="New & upcoming releases">
          {upcoming.map((item) => (
            <PosterTile key={item.id} item={item} size="sm" />
          ))}
        </RailRow>

        <RailRow title="Movies" subtitle="Latest movies in HD">
          {moviesRail.map((item) => (
            <PosterTile key={item.id} item={item} size="sm" />
          ))}
        </RailRow>

        <RailRow title="Series" subtitle="Binge-worthy web series">
          {seriesRail.map((item) => (
            <PosterTile key={item.id} item={item} size="sm" />
          ))}
        </RailRow>

        <RailRow title="Anime" subtitle="Sub/Dub anime picks">
          {animeRail.map((item) => (
            <PosterTile key={item.id} item={item} size="sm" />
          ))}
        </RailRow>
      </div>
    </div>
  );
}

export function HomeClient() {
  const [allMovies, setAllMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [headerHidden, setHeaderHidden] = useState(false);

  const touchStartX = useRef(0);
  const minSwipeDistance = 50;
  const lastScroll = useRef<number[]>(Array.from({ length: TABS.length }).map(() => 0));

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

  useEffect(() => {
    const titles: Record<string, string> = {
      Home: "MFLIX - Watch Free HD Movies, Series & Anime Online",
      Movies: "MFLIX - Browse New Bollywood & Hollywood Movies",
      Series: "MFLIX - Watch Popular Web Series Online Free",
      Anime: "MFLIX - Watch Anime Online English Sub/Dub",
      "18+": "MFLIX - 18+ Content Warning"
    };

    const tabLabel = TABS[currentTabIndex]?.label || "MFLIX";
    document.title = titles[tabLabel] || "MFLIX - Movies & Series";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        `Watch the best ${tabLabel} collection on MFLIX. High Quality streaming, fast loading.`
      );
    }
  }, [currentTabIndex]);

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
    setHeaderHidden(false);
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(211,47,47,0.18),transparent_55%),radial-gradient(900px_500px_at_90%_10%,rgba(41,98,255,0.14),transparent_60%)]" />

      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ease-out ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
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
        {TABS.map((tab, index) => (
          <section
            key={tab.id}
            className={`h-[100dvh] w-[100vw] shrink-0 overflow-y-auto pb-20 ${
              headerHidden ? "pt-4" : "pt-[110px]"
            }`}
            onScroll={(event) => {
              if (index !== currentTabIndex) return;
              const st = (event.target as HTMLElement).scrollTop;
              const last = lastScroll.current[index] ?? 0;
              const down = st > last;
              if (down && st > 70) setHeaderHidden(true);
              if (!down && st < 50) setHeaderHidden(false);
              lastScroll.current[index] = st;
            }}
          >
            {tab.id === "home" && !searchTerm ? (
              loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/15 border-t-[#d32f2f]" />
                </div>
              ) : (
                <HomeFeed items={tabResults.home || []} />
              )
            ) : (
              <TabSection
                loading={loading}
                items={tabResults[tab.id] || []}
                searchTerm={searchTerm}
                tabId={tab.id}
              />
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
