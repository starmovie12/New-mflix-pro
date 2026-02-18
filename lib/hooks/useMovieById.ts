"use client";

import { useEffect, useMemo, useState } from "react";
import { get, ref } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import type { MflixMovie } from "@/lib/movies";

type State = {
  loading: boolean;
  error: string | null;
  item: MflixMovie | null;
};

export function useMovieById(id: string): State {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<MflixMovie | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const db = getFirebaseDatabase();
        const snap = await get(ref(db, `movies_by_id/${id}`));
        if (!mounted) return;
        if (!snap.exists()) {
          setItem(null);
          setError("Content not found");
          return;
        }
        setItem(snap.val() as MflixMovie);
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
  }, [id]);

  return useMemo(() => ({ loading, error, item }), [loading, error, item]);
}

