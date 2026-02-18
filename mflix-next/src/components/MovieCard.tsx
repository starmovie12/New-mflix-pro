"use client";

import Image from "next/image";
import Link from "next/link";
import { FALLBACK_POSTER } from "@/lib/firebase";
import type { MovieItem } from "@/types/movie";

interface MovieCardProps {
  item: MovieItem;
}

function getMovieId(item: MovieItem): string {
  return String(item.movie_id || item.id || "");
}

function getType(item: MovieItem): "movie" | "tv" {
  const category = (item.category || "").toLowerCase();
  return category.includes("series") ? "tv" : "movie";
}

export function MovieCard({ item }: MovieCardProps) {
  const fullTitle = item.title || item.original_title || "Untitled";
  const posterUrl = item.poster || item.image || FALLBACK_POSTER;
  const rating = item.rating ?? "N/A";
  const quality = item.quality_name || item.quality || "HD";
  const year = item.year || item.release_year || "2024";
  const langText = (
    (Array.isArray(item.spoken_languages)
      ? item.spoken_languages[0]
      : item.spoken_languages || item.original_language) || "Dub"
  )
    .toString()
    .toUpperCase()
    .slice(0, 8);
  const movieId = getMovieId(item);
  const type = getType(item);

  if (!movieId) return null;

  return (
    <Link
      href={`/watch/${movieId}?type=${type}&source=firebase`}
      className="block w-full cursor-pointer relative overflow-hidden group"
      role="button"
      aria-label={`Watch ${fullTitle}`}
    >
      <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a] shadow-md">
        <Image
          src={posterUrl}
          alt={`Watch ${fullTitle} (${year}) Full Movie Online Free`}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_POSTER;
          }}
        />
        <div className="absolute top-0 right-0 bg-[rgba(211,47,47,0.95)] text-white text-[9px] font-bold py-0.5 px-1.5 rounded-bl-lg z-[2] uppercase">
          {langText}
        </div>
      </div>
      <div className="flex justify-between items-center mt-1.5 px-0.5">
        <h3 className="text-[11px] font-semibold text-white truncate flex-1 mr-1">
          {fullTitle}
        </h3>
        <span className="text-[10px] font-medium text-[#bbb] shrink-0">
          {String(year)}
        </span>
      </div>
      <div className="flex justify-between items-center mt-0.5 px-0.5">
        <span className="text-[9px] font-bold py-0.5 px-1 rounded bg-black text-white border border-white/40">
          {String(quality)}
        </span>
        <span className="text-[9px] font-bold py-0.5 px-1 rounded bg-[#E50914] text-white border border-[#E50914]">
          {String(rating)} ★
        </span>
      </div>
    </Link>
  );
}
