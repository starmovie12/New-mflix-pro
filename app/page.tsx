"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { TabBar } from "@/components/TabBar";
import { CatalogSwipe } from "@/components/CatalogSwipe";
import { useMoviesById } from "@/lib/hooks/useMoviesById";

export default function HomePage() {
  const { loading, error, movies } = useMoviesById();
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setSearchTerm(searchDraft.trim().toLowerCase()), 50);
    return () => window.clearTimeout(t);
  }, [searchDraft]);

  useEffect(() => {
    if (activeIndex !== 0 && searchTerm.length > 0) setActiveIndex(0);
  }, [activeIndex, searchTerm]);

  const topMessage = useMemo(() => {
    if (error) return error;
    if (loading) return "Loading… (Add Firebase keys to .env.local to load real data)";
    return "";
  }, [loading, error]);

  return (
    <div className="bg-mflix-bg text-white">
      <TopBar search={searchDraft} onSearchChange={setSearchDraft} onGo={() => setSearchTerm(searchDraft)} />
      <TabBar activeIndex={activeIndex} onSelect={setActiveIndex} />

      {topMessage ? (
        <div className="pt-[110px]">
          <div className="mx-auto max-w-xl px-4 py-6 text-center text-sm text-white/70">{topMessage}</div>
        </div>
      ) : null}

      <CatalogSwipe
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        allMovies={movies}
        searchTerm={searchTerm}
      />
    </div>
  );
}

