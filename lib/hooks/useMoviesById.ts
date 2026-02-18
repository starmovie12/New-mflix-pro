"use client";

import { useEffect, useMemo, useState } from "react";
import { get } from "firebase/database";
import { ref } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import type { MflixMovie } from "@/lib/movies";

type State = {
  loading: boolean;
  error: string | null;
  movies: MflixMovie[];
};

export function useMoviesById(): State {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<MflixMovie[]>([]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const db = getFirebaseDatabase();
        const snap = await get(ref(db, "movies_by_id"));
        if (!mounted) return;

        if (!snap.exists()) {
          setMovies([]);
          return;
        }

        const value = snap.val();
        const arr = Array.isArray(value) ? value : Object.values(value || {});
        setMovies(arr as MflixMovie[]);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load content");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => ({ loading, error, movies }), [loading, error, movies]);
}

