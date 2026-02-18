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
        <div className="relative h-0 w-full overflow-hidden rounded-md bg-[#1a1a1a] pb-[150%] shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          <div className="absolute right-0 top-0 z-[2] rounded-bl-lg bg-[rgba(211,47,47,0.95)] px-1.5 py-[2px] text-[9px] font-bold uppercase text-white">
            {languageBadge}
          </div>
          <Image
            src={item.poster}
            alt={`Watch ${item.title} (${item.year}) Full Movie Online Free`}
            fill
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 14vw"
            className="absolute left-0 top-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-1 px-[1px]">
          <h3 className="m-0 flex-1 truncate text-[11px] font-semibold text-white">
            {item.title}
          </h3>
          <span className="shrink-0 text-[10px] font-medium text-[#bbb]">
            {item.year}
          </span>
        </div>

        <div className="mt-[3px] flex items-center justify-between px-[1px]">
          <span className="rounded-[3px] border border-[rgba(255,255,255,0.4)] bg-black px-1 py-[1px] text-[9px] font-bold text-white">
            {item.qualityName}
          </span>
          <span className="rounded-[3px] border border-[#d32f2f] bg-[#d32f2f] px-1 py-[1px] text-[9px] font-bold text-white">
            {item.rating} ★
          </span>
        </div>
      </Link>
    </article>
  );
}
