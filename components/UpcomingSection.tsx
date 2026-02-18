"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";

import type { MovieItem } from "@/types/movie";
import { MovieRow } from "@/components/MovieRow";

type UpcomingSectionProps = {
  movies: MovieItem[];
};

export function UpcomingSection({ movies }: UpcomingSectionProps) {
  if (movies.length === 0) return null;

  return (
    <MovieRow title="Coming Soon" subtitle="Upcoming new releases">
      {movies.slice(0, 15).map((movie) => (
        <Link
          key={movie.id}
          href={`/watch/${movie.id}`}
          className="group relative shrink-0 overflow-hidden rounded-lg bg-mflix-card transition-transform duration-300 hover:scale-[1.03]"
          style={{ width: "280px" }}
        >
          <div className="relative h-[157px] w-full overflow-hidden">
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              sizes="280px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-mflix-card via-transparent to-transparent" />
            <div className="absolute left-2 top-2 rounded bg-mflix-red/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              Coming Soon
            </div>
          </div>

          <div className="px-3 pb-3 pt-2">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="flex-1 truncate text-sm font-bold text-white">
                {movie.title}
              </h3>
              <div className="ml-2 rounded-full border border-white/20 p-1.5 text-white/60 transition-colors group-hover:border-white/40 group-hover:text-white">
                <Bell size={12} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-mflix-text-muted">
              <span>{movie.year}</span>
              <span className="h-1 w-1 rounded-full bg-mflix-text-muted" />
              <span>{movie.genre.split(",")[0]}</span>
              <span className="h-1 w-1 rounded-full bg-mflix-text-muted" />
              <span>{movie.qualityName}</span>
            </div>
          </div>
        </Link>
      ))}
    </MovieRow>
  );
}
