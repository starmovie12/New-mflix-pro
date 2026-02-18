"use client";

import { ArrowLeft, Settings, Maximize } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlayerControlsProps {
  onQualityClick?: () => void;
  onFitClick?: () => void;
  fitMode?: "contain" | "cover";
}

export function PlayerControls({
  onQualityClick,
  onFitClick,
  fitMode = "contain",
}: PlayerControlsProps) {
  const router = useRouter();

  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center pointer-events-none [&>button]:pointer-events-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border-none text-white flex items-center justify-center cursor-pointer text-base hover:bg-white/25 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="flex gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQualityClick?.();
            }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border-none text-white flex items-center justify-center cursor-pointer text-base hover:bg-white/25 transition-colors"
            aria-label="Quality settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onFitClick}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border-none text-white flex items-center justify-center cursor-pointer text-base hover:bg-white/25 transition-colors"
          aria-label={fitMode === "contain" ? "Fit to cover" : "Fit to contain"}
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
