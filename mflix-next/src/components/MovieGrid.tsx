"use client";

import { MovieCard } from "./MovieCard";
import type { MovieItem } from "@/types/movie";

interface MovieGridProps {
  items: MovieItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function MovieGrid({
  items,
  isLoading,
  emptyMessage = "Nothing here",
}: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 gap-y-2 p-2.5 px-2">
        <div className="col-span-full flex justify-center py-12">
          <div
            className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#E50914] animate-spin"
            role="status"
            aria-label="Loading"
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 gap-y-2 p-2.5 px-2">
        <div className="col-span-full text-center text-[#777] mt-12">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <main className="grid grid-cols-3 gap-3 gap-y-2 p-2.5 px-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {items.slice(0, 100).map((item) => (
        <MovieCard
          key={getMovieId(item)}
          item={item}
        />
      ))}
    </main>
  );
}

function getMovieId(item: MovieItem): string {
  return String(item.movie_id || item.id || "");
}
