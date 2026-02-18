"use client";

import Link from "next/link";
import { FALLBACK_POSTER } from "@/lib/constants";
import type { MflixMovie } from "@/lib/movies";

export function MovieCard({ item }: { item: MflixMovie }) {
  const fullTitle = String(item.title || "Untitled");
  const posterUrl = String(item.poster || FALLBACK_POSTER);
  const rating = item.rating ?? "N/A";
  const quality = String(item.quality_name || "HD");
  const year = String(item.year || "2024");
  const langText = String(item.original_language || "Dub").toUpperCase();
  const id = String(item.movie_id || "");

  return (
    <Link
      href={id ? `/watch/${encodeURIComponent(id)}` : "#"}
      className="group block w-full"
      aria-label={`Watch ${fullTitle}`}
    >
      <article className="relative w-full">
        <div className="relative w-full overflow-hidden rounded-[6px] bg-[#1a1a1a] shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          <div className="pt-[150%]" />
          <div className="absolute inset-0">
            <div className="absolute right-0 top-0 z-[2] rounded-bl-[8px] bg-[rgba(229,9,20,0.95)] px-[6px] py-[2px] text-[9px] font-bold uppercase text-white">
              {langText}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt={`Watch ${fullTitle} (${year}) Full Movie Online Free`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </div>

        <div className="mt-[6px] flex items-center justify-between gap-2 px-[1px]">
          <h3 className="min-w-0 flex-1 truncate text-[11px] font-semibold text-white">{fullTitle}</h3>
          <div className="shrink-0 text-[10px] font-medium text-[#bbb]">{year}</div>
        </div>

        <div className="mt-[3px] flex items-center justify-between gap-2 px-[1px]">
          <span className="rounded-[3px] border border-white/40 bg-black px-1 py-[1px] text-[9px] font-bold text-white">
            {quality}
          </span>
          <span className="rounded-[3px] border border-mflix-red bg-mflix-red px-1 py-[1px] text-[9px] font-bold text-white">
            {rating} ★
          </span>
        </div>
      </article>
    </Link>
  );
}

