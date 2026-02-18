"use client";

import { ArrowLeft, Expand, ListVideo, Settings } from "lucide-react";
import { cn } from "@/lib/cn";

export type QualityOption = { label: string; url: string; info?: string; server?: string };

function IconCircle({
  children,
  onClick,
  title
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-[4px]"
    >
      {children}
    </button>
  );
}

export function PlayerControls({
  title,
  qualities,
  showNextEpisode,
  onBack,
  onToggleFit,
  onSelectQuality,
  onOpenEpisodes,
  onNextEpisode
}: {
  title: string;
  qualities: QualityOption[];
  showNextEpisode: boolean;
  onBack: () => void;
  onToggleFit: () => void;
  onSelectQuality: (q: QualityOption) => void;
  onOpenEpisodes?: () => void;
  onNextEpisode?: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 to-black/0 p-4">
      <div className="pointer-events-auto flex items-center gap-3">
        <IconCircle title="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </IconCircle>
        <div className="max-w-[60vw] truncate rounded-full bg-black/40 px-3 py-2 text-[12px] font-semibold text-white/95">
          {title || "Loading…"}
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        {onOpenEpisodes ? (
          <div className="relative">
            <IconCircle title="Episodes" onClick={onOpenEpisodes}>
              <ListVideo className="h-4 w-4" />
            </IconCircle>
          </div>
        ) : null}

        <details className="relative">
          <summary className="list-none">
            <IconCircle title="Quality settings">
              <Settings className="h-4 w-4" />
            </IconCircle>
          </summary>
          <div className="absolute right-0 mt-2 flex min-w-[160px] flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[rgba(20,20,20,0.95)]">
            {qualities.length ? (
              qualities.map((q) => (
                <button
                  key={`${q.label}-${q.url}`}
                  type="button"
                  onClick={() => onSelectQuality(q)}
                  className={cn(
                    "border-b border-white/5 px-4 py-3 text-left text-sm text-white/90 hover:bg-white/5",
                    "last:border-b-0"
                  )}
                >
                  {q.info ? `${q.label} ${q.info}` : q.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-white/60">No qualities</div>
            )}
          </div>
        </details>

        <IconCircle title="Fit mode" onClick={onToggleFit}>
          <Expand className="h-4 w-4" />
        </IconCircle>
      </div>

      {showNextEpisode && onNextEpisode ? (
        <button
          type="button"
          onClick={onNextEpisode}
          className="pointer-events-auto absolute bottom-4 right-4 rounded-full bg-white/15 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-[6px]"
        >
          Next Episode
        </button>
      ) : null}
    </div>
  );
}

