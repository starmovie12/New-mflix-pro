"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { MovieItem } from "@/lib/types";
import { FALLBACK_POSTER } from "@/lib/utils";

interface MovieCardProps {
  item: MovieItem;
}

export default function MovieCard({ item }: MovieCardProps) {
  const fullTitle = item.title || "Untitled";
  const posterUrl = item.poster || FALLBACK_POSTER;
  const rating = item.rating || "N/A";
  const quality = item.quality_name || "HD";
  const year = item.year || "2024";
  const langText = (item.original_language || "Dub").toUpperCase();

  const type =
    item.category && item.category.toLowerCase().includes("series")
      ? "tv"
      : "movie";

  const movieId = item.movie_id || item.id || "";

  return (
    <Link
      href={`/watch/${movieId}?type=${type}&source=firebase`}
      prefetch={false}
    >
      <article
        className="w-full cursor-pointer relative overflow-hidden group"
        role="button"
        aria-label={`Watch ${fullTitle}`}
      >
        <div className="relative w-full pb-[150%] rounded-md overflow-hidden bg-mflix-card shadow-md">
          <span className="absolute top-0 right-0 bg-mflix-accent/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg z-[2] uppercase">
            {langText}
          </span>
          <Image
            src={posterUrl}
            alt={`Watch ${fullTitle} (${year}) Full Movie Online Free`}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            loading="lazy"
            unoptimized
          />
        </div>

        <div className="flex justify-between items-center mt-1.5 px-px">
          <h3 className="text-[11px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis flex-1 mr-1">
            {fullTitle}
          </h3>
          <div className="text-[10px] font-medium text-gray-400 flex-shrink-0">
            {year}
          </div>
        </div>

        <div className="flex justify-between items-center mt-0.5 px-px">
          <span className="text-[9px] font-bold px-1 py-px rounded bg-black text-white border border-white/40">
            {quality}
          </span>
          <span className="text-[9px] font-bold px-1 py-px rounded bg-mflix-accent text-white border border-mflix-accent inline-flex items-center gap-0.5">
            {rating} <Star className="w-2 h-2 fill-current" />
          </span>
        </div>
      </article>
    </Link>
  );
}
