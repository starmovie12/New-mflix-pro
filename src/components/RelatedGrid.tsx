"use client";

import Image from "next/image";
import Link from "next/link";
import { FALLBACK_POSTER } from "@/lib/utils";

interface RelatedItem {
  id: string;
  title: string;
  poster: string;
}

interface RelatedGridProps {
  items: RelatedItem[];
}

export default function RelatedGrid({ items }: RelatedGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center col-span-full">
        No related titles found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/watch/${encodeURIComponent(item.id)}`}
          prefetch={false}
          className="block rounded-lg overflow-hidden border border-white/10 bg-[#121723] hover:border-white/25 transition-colors"
        >
          <div className="relative aspect-poster">
            <Image
              src={item.poster || FALLBACK_POSTER}
              alt={item.title}
              fill
              className="object-cover"
              loading="lazy"
              unoptimized
            />
          </div>
          <p className="text-xs text-gray-300 m-1.5 line-clamp-2">{item.title}</p>
        </Link>
      ))}
    </div>
  );
}
