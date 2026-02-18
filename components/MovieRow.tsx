"use client";

import { useRef } from "react";

import { MovieCard } from "@/components/MovieCard";
import type { MovieItem } from "@/types/movie";

type MovieRowProps = {
  items: MovieItem[];
  cardSize?: "default" | "large" | "top10";
};

export function MovieRow({ items, cardSize = "default" }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  const isLarge = cardSize === "large" || cardSize === "top10";
  const cardClass = isLarge
    ? "min-w-[140px] sm:min-w-[160px]"
    : "min-w-[100px] sm:min-w-[120px]";

  return (
    <div className="group/row relative -mx-2 sm:-mx-4">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`${cardClass} shrink-0`}
          >
            {cardSize === "top10" ? (
              <div className="relative">
                <span className="absolute -left-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#e50914] to-[#b20710] text-xs font-black text-white shadow-lg">
                  {index + 1}
                </span>
                <MovieCard item={item} size="large" />
              </div>
            ) : (
              <MovieCard item={item} size={isLarge ? "large" : "default"} />
            )}
          </div>
        ))}
      </div>
      {items.length > 4 ? (
        <>
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-r-md bg-black/70 px-2 py-8 opacity-0 transition-opacity group-hover/row:opacity-100 sm:block"
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-l-md bg-black/70 px-2 py-8 opacity-0 transition-opacity group-hover/row:opacity-100 sm:block"
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  );
}
