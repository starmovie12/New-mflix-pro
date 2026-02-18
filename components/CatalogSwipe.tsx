"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TAB_CONFIG } from "@/lib/constants";
import { filterByTab, searchFilter, type MflixMovie } from "@/lib/movies";
import { MovieCard } from "@/components/MovieCard";

const minSwipeDistance = 50;

function Grid({ items, empty }: { items: MflixMovie[]; empty: string }) {
  if (items.length === 0) {
    return <div className="col-span-full mt-[50px] text-center text-[13px] text-[#777]">{empty}</div>;
  }

  return (
    <>
      {items.slice(0, 100).map((item, idx) => (
        <MovieCard key={String(item.movie_id || idx)} item={item} />
      ))}
    </>
  );
}

export function CatalogSwipe({
  activeIndex,
  onIndexChange,
  allMovies,
  searchTerm
}: {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  allMovies: MflixMovie[];
  searchTerm: string;
}) {
  const [loadingTab, setLoadingTab] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const perTab = useMemo(() => {
    return TAB_CONFIG.map((t) => {
      const byTab = filterByTab(allMovies, t.id);
      const bySearch = searchTerm ? searchFilter(byTab, searchTerm) : byTab;
      return bySearch;
    });
  }, [allMovies, searchTerm]);

  const switchTab = useCallback(
    (index: number) => {
      if (index < 0 || index >= TAB_CONFIG.length) return;
      setLoadingTab(TAB_CONFIG[index].id);
      onIndexChange(index);
      // Reset scroll for the newly selected page
      const el = document.getElementById(`mflix-tab-scroll-${TAB_CONFIG[index].id}`);
      if (el) el.scrollTop = 0;
      window.setTimeout(() => setLoadingTab(null), 250);
    },
    [onIndexChange]
  );

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0]?.screenX ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0]?.screenX ?? 0;
      const distance = touchEndX.current - touchStartX.current;
      if (distance > minSwipeDistance && activeIndex > 0) switchTab(activeIndex - 1);
      else if (distance < -minSwipeDistance && activeIndex < TAB_CONFIG.length - 1) switchTab(activeIndex + 1);
    };

    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeIndex, switchTab]);

  return (
    <div className="h-dvh w-full overflow-hidden pt-[110px]">
      <div
        className="flex h-dvh w-[500vw] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${activeIndex * 100}vw)` }}
      >
        {TAB_CONFIG.map((t, idx) => {
          const items = perTab[idx] ?? [];
          const emptyText = searchTerm ? `No results found for "${searchTerm}"` : "Nothing here";
          return (
            <section
              key={t.id}
              id={t.id}
              className="h-full w-screen shrink-0 overflow-y-auto pb-[80px]"
              style={{ WebkitOverflowScrolling: "touch" as any }}
            >
              <div className="mx-auto w-full">
                {loadingTab === t.id ? (
                  <div className="mx-auto mt-[50px] h-[30px] w-[30px] animate-spin rounded-full border-[3px] border-white/10 border-t-mflix-red" />
                ) : null}
                <main
                  id={`mflix-tab-scroll-${t.id}`}
                  className="grid grid-cols-3 gap-y-[15px] gap-x-2 px-2 pt-[10px]"
                >
                  <Grid items={items} empty={emptyText} />
                </main>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

