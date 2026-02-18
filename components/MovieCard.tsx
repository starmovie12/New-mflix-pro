import Link from "next/link";
import Image from "next/image";

import type { MovieItem } from "@/types/movie";

type MovieCardProps = {
  item: MovieItem;
  size?: "default" | "large";
};

export function MovieCard({ item, size = "default" }: MovieCardProps) {
  const languageBadge = item.language.toUpperCase().slice(0, 8) || "DUB";

  const aspectClass =
    size === "large"
      ? "pb-[145%] rounded-lg"
      : "pb-[150%] rounded-lg";

  return (
    <article className="group relative w-full overflow-hidden">
      <Link
        href={`/watch/${item.id}`}
        aria-label={`Watch ${item.title}`}
        className="block"
      >
        <div
          className={`relative h-0 w-full overflow-hidden bg-[#1a1a1a] shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(229,9,20,0.25)] ${aspectClass}`}
        >
          <div className="absolute right-0 top-0 z-[2] rounded-bl-lg bg-gradient-to-r from-[#e50914] to-[#b20710] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-md">
            {languageBadge}
          </div>
          <Image
            src={item.poster}
            alt={`Watch ${item.title} (${item.year}) Full Movie Online Free`}
            fill
            sizes={
              size === "large"
                ? "(max-width: 768px) 140px, 160px"
                : "(max-width: 768px) 100px, 120px"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {item.qualityName}
            </span>
            <span className="rounded bg-[#e50914] px-1.5 py-0.5 text-[9px] font-bold text-white">
              {item.rating} ★
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-1 px-0.5">
          <h3
            className={`m-0 flex-1 truncate font-semibold text-white ${
              size === "large" ? "text-xs sm:text-sm" : "text-[11px]"
            }`}
          >
            {item.title}
          </h3>
          <span
            className={`shrink-0 font-medium text-[#999] ${
              size === "large" ? "text-[10px] sm:text-xs" : "text-[10px]"
            }`}
          >
            {item.year}
          </span>
        </div>

        {size === "default" ? (
          <div className="mt-1 flex items-center gap-1.5 px-0.5">
            <span className="rounded border border-white/30 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {item.qualityName}
            </span>
            <span className="rounded bg-[#e50914]/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {item.rating} ★
            </span>
          </div>
        ) : null}
      </Link>
    </article>
  );
}
