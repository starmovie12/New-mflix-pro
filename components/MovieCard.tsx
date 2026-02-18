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
        <div className="relative h-0 w-full overflow-hidden rounded-lg bg-[#141414] pb-[150%] shadow-[0_12px_35px_rgba(0,0,0,0.55)] ring-1 ring-white/5 transition-transform duration-300 group-hover:-translate-y-0.5">
          <div className="absolute right-0 top-0 z-[2] rounded-bl-xl bg-[rgba(211,47,47,0.95)] px-2 py-[3px] text-[9px] font-extrabold uppercase text-white shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
            {languageBadge}
          </div>
          <Image
            src={item.poster}
            alt={`Watch ${item.title} (${item.year}) Full Movie Online Free`}
            fill
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 14vw"
            className="absolute left-0 top-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />
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
          <span className="rounded-md border border-white/20 bg-black/70 px-1.5 py-[1px] text-[9px] font-extrabold text-white backdrop-blur">
            {item.qualityName}
          </span>
          <span className="rounded-md border border-[#d32f2f] bg-[#d32f2f] px-1.5 py-[1px] text-[9px] font-extrabold text-white shadow-[0_10px_25px_rgba(211,47,47,0.18)]">
            {item.rating} ★
          </span>
        </div>
      </Link>
    </article>
  );
}
