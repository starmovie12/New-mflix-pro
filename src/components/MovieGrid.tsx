"use client";

import MovieCard from "./MovieCard";
import type { MovieItem } from "@/lib/types";

interface MovieGridProps {
  items: MovieItem[];
  searchTerm?: string;
}

export default function MovieGrid({ items, searchTerm }: MovieGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-12 px-4">
        {searchTerm
          ? `No results found for "${searchTerm}"`
          : "Nothing here yet"}
      </div>
    );
  }

  return (
    <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4 p-2">
      {items.map((item) => (
        <MovieCard key={item.id} item={item} />
      ))}
    </main>
  );
}
