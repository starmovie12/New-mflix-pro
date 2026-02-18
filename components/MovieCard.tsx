"use client";

import Link from "next/link";
import { FALLBACK_POSTER } from "@/lib/firebase";

export interface MovieItem {
  movie_id?: string;
  id?: string;
  title?: string;
  poster?: string;
  rating?: string | number;
  quality_name?: string;
  year?: string | number;
  original_language?: string;
  category?: string;
  adult_content?: string | boolean;
  [key: string]: unknown;
}

interface MovieCardProps {
  item: MovieItem;
}

export function MovieCard({ item }: MovieCardProps) {
  const fullTitle = item.title || "Untitled";
  const posterUrl = item.poster || FALLBACK_POSTER;
  const rating = item.rating ?? "N/A";
  const quality = item.quality_name || "HD";
  const year = item.year || "2024";
  const langText = (item.original_language || "Dub").toUpperCase();
  const type =
    item.category?.toLowerCase().includes("series") ? "tv" : "movie";
  const id = String(item.movie_id || item.id || "");

  return (
    <Link href={`/watch/${id}?type=${type}&source=firebase`}>
      <article
        className="w-full cursor-pointer relative overflow-hidden group"
        role="button"
        aria-label={`Watch ${fullTitle}`}
      >
        <div className="relative w-full pb-[150%] rounded-md overflow-hidden bg-mflix-card shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={`Watch ${fullTitle} (${year}) Full Movie Online Free`}
            className="absolute inset-0 w-full h-full object-cover block"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_POSTER;
            }}
          />
          <div className="absolute top-0 right-0 bg-mflix-accent/95 text-white text-[9px] font-bold py-0.5 px-1.5 rounded-bl-lg z-[2] uppercase">
            {langText}
          </div>
        </div>
        <div className="flex justify-between items-center mt-1.5 px-0.5">
          <h3 className="text-[11px] font-semibold text-white truncate flex-1 mr-1">
            {fullTitle}
          </h3>
          <div className="text-[10px] font-medium text-[#bbb] shrink-0">
            {year}
          </div>
        </div>
        <div className="flex justify-between items-center mt-0.5 px-0.5">
          <span className="text-[9px] font-bold py-0.5 px-1 rounded bg-black text-white border border-white/40">
            {quality}
          </span>
          <span className="text-[9px] font-bold py-0.5 px-1 rounded bg-mflix-accent text-white border border-mflix-accent">
            {rating} ★
          </span>
        </div>
      </article>
    </Link>
  );
}
