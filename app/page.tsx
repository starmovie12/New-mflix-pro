"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { get, ref } from "firebase/database";
import { TabBar, type TabId } from "@/components/TabBar";
import { SearchHeader } from "@/components/SearchHeader";
import { MovieCard, type MovieItem } from "@/components/MovieCard";
import { getFirebaseDatabase } from "@/lib/firebase";

const CONTENT_IDS: TabId[] = ["home", "movies", "tvshow", "anime", "adult"];

const SEARCH_FIELDS = [
  "title",
  "cast",
  "director",
  "genre",
  "industry",
  "keywords",
  "platform",
  "quality_name",
  "spoken_languages",
  "writer",
  "year",
  "category",
];

function filterByTab(tabId: TabId, data: MovieItem[], searchTerm: string): MovieItem[] {
  let filtered: MovieItem[];

  if (searchTerm.length > 0) {
    const q = searchTerm.toLowerCase();
    filtered = data.filter((item) =>
      SEARCH_FIELDS.some((field) => {
        const val = item[field as keyof MovieItem];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  } else {
    if (tabId === "home") filtered = data;
    else if (tabId === "movies")
      filtered = data.filter((m) => m.category?.toLowerCase().includes("movie"));
    else if (tabId === "tvshow")
      filtered = data.filter((m) => m.category?.toLowerCase().includes("series"));
    else if (tabId === "anime")
      filtered = data.filter((m) => m.category?.toLowerCase().includes("anime"));
    else if (tabId === "adult")
      filtered = data.filter((m) => m.adult_content === "true" || m.adult_content === true);
    else filtered = data;
  }

  return filtered;
}

export default function HomePage() {
  const [allMovieData, setAllMovieData] = useState<MovieItem[]>([]);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [headerHidden, setHeaderHidden] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const lastScrollRef = useRef<Record<string, number>>({});
  const contentRefs = useRef<Record<string, HTMLElement | null>>({});

  const currentTab = CONTENT_IDS[currentTabIndex];

  const fetchData = useCallback(async () => {
    try {
      const db = getFirebaseDatabase();
      const snapshot = await get(ref(db, "movies_by_id"));
      if (snapshot.exists()) {
        const val = snapshot.val();
        const arr = Array.isArray(val)
          ? val
          : Object.entries(val || {}).map(([k, v]) => ({
              ...(v as object),
              movie_id: k,
              id: k,
            }));
        setAllMovieData(arr);
      } else {
        setAllMovieData([]);
      }
    } catch (e) {
      console.error(e);
      setAllMovieData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const switchTab = useCallback(
    (index: number) => {
      if (index < 0 || index >= CONTENT_IDS.length) return;
      setCurrentTabIndex(index);
      setHeaderHidden(false);
      lastScrollRef.current[CONTENT_IDS[index]] = 0;
    },
    []
  );

  const handleTabChange = useCallback(
    (tabId: TabId) => {
      const idx = CONTENT_IDS.indexOf(tabId);
      if (idx >= 0) switchTab(idx);
    },
    [switchTab]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (value.length > 0 && currentTabIndex !== 0) {
        switchTab(0);
      }
    },
    [currentTabIndex, switchTab]
  );

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      const distance = touchEndX.current - touchStartX.current;
      const minSwipeDistance = 50;
      if (distance > minSwipeDistance && currentTabIndex > 0) {
        switchTab(currentTabIndex - 1);
      } else if (
        distance < -minSwipeDistance &&
        currentTabIndex < CONTENT_IDS.length - 1
      ) {
        switchTab(currentTabIndex + 1);
      }
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentTabIndex, switchTab]);

  const performSearch = useCallback(() => {
    if (searchTerm.length > 0 && currentTabIndex !== 0) {
      switchTab(0);
    }
  }, [searchTerm, currentTabIndex, switchTab]);

  const filteredItems = filterByTab(currentTab, allMovieData, searchTerm);
  const displayItems = filteredItems.slice(0, 100);

  return (
    <div className="min-h-screen overflow-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={performSearch}
        />
        <TabBar activeTab={currentTab} onTabChange={handleTabChange} />
      </header>

      <div
        className="flex w-[500vw] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          transform: `translateX(-${currentTabIndex * 100}vw)`,
        }}
      >
        {CONTENT_IDS.map((tabId) => (
          <section
            key={tabId}
            ref={(el) => {
              contentRefs.current[tabId] = el;
            }}
            className="w-screen shrink-0 box-border pt-[110px] h-screen overflow-y-auto overflow-x-hidden pb-20"
            onScroll={(e) => {
              const target = e.currentTarget;
              const st = target.scrollTop;
              const last = lastScrollRef.current[tabId] ?? 0;
              lastScrollRef.current[tabId] = st;
              if (st > 50 && st > last) {
                setHeaderHidden(true);
              } else {
                setHeaderHidden(false);
              }
            }}
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loading-spinner" />
              </div>
            ) : (
              <main className="grid grid-cols-3 gap-2 px-2 py-2.5 md:grid-cols-4 lg:grid-cols-5">
                {displayItems.length === 0 ? (
                  <div className="col-span-full text-center text-[#777] mt-12">
                    {searchTerm
                      ? `No results found for "${searchTerm}"`
                      : "Nothing here"}
                  </div>
                ) : (
                  displayItems.map((item) => (
                    <MovieCard
                      key={String(item.movie_id || item.id || Math.random())}
                      item={item}
                    />
                  ))
                )}
              </main>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
