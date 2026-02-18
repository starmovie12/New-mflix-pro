"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { MovieItem } from "@/lib/types";
import { SEARCH_FIELDS } from "@/lib/utils";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import MovieGrid from "@/components/MovieGrid";
import LoadingSpinner from "@/components/LoadingSpinner";

const TABS = [
  { id: "home", label: "Home" },
  { id: "movies", label: "Movies" },
  { id: "tvshow", label: "Series" },
  { id: "anime", label: "Anime" },
  { id: "adult", label: "18+" },
];

const TAB_META_TITLES: Record<string, string> = {
  Home: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  Movies: "MFLIX - Browse New Bollywood & Hollywood Movies",
  Series: "MFLIX - Watch Popular Web Series Online Free",
  Anime: "MFLIX - Watch Anime Online English Sub/Dub",
  "18+": "MFLIX - 18+ Content Warning",
};

const MAX_ITEMS = 100;

export default function HomePage() {
  const [allMovies, setAllMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);

  const touchStartX = useRef(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrollTop = useRef<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    async function fetchData() {
      if (!db) {
        console.warn("Firebase not initialized. Set .env.local variables.");
        setLoading(false);
        return;
      }
      try {
        const snapshot = await get(ref(db!, "movies_by_id"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const movies = Object.values(data) as MovieItem[];
          setAllMovies(movies);
        }
      } catch (e) {
        console.error("Failed to fetch movies:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const tabLabel = TABS[activeTab]?.label || "Home";
    document.title = TAB_META_TITLES[tabLabel] || "MFLIX - Movies & Series";
  }, [activeTab]);

  const filterMovies = useCallback(
    (tabIndex: number): MovieItem[] => {
      const tabId = TABS[tabIndex].id;
      const term = searchTerm.trim().toLowerCase();

      let filtered: MovieItem[];

      if (term.length > 0) {
        filtered = allMovies.filter((item) =>
          SEARCH_FIELDS.some((field) =>
            String(item[field] || "")
              .toLowerCase()
              .includes(term)
          )
        );
      } else {
        switch (tabId) {
          case "home":
            filtered = allMovies;
            break;
          case "movies":
            filtered = allMovies.filter((m) =>
              m.category?.toLowerCase().includes("movie")
            );
            break;
          case "tvshow":
            filtered = allMovies.filter((m) =>
              m.category?.toLowerCase().includes("series")
            );
            break;
          case "anime":
            filtered = allMovies.filter((m) =>
              m.category?.toLowerCase().includes("anime")
            );
            break;
          case "adult":
            filtered = allMovies.filter(
              (m) => m.adult_content === "true" || m.adult_content === true
            );
            break;
          default:
            filtered = allMovies;
        }
      }

      return filtered.slice(0, MAX_ITEMS);
    },
    [allMovies, searchTerm]
  );

  const currentMovies = useMemo(
    () => filterMovies(activeTab),
    [filterMovies, activeTab]
  );

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
    setHeaderVisible(true);
    const el = contentRefs.current[index];
    if (el) el.scrollTop = 0;
  }, []);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim().length > 0 && activeTab !== 0) {
      setActiveTab(0);
    }
  }, [searchTerm, activeTab]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const distance = touchEndX - touchStartX.current;
      const minSwipe = 50;

      if (distance > minSwipe && activeTab > 0) {
        setActiveTab((prev) => prev - 1);
      } else if (distance < -minSwipe && activeTab < TABS.length - 1) {
        setActiveTab((prev) => prev + 1);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeTab]);

  const handleScroll = useCallback(
    (index: number) => {
      const el = contentRefs.current[index];
      if (!el) return;
      const st = el.scrollTop;
      if (st > 50 && st > lastScrollTop.current[index]) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollTop.current[index] = st;
    },
    []
  );

  return (
    <div className="h-screen overflow-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Header
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
        />
        <TabBar
          tabs={TABS}
          activeIndex={activeTab}
          onTabChange={handleTabChange}
        />
      </header>

      <div
        className="flex transition-transform duration-300 ease-out h-screen"
        style={{
          width: `${TABS.length * 100}vw`,
          transform: `translateX(-${activeTab * 100}vw)`,
        }}
      >
        {TABS.map((tab, index) => (
          <div
            key={tab.id}
            ref={(el) => { contentRefs.current[index] = el; }}
            className="w-screen flex-shrink-0 box-border overflow-y-auto pb-20"
            style={{
              paddingTop: headerVisible ? "110px" : "10px",
              transition: "padding-top 0.3s ease",
            }}
            onScroll={() => handleScroll(index)}
          >
            {loading ? (
              <LoadingSpinner />
            ) : index === activeTab ? (
              <MovieGrid
                movies={currentMovies}
                searchTerm={searchTerm}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
