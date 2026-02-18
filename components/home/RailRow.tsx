import type { ReactNode } from "react";

type RailRowProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function RailRow({ title, subtitle, children }: RailRowProps) {
  return (
    <section className="px-3">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-white/60">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="relative -mx-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#050505] to-transparent" />

        <div className="flex gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

type RailRowProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function RailRow({ title, subtitle, children }: RailRowProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-3">
        <div>
          <h2 className="text-[15px] font-extrabold tracking-[-0.02em] text-white">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-xs text-white/60">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#050505] to-transparent" />

        <div className="flex gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </section>
  );
}

