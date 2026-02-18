import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

import type { MovieItem } from "@/types/movie";

type PosterTileProps = {
  item: MovieItem;
  rank?: number;
  size?: "sm" | "md";
};

function ratingNumber(value: string) {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

export function PosterTile({ item, rank, size = "md" }: PosterTileProps) {
  const rating = ratingNumber(item.rating);
  const posterWidth = size === "sm" ? "w-[118px]" : "w-[140px]";

  return (
    <Link
      href={`/watch/${item.id}`}
      aria-label={`Watch ${item.title}`}
      className="group relative block shrink-0"
    >
      <div className="relative flex items-end">
        {typeof rank === "number" ? (
          <div
            className="absolute -left-1 bottom-[-10px] z-10 select-none text-[78px] font-extrabold leading-none tracking-[-0.08em] text-black/40"
            style={{
              WebkitTextStroke: "6px rgba(255,255,255,0.14)",
              textShadow: "0 12px 40px rgba(0,0,0,0.7)"
            }}
            aria-hidden="true"
          >
            {rank}
          </div>
        ) : null}

        <div
          className={[
            "relative overflow-hidden rounded-lg bg-[#141414] shadow-[0_10px_30px_rgba(0,0,0,0.6)]",
            posterWidth,
            "aspect-[2/3]"
          ].join(" ")}
        >
          <Image
            src={item.poster}
            alt={`${item.title} poster`}
            fill
            sizes={size === "sm" ? "118px" : "140px"}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/10 opacity-90" />

          <div className="absolute left-2 right-2 top-2 flex items-center justify-between gap-2">
            <span className="rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
              {item.qualityName}
            </span>
            {rating !== null ? (
              <span className="rounded-md bg-[#d32f2f]/95 px-2 py-1 text-[10px] font-bold text-white">
                {rating.toFixed(1)}
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-2 bottom-2">
            <p className="line-clamp-2 text-xs font-semibold leading-4 text-white/95">
              {item.title}
            </p>
            <p className="mt-1 text-[11px] text-white/65">
              {item.year} • {item.language.toUpperCase().slice(0, 8) || "DUB"}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Play size={18} className="ml-0.5 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

