"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  Crown,
  Flame,
  Play,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { fetchMovies, TABS, type TabId } from "@/lib/movies";
import type { MovieItem } from "@/types/movie";
import { MovieCard } from "@/components/MovieCard";
import { SearchHeader } from "@/components/SearchHeader";
import { TabBar } from "@/components/TabBar";

const MAX_ITEMS_PER_TAB = 100;
const HOME_RAIL_LIMIT = 16;
const UPCOMING_LIMIT = 14;
const TOP_TEN_LIMIT = 10;
const HERO_DESCRIPTION_LIMIT = 170;

const TAB_TITLES: Record<TabId, string> = {
  home: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  movies: "MFLIX - Browse New Bollywood & Hollywood Movies",
  tvshow: "MFLIX - Watch Popular Web Series Online Free",
  anime: "MFLIX - Watch Anime Online English Sub/Dub",
  adult: "MFLIX - 18+ Content Warning"
};

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

function parseYear(value: string): number {
  const match = value.match(/\d{4}/);
  if (!match) return 0;
  const year = Number.parseInt(match[0], 10);
  return Number.isFinite(year) ? year : 0;
}

function parseRating(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  const rating = Number.parseFloat(normalized);
  return Number.isFinite(rating) ? rating : 0;
}

function rankScore(item: MovieItem): number {
  return parseRating(item.rating) * 100 + parseYear(item.year);
}

function shortText(text: string, limit = HERO_DESCRIPTION_LIMIT): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}...`;
}

function getUpcoming(items: MovieItem[]): MovieItem[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const upcoming = items.filter((item) => {
    const year = parseYear(item.year);
    const status = String(item.raw.status || item.raw.release_status || "").toLowerCase();
    const releaseDateRaw = String(item.raw.release_date || item.raw.releaseDate || "");
    const parsedDate = releaseDateRaw ? new Date(releaseDateRaw) : null;
    const hasFutureDate = Boolean(
      parsedDate &&
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.getTime() > now.getTime()
    );
    return (
      year > currentYear ||
      hasFutureDate ||
      status.includes("upcoming") ||
      status.includes("soon")
    );
  });

  if (upcoming.length > 0) {
    return upcoming
      .sort((a, b) => parseYear(b.year) - parseYear(a.year) || rankScore(b) - rankScore(a))
      .slice(0, UPCOMING_LIMIT);
  }

  return [...items]
    .sort((a, b) => parseYear(b.year) - parseYear(a.year) || rankScore(b) - rankScore(a))
    .slice(0, UPCOMING_LIMIT);
}

type SectionTitleProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

function SectionTitle({ title, subtitle, icon: Icon }: SectionTitleProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h2>
        <p className="mt-0.5 text-xs text-white/60 sm:text-sm">{subtitle}</p>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-[#4ca6ff]">
        <Icon size={16} />
      </span>
    </div>
  );
}

type PosterRailCardProps = {
  item: MovieItem;
};

function PosterRailCard({ item }: PosterRailCardProps) {
  return (
    <Link href={`/watch/${item.id}`} className="group block w-[140px] shrink-0 sm:w-[168px]">
      <article className="overflow-hidden rounded-xl border border-white/10 bg-[#101014] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={item.poster}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 38vw, 168px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <span className="absolute left-2 top-2 rounded-md border border-white/25 bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold">
            {item.qualityName}
          </span>
          <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
            <p className="truncate text-xs font-semibold text-white">{item.title}</p>
            <p className="mt-0.5 text-[10px] text-white/75">
              {item.year} • {item.rating} ★
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

type TopTenRailProps = {
  items: MovieItem[];
};

function TopTenRail({ items }: TopTenRailProps) {
  if (!items.length) return null;

  return (
    <section className="space-y-2.5">
      <SectionTitle
        title="Top 10 Movies"
        subtitle="Most loved titles right now"
        icon={Crown}
      />
      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => (
          <Link
            key={`top-10-${item.id}`}
            href={`/watch/${item.id}`}
            className="group block w-[182px] shrink-0 pl-8 sm:w-[204px]"
          >
            <article className="relative">
              <span
                className="absolute -left-8 bottom-1 text-7xl font-black text-white/25 transition-colors duration-300 group-hover:text-[#e50914]"
                style={{ textShadow: "0 10px 24px rgba(0, 0, 0, 0.85)" }}
              >
                {index + 1}
              </span>
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image
                  src={item.poster}
                  alt={`${item.title} top ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 42vw, 204px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                  <p className="truncate text-xs font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-white/75">
                    {item.year} • {item.rating} ★
                  </p>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

type RailSectionProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  items: MovieItem[];
};

function RailSection({ title, subtitle, icon, items }: RailSectionProps) {
  if (!items.length) return null;

  return (
    <section className="space-y-2.5">
      <SectionTitle title={title} subtitle={subtitle} icon={icon} />
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <PosterRailCard key={`${title}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}

type HomeShowcaseProps = {
  featured: MovieItem | null;
  topTen: MovieItem[];
  upcoming: MovieItem[];
  trending: MovieItem[];
  movies: MovieItem[];
  series: MovieItem[];
  anime: MovieItem[];
};

function HomeShowcase({
  featured,
  topTen,
  upcoming,
  trending,
  movies,
  series,
  anime
}: HomeShowcaseProps) {
  if (!featured) {
    return <p className="mt-12 text-center text-sm text-[#777]">No Data Found</p>;
  }

  return (
    <div className="space-y-6 px-3 pb-12 pt-4 sm:px-5">
      <section className="relative min-h-[270px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
        <Image
          src={featured.poster}
          alt={featured.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full max-w-[80%] flex-col justify-end gap-2 p-5 sm:max-w-[62%] sm:p-8">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
            <Sparkles size={12} />
            Featured Premiere
          </p>
          <h1 className="text-2xl font-bold leading-tight text-white sm:text-4xl">
            {featured.title}
          </h1>
          <p className="text-xs text-white/75 sm:text-sm">
            {featured.year} • {featured.genre} • {featured.runtime}
          </p>
          <p className="max-w-[640px] text-xs leading-5 text-white/80 sm:text-sm">
            {shortText(featured.description)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/watch/${featured.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              <Play size={16} fill="currentColor" />
              Watch Now
            </Link>
            <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white/80">
              {featured.qualityName}
            </span>
            <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white/80">
              {featured.rating} ★
            </span>
          </div>
        </div>
      </section>

      <TopTenRail items={topTen} />

      <RailSection
        title="Upcoming Movies"
        subtitle="Fresh titles landing soon"
        icon={CalendarClock}
        items={upcoming}
      />

      <RailSection
        title="Trending Now"
        subtitle="Popular picks from all categories"
        icon={Flame}
        items={trending}
      />

      <RailSection
        title="Blockbuster Movies"
        subtitle="Cinema hits in HD quality"
        icon={Sparkles}
        items={movies}
      />

      <RailSection
        title="Binge-worthy Series"
        subtitle="Continue your next long watch"
        icon={Crown}
        items={series}
      />

      <RailSection
        title="Anime Spotlight"
        subtitle="Subbed and dubbed anime picks"
        icon={Sparkles}
        items={anime}
      />
    </div>
  );
}

type CategoryShowcaseProps = {
  tabId: TabId;
  items: MovieItem[];
};

function CategoryShowcase({ tabId, items }: CategoryShowcaseProps) {
  const label = TABS.find((tab) => tab.id === tabId)?.label || "Browse";
  const featured = items[0];

  if (!items.length) {
    return <p className="mt-12 text-center text-sm text-[#777]">Nothing here</p>;
  }

  return (
    <div className="space-y-5 px-3 pb-12 pt-4 sm:px-5">
      {tabId === "adult" ? (
        <section className="rounded-2xl border border-red-500/40 bg-red-950/30 p-4">
          <p className="text-sm font-semibold text-red-200">18+ Restricted Zone</p>
          <p className="mt-1 text-xs leading-5 text-red-100/90">
            This section may include mature titles. Please browse responsibly.
          </p>
        </section>
      ) : null}

      {featured ? (
        <section className="relative min-h-[210px] overflow-hidden rounded-2xl border border-white/10 bg-black">
          <Image
            src={featured.poster}
            alt={featured.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
          <div className="relative z-10 flex h-full max-w-[75%] flex-col justify-end gap-2 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">{label}</p>
            <h2 className="text-2xl font-bold text-white">{featured.title}</h2>
            <p className="text-xs text-white/75">
              {featured.year} • {featured.genre}
            </p>
            <Link
              href={`/watch/${featured.id}`}
              className="mt-1 inline-flex h-9 w-fit items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black"
            >
              <Play size={14} fill="currentColor" />
              Play
            </Link>
          </div>
        </section>
      ) : null}

      <RailSection
        title={`Popular in ${label}`}
        subtitle={`${items.length} titles available`}
        icon={Flame}
        items={items.slice(0, HOME_RAIL_LIMIT)}
      />

      <section className="space-y-2">
        <SectionTitle
          title={`All ${label}`}
          subtitle="Browse complete catalog"
          icon={Sparkles}
        />
        <div className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-4 md:grid-cols-5">
          {items.slice(0, MAX_ITEMS_PER_TAB).map((item) => (
            <MovieCard key={`${tabId}-${item.id}`} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

type TabSectionProps = {
  loading: boolean;
  items: MovieItem[];
  searchTerm: string;
  tabId: TabId;
  homeShowcase: HomeShowcaseProps;
};

function TabSection({ loading, items, searchTerm, tabId, homeShowcase }: TabSectionProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/15 border-t-[#d32f2f]" />
      </div>
    );
  }

  if (searchTerm) {
    if (items.length === 0) {
      return (
        <p className="mt-12 text-center text-sm text-[#777]">
          {`No results found for "${searchTerm}"`}
        </p>
      );
    }

    return (
      <div className="space-y-2 px-3 pb-12 pt-4 sm:px-5">
        <SectionTitle
          title={`Search Results`}
          subtitle={`${items.length} titles found for "${searchTerm}"`}
          icon={Sparkles}
        />
        <div className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-4 md:grid-cols-5">
          {items.slice(0, MAX_ITEMS_PER_TAB).map((item) => (
            <MovieCard key={`${tabId}-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0 && tabId !== "home") {
    return (
      <p className="mt-12 text-center text-sm text-[#777]">Nothing here</p>
    );
  }

  if (tabId === "home") return <HomeShowcase {...homeShowcase} />;

  return <CategoryShowcase tabId={tabId} items={items} />;
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

  useEffect(() => {
    if (searchTerm) {
      document.title = `Search "${searchTerm}" • MFLIX`;
      return;
    }
    const activeTab = TABS[currentTabIndex];
    if (!activeTab) return;
    document.title = TAB_TITLES[activeTab.id];
  }, [currentTabIndex, searchTerm]);

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

  const safeCatalog = useMemo(
    () => allMovies.filter((item) => !item.adult),
    [allMovies]
  );

  const featured = useMemo(() => {
    return (
      [...safeCatalog].sort((a, b) => rankScore(b) - rankScore(a))[0] || null
    );
  }, [safeCatalog]);

  const topTen = useMemo(() => {
    return [...byTab(safeCatalog, "movies")]
      .sort((a, b) => rankScore(b) - rankScore(a))
      .slice(0, TOP_TEN_LIMIT);
  }, [safeCatalog]);

  const upcoming = useMemo(() => getUpcoming(safeCatalog), [safeCatalog]);

  const trending = useMemo(() => {
    return [...safeCatalog]
      .sort((a, b) => rankScore(b) - rankScore(a))
      .slice(0, HOME_RAIL_LIMIT);
  }, [safeCatalog]);

  const movieRail = useMemo(
    () => byTab(safeCatalog, "movies").slice(0, HOME_RAIL_LIMIT),
    [safeCatalog]
  );

  const seriesRail = useMemo(
    () => byTab(safeCatalog, "tvshow").slice(0, HOME_RAIL_LIMIT),
    [safeCatalog]
  );

  const animeRail = useMemo(
    () => byTab(safeCatalog, "anime").slice(0, HOME_RAIL_LIMIT),
    [safeCatalog]
  );

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1f37_0%,#07080f_40%,#050505_72%)]" />
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
        className="relative flex h-[100dvh] transition-transform duration-300 ease-out"
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
            className="h-[100dvh] w-[100vw] shrink-0 overflow-y-auto pb-20 pt-[128px]"
          >
            <TabSection
              loading={loading}
              items={tabResults[tab.id] || []}
              searchTerm={searchTerm}
              tabId={tab.id}
              homeShowcase={{
                featured,
                topTen,
                upcoming,
                trending,
                movies: movieRail,
                series: seriesRail,
                anime: animeRail
              }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
