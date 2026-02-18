"use client";

import { useCallback, useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import type { MovieItem } from "@/types/movie";
import type { TabId } from "@/components/TabBar";

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
] as const;

function filterByTab(items: MovieItem[], tabId: TabId): MovieItem[] {
  if (tabId === "home") return items;
  if (tabId === "movies")
    return items.filter((m) =>
      (m.category || "").toLowerCase().includes("movie")
    );
  if (tabId === "tvshow")
    return items.filter((m) =>
      (m.category || "").toLowerCase().includes("series")
    );
  if (tabId === "anime")
    return items.filter((m) =>
      (m.category || "").toLowerCase().includes("anime")
    );
  if (tabId === "adult")
    return items.filter((m) => m.adult_content === "true" || m.adult_content === true);
  return items;
}

function filterBySearch(items: MovieItem[], searchTerm: string): MovieItem[] {
  if (!searchTerm.trim()) return items;
  const term = searchTerm.trim().toLowerCase();
  return items.filter((item) =>
    SEARCH_FIELDS.some((field) => {
      const value = (item as Record<string, unknown>)[field];
      return value && String(value).toLowerCase().includes(term);
    })
  );
}

export function useMovies() {
  const [allMovies, setAllMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const snapshot = await get(ref(db, "movies_by_id"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const items = Array.isArray(data)
            ? data
            : Object.values(data || {});
          setAllMovies(items.filter((v): v is MovieItem => v && typeof v === "object"));
        } else {
          setAllMovies([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load movies");
        setAllMovies([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovies();
  }, []);

  const getFilteredMovies = useCallback(
    (tabId: TabId, searchTerm: string) => {
      const byTab = filterByTab(allMovies, tabId);
      return filterBySearch(byTab, searchTerm);
    },
    [allMovies]
  );

  return { allMovies, isLoading, error, getFilteredMovies };
}
