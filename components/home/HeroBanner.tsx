import Link from "next/link";
import Image from "next/image";
import { Info, Play } from "lucide-react";

import type { MovieItem } from "@/types/movie";

type HeroBannerProps = {
  item: MovieItem | null;
};

export function HeroBanner({ item }: HeroBannerProps) {
  if (!item) return null;

  return (
    <section className="relative px-3 pt-3">
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] shadow-[0_20px_70px_rgba(0,0,0,0.75)]">
        <div className="relative [aspect-ratio:16/9]">
          <Image
            src={item.poster}
            alt={`${item.title} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/25 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />

          <div className="absolute left-4 right-4 bottom-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/70">
              <span className="rounded-md bg-white/10 px-2 py-1 backdrop-blur">
                {item.year}
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1 backdrop-blur">
                {item.genre.split(",")[0] || "Drama"}
              </span>
              <span className="rounded-md bg-[#d32f2f]/90 px-2 py-1 text-white">
                {item.rating} ★
              </span>
              <span className="rounded-md bg-black/55 px-2 py-1 text-white backdrop-blur">
                {item.qualityName}
              </span>
            </div>

            <h1 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-tight text-white">
              {item.title}
            </h1>

            <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/70">
              {item.description}
            </p>

            <div className="mt-3 flex gap-2">
              <Link
                href={`/watch/${item.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-black"
                aria-label={`Play ${item.title}`}
              >
                <Play size={18} />
                Play
              </Link>
              <Link
                href={`/watch/${item.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-bold text-white backdrop-blur hover:bg-white/15"
                aria-label={`More info about ${item.title}`}
              >
                <Info size={18} />
                Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

