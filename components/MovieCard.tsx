import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

import type { MovieItem } from "@/types/movie";

type MovieCardProps = {
  item: MovieItem;
};

export function MovieCard({ item }: MovieCardProps) {
  const languageBadge = item.language.toUpperCase().slice(0, 8) || "DUB";

  return (
    <article className="relative w-full overflow-hidden">
      <Link
        href={`/watch/${item.id}`}
        aria-label={`Watch ${item.title}`}
        className="group block"
      >
        <div className="relative h-0 w-full overflow-hidden rounded-lg bg-mflix-card pb-[150%] shadow-lg transition-transform duration-300 group-hover:scale-[1.03]">
          <div className="absolute right-0 top-0 z-[2] rounded-bl-lg bg-mflix-red/95 px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-wide text-white">
            {languageBadge}
          </div>
          <Image
            src={item.poster}
            alt={`${item.title} (${item.year})`}
            fill
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 14vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Play size={22} className="text-white" fill="white" />
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-1 px-0.5">
          <h3 className="flex-1 truncate text-[11px] font-semibold text-white">
            {item.title}
          </h3>
          <span className="shrink-0 text-[10px] font-medium text-mflix-text-muted">
            {item.year}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between px-0.5">
          <span className="rounded border border-white/15 bg-mflix-card px-1.5 py-[1px] text-[9px] font-bold text-white/80">
            {item.qualityName}
          </span>
          {item.rating !== "N/A" && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-yellow-400">
              ★ {item.rating}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
