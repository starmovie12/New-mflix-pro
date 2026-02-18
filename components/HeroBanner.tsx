"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";

import type { MovieItem } from "@/types/movie";

type HeroBannerProps = {
  movies: MovieItem[];
};

export function HeroBanner({ movies }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const featured = movies.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, featured.length]);

  if (featured.length === 0) return null;

  const movie = featured[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "56vw", maxHeight: "420px", minHeight: "240px" }}>
      {featured.map((item, index) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === current ? 1 : 0, zIndex: index === current ? 1 : 0 }}
        >
          <Image
            src={item.poster}
            alt={item.title}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover animate-hero-zoom"
          />
        </div>
      ))}

      <div className="absolute inset-0 z-[2]" style={{
        background: "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.85) 20%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.2) 70%, rgba(10,10,10,0.6) 100%)"
      }} />

      <div className="absolute bottom-0 left-0 right-0 z-[3] px-4 pb-5">
        <div className="animate-fade-in-up" key={movie.id}>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-mflix-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {movie.isSeries ? "Series" : "Movie"}
            </span>
            <span className="text-[11px] font-semibold text-mflix-text-dim">
              {movie.year}
            </span>
            <span className="text-[11px] text-mflix-text-muted">
              {movie.qualityName}
            </span>
            {movie.rating !== "N/A" && (
              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-yellow-400">
                ★ {movie.rating}
              </span>
            )}
          </div>

          <h2 className="mb-1.5 text-xl font-bold leading-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl">
            {movie.title}
          </h2>

          <p className="mb-3 line-clamp-2 max-w-[600px] text-[12px] leading-relaxed text-mflix-text-dim sm:text-sm">
            {movie.genre}
          </p>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-1.5 rounded-sm bg-white px-4 py-2 text-[13px] font-bold text-black transition-all hover:bg-white/80 active:scale-95"
            >
              <Play size={16} fill="black" />
              Play
            </Link>
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-1.5 rounded-sm bg-white/20 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
            >
              <Info size={16} />
              More Info
            </Link>
          </div>
        </div>
      </div>

      {featured.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-[4] -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white/80 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white active:scale-90"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-[4] -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white/80 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white active:scale-90"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-2 right-4 z-[4] flex gap-1.5">
            {featured.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-6 bg-mflix-red"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
