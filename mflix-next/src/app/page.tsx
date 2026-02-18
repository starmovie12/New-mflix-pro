"use client";

import { useCallback, useMemo, useState } from "react";
import { SearchHeader } from "@/components/SearchHeader";
import { TabBar, type TabId } from "@/components/TabBar";
import { SwipeContainer } from "@/components/SwipeContainer";
import { MovieGrid } from "@/components/MovieGrid";
import { useMovies } from "@/hooks/useMovies";

const TAB_ORDER: TabId[] = ["home", "movies", "tvshow", "anime", "adult"];

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<TabId>("home");
  const [searchTerm, setSearchTerm] = useState("");
  const { isLoading, getFilteredMovies } = useMovies();

  const tabIndex = TAB_ORDER.indexOf(currentTab);

  const handleTabChange = useCallback((tab: TabId) => {
    setCurrentTab(tab);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim() && currentTab !== "home") {
      setCurrentTab("home");
    }
  }, [searchTerm, currentTab]);

  const contentPanels = useMemo(() => {
    return TAB_ORDER.map((tabId) => {
      const filtered = getFilteredMovies(tabId, searchTerm);
      const emptyMsg = searchTerm
        ? `No results found for "${searchTerm}"`
        : "Nothing here";
      return (
        <section
          key={tabId}
          className="w-screen shrink-0 box-border pt-[110px] h-full overflow-y-auto pb-20"
        >
          <MovieGrid
            items={filtered}
            isLoading={isLoading && tabId === "home"}
            emptyMessage={emptyMsg}
          />
        </section>
      );
    });
  }, [getFilteredMovies, searchTerm, isLoading]);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300">
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
        />
        <TabBar activeTab={currentTab} onTabChange={handleTabChange} />
      </header>

      <SwipeContainer
        activeIndex={tabIndex}
        onSwipe={(index) => setCurrentTab(TAB_ORDER[index])}
      >
        {contentPanels}
      </SwipeContainer>
    </div>
  );
}
