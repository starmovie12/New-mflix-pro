"use client";

import MovieCard from "./MovieCard";
import { MovieItem } from "@/lib/types";

interface MovieGridProps {
  movies: MovieItem[];
  searchTerm: string;
}

export default function MovieGrid({ movies, searchTerm }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-12 col-span-full">
        {searchTerm
          ? `No results found for "${searchTerm}"`
          : "Nothing here"}
      </div>
    );
  }

  return (
    <main className="grid grid-cols-3 gap-x-2 gap-y-4 p-2">
      {movies.map((item, index) => (
        <MovieCard key={item.movie_id || item.id || index} item={item} />
      ))}
    </main>
  );
}
