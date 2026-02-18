"use client";

import Image from "next/image";
import Link from "next/link";

import type { MovieItem } from "@/types/movie";
import { MovieRow } from "@/components/MovieRow";

type Top10SectionProps = {
  movies: MovieItem[];
};

export function Top10Section({ movies }: Top10SectionProps) {
  const top10 = movies.slice(0, 10);
  if (top10.length === 0) return null;

  return (
    <MovieRow title="Top 10 in India Today" subtitle="Most watched right now">
      {top10.map((movie, index) => (
        <Link
          key={movie.id}
          href={`/watch/${movie.id}`}
          className="group relative flex shrink-0 items-end"
          style={{ width: "140px", height: "200px" }}
        >
          <span
            className="pointer-events-none absolute bottom-0 left-[-8px] z-[2] select-none font-extrabold leading-none text-transparent"
            style={{
              fontSize: "130px",
              WebkitTextStroke: "3px rgba(255,255,255,0.15)",
              textShadow: "0 0 20px rgba(229,9,20,0.2)",
              lineHeight: "0.75"
            }}
          >
            {index + 1}
          </span>

          <div
            className="absolute bottom-0 right-0 overflow-hidden rounded-md shadow-lg transition-transform duration-300 group-hover:scale-105"
            style={{ width: "95px", height: "140px" }}
          >
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              sizes="95px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </Link>
      ))}
    </MovieRow>
  );
}
