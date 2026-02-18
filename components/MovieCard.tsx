import Link from "next/link";
import Image from "next/image";

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
        <div className="relative h-0 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] pb-[150%] shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
          <div className="absolute right-2 top-2 z-[2] rounded-md border border-white/25 bg-black/70 px-1.5 py-[2px] text-[9px] font-bold uppercase text-white">
            {languageBadge}
          </div>
          <Image
            src={item.poster}
            alt={`Watch ${item.title} (${item.year}) Full Movie Online Free`}
            fill
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 14vw"
            className="absolute left-0 top-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
            <h3 className="m-0 truncate text-[11px] font-semibold text-white">{item.title}</h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="rounded-[4px] border border-[rgba(255,255,255,0.35)] bg-black/70 px-1 py-[1px] text-[9px] font-bold text-white">
                {item.qualityName}
              </span>
              <span className="rounded-[4px] border border-[#d32f2f] bg-[#d32f2f] px-1 py-[1px] text-[9px] font-bold text-white">
                {item.rating} ★
              </span>
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-1 px-[2px]">
          <span className="truncate text-[10px] font-medium text-white/75">{item.genre}</span>
          <span className="shrink-0 text-[10px] font-medium text-[#bbb]">
            {item.year}
          </span>
        </div>
      </Link>
    </article>
  );
}
