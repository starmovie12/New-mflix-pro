"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import type { MovieItem } from "@/types/movie";

type MovieRowCardProps = {
  item: MovieItem;
  variant?: "portrait" | "landscape";
};

export function MovieRowCard({ item, variant = "portrait" }: MovieRowCardProps) {
  const isLandscape = variant === "landscape";

  return (
    <Link
      href={`/watch/${item.id}`}
      className="group relative shrink-0 overflow-hidden rounded-md transition-transform duration-300 hover:scale-105"
      style={{
        width: isLandscape ? "240px" : "130px",
        height: isLandscape ? "135px" : "195px"
      }}
    >
      <Image
        src={item.poster}
        alt={item.title}
        fill
        sizes={isLandscape ? "240px" : "130px"}
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
          <Play size={20} className="text-white" fill="white" />
        </div>
      </div>

      <div className="absolute right-1.5 top-1.5 z-[2] rounded bg-black/70 px-1.5 py-[2px] text-[9px] font-bold text-white backdrop-blur-sm">
        {item.qualityName}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-6">
        <h3 className="truncate text-[11px] font-semibold text-white">
          {item.title}
        </h3>
        <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/60">
          <span>{item.year}</span>
          {item.rating !== "N/A" && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-white/40" />
              <span className="text-yellow-400">★ {item.rating}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
