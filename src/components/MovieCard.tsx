"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { MovieItem } from "@/lib/types";

interface MovieCardProps {
  item: MovieItem;
}

export default function MovieCard({ item }: MovieCardProps) {
  const lang = (item.languageList[0] || "DUB").toUpperCase().slice(0, 8);
  const type = item.tabCategory === "tvshow" ? "tv" : "movie";

  return (
    <Link
      href={`/watch/${encodeURIComponent(item.id)}?type=${type}`}
      prefetch={false}
    >
      <article
        className="w-full cursor-pointer relative group"
        role="button"
        aria-label={`Watch ${item.title}`}
      >
        {/* Poster Container */}
        <div className="relative w-full pb-[150%] rounded-md overflow-hidden bg-mflix-card shadow-md">
          {/* Language Badge */}
          <span className="absolute top-0 right-0 bg-mflix-red-dark/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10 uppercase">
            {lang}
          </span>

          <Image
            src={item.poster}
            alt={`Watch ${item.title} (${item.year}) Full Movie Online Free`}
            fill
            sizes="(max-width: 430px) 50vw, (max-width: 720px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
        </div>

        {/* Title & Year Row */}
        <div className="flex justify-between items-center mt-1.5 px-0.5">
          <h3 className="text-[11px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis flex-1 mr-1">
            {item.title}
          </h3>
          <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">
            {item.year}
          </span>
        </div>

        {/* Quality & Rating Row */}
        <div className="flex justify-between items-center mt-1 px-0.5">
          <span className="text-[9px] font-bold px-1 py-[1px] rounded bg-black text-white border border-white/40">
            {item.quality}
          </span>
          <span className="text-[9px] font-bold px-1 py-[1px] rounded bg-mflix-red-dark text-white border border-mflix-red-dark flex items-center gap-0.5">
            {item.rating.toFixed(1)}
            <Star className="w-2.5 h-2.5 fill-current" />
          </span>
        </div>
      </article>
    </Link>
  );
}
