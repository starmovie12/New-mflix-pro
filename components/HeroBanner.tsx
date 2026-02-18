"use client";

import Link from "next/link";
import Image from "next/image";

import type { MovieItem } from "@/types/movie";

type HeroBannerProps = {
  item: MovieItem;
};

export function HeroBanner({ item }: HeroBannerProps) {
  const type = item.isSeries ? "tv" : "movie";

  return (
    <div className="relative -mx-4 mb-6 h-[42vh] min-h-[220px] overflow-hidden rounded-none sm:mx-0 sm:mb-8 sm:min-h-[320px] sm:rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-[1]" />
      <Image
        src={item.poster}
        alt={item.title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      <div className="absolute bottom-0 left-0 right-0 z-[2] flex flex-col gap-2 px-4 pb-6 pt-12 sm:px-8 sm:pb-8">
        <h1 className="line-clamp-2 text-xl font-bold leading-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl">
          {item.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="rounded bg-white/20 px-2 py-0.5 font-medium text-white">
            {item.year}
          </span>
          <span className="rounded bg-[#e50914]/90 px-2 py-0.5 font-semibold text-white">
            {item.rating} ★
          </span>
          <span className="rounded border border-white/40 bg-black/40 px-2 py-0.5 font-medium text-white">
            {item.qualityName}
          </span>
          <span className="text-[#aaa]">{item.genre}</span>
        </div>
        <p className="line-clamp-2 max-w-xl text-xs text-[#ccc] sm:text-sm">
          {item.description}
        </p>
        <Link
          href={`/watch/${item.id}`}
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg bg-[#e50914] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#f40612] active:scale-[0.98]"
        >
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch Now
        </Link>
      </div>
    </div>
  );
}
