"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MovieRowProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function MovieRow({ title, subtitle, children, className = "" }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth"
    });
  };

  return (
    <section className={`relative mb-6 ${className}`}>
      <div className="mb-2.5 flex items-end justify-between px-4">
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg md:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-mflix-text-muted sm:text-xs">
              {subtitle}
            </p>
          )}
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <button
            onClick={() => scroll("left")}
            className="rounded-full bg-mflix-card p-1.5 text-white/60 transition-colors hover:bg-mflix-card-hover hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full bg-mflix-card p-1.5 text-white/60 transition-colors hover:bg-mflix-card-hover hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="row-scroll scrollbar-hide flex gap-2 overflow-x-auto px-4"
      >
        {children}
      </div>
    </section>
  );
}
