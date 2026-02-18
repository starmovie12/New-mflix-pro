"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { normalizeItem } from "@/lib/normalize";
import { TAB_CONFIG } from "@/lib/utils";
import type { MovieItem } from "@/lib/types";
import SearchHeader from "@/components/SearchHeader";
import TabBar from "@/components/TabBar";
import MovieGrid from "@/components/MovieGrid";

const PAGE_SIZE = 100;

function filterByTab(items: MovieItem[], tabId: string): MovieItem[] {
  switch (tabId) {
    case "home":
      return items;
    case "movies":
      return items.filter((m) => m.tabCategory === "movies" && !m.adult);
    case "tvshow":
      return items.filter((m) => m.tabCategory === "tvshow");
    case "anime":
      return items.filter((m) => m.tabCategory === "anime");
    case "adult":
      return items.filter((m) => m.adult || m.tabCategory === "adult");
    default:
      return items;
  }
}

function searchItems(items: MovieItem[], term: string): MovieItem[] {
  if (!term) return items;
  return items.filter((item) => item.searchBlob.includes(term));
}

export default function HomePage() {
  const [allItems, setAllItems] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);

  const swipeRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const snapshot = await get(ref(db, "movies_by_id"));
        if (snapshot.exists()) {
          const raw = snapshot.val();
          const entries: [string, unknown][] = Array.isArray(raw)
            ? raw.map((value: unknown, index: number) => [String(index), value] as [string, unknown])
            : Object.entries(raw);

          const normalized = entries
            .filter(([, value]) => value && typeof value === "object")
            .map(([key, value]) =>
              normalizeItem(value as Record<string, unknown>, key)
            );

          setAllItems(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleTabChange = useCallback(
    (index: number) => {
      setCurrentTab(index);
      setHeaderVisible(true);

      const titles: Record<string, string> = {
        Home: "MFLIX - Watch Free HD Movies, Series & Anime Online",
        Movies: "MFLIX - Browse New Bollywood & Hollywood Movies",
        Series: "MFLIX - Watch Popular Web Series Online Free",
        Anime: "MFLIX - Watch Anime Online English Sub/Dub",
        "18+": "MFLIX - 18+ Content Warning",
      };
      document.title = titles[TAB_CONFIG[index].label] || "MFLIX - Movies & Series";
    },
    []
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (term.length > 0 && currentTab !== 0) {
        setCurrentTab(0);
      }
    },
    [currentTab]
  );

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const distance = touchEndX - touchStartX.current;
      const minSwipeDistance = 50;

      if (distance > minSwipeDistance && currentTab > 0) {
        handleTabChange(currentTab - 1);
      } else if (distance < -minSwipeDistance && currentTab < TAB_CONFIG.length - 1) {
        handleTabChange(currentTab + 1);
      }
    },
    [currentTab, handleTabChange]
  );

  // Scroll-based header hide/show
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const st = e.currentTarget.scrollTop;
    if (st > 50 && st > lastScrollTop.current) {
      setHeaderVisible(false);
    } else {
      setHeaderVisible(true);
    }
    lastScrollTop.current = st;
  }, []);

  const tabId = TAB_CONFIG[currentTab].id;
  const filtered = filterByTab(allItems, tabId);
  const displayed = searchItems(filtered, searchTerm).slice(0, PAGE_SIZE);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <SearchHeader searchTerm={searchTerm} onSearch={handleSearch} />
        <TabBar
          tabs={TAB_CONFIG}
          activeIndex={currentTab}
          onTabChange={handleTabChange}
        />
      </header>

      {/* Swipe Content */}
      <div
        ref={swipeRef}
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="swipe-container h-full"
          style={{
            width: `${TAB_CONFIG.length * 100}vw`,
            transform: `translateX(-${currentTab * 100}vw)`,
          }}
        >
          {TAB_CONFIG.map((tab, index) => {
            const isActive = index === currentTab;
            const tabFiltered = isActive
              ? displayed
              : searchItems(filterByTab(allItems, tab.id), searchTerm).slice(0, PAGE_SIZE);

            return (
              <section
                key={tab.id}
                className="w-screen flex-shrink-0 h-full overflow-y-auto pt-[110px] pb-20"
                onScroll={isActive ? handleScroll : undefined}
              >
                {loading ? (
                  <div className="flex justify-center mt-12">
                    <div className="spinner" />
                  </div>
                ) : (
                  <MovieGrid items={tabFiltered} searchTerm={searchTerm} />
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
