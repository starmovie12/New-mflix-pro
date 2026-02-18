"use client";

import { useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  Layers,
  Gauge,
  Maximize,
  PictureInPicture2,
  Share2,
  SkipForward,
} from "lucide-react";

interface PlayerControlsProps {
  title: string;
  onBack: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  progress: number;
  qualityOptions: { label: string; url: string }[];
  onQualityChange: (url: string, label: string) => void;
  speedOptions: number[];
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  onShare: () => void;
  showNextEpisode: boolean;
  onNextEpisode: () => void;
  showSkipIntro: boolean;
  onSkipIntro: () => void;
}

export function PlayerControls({
  title,
  onBack,
  videoRef,
  progress,
  qualityOptions,
  onQualityChange,
  speedOptions,
  currentSpeed,
  onSpeedChange,
  onShare,
  showNextEpisode,
  onNextEpisode,
  showSkipIntro,
  onSkipIntro,
}: PlayerControlsProps) {
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const handleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const handlePiP = useCallback(async () => {
    if (!document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // PiP not supported
    }
  }, [videoRef]);

  const fitModeRef = useRef<"contain" | "cover">("contain");
  const handleFitMode = useCallback(() => {
    const next = fitModeRef.current === "contain" ? "cover" : "contain";
    fitModeRef.current = next;
    if (videoRef.current) {
      videoRef.current.style.objectFit = next;
    }
  }, [videoRef]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/65 to-transparent z-30" />
      <div className="absolute top-0 left-0 right-0 p-2.5 flex justify-between items-start z-40 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="max-w-[64vw] md:max-w-[560px] py-2 px-3 rounded-full border border-white/18 bg-black/50 backdrop-blur text-xs text-white truncate">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          {qualityOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu((v) => !v);
                  setShowSpeedMenu(false);
                }}
                className="w-9 h-9 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                title="Quality"
              >
                <Layers className="w-4 h-4" />
              </button>
              {showQualityMenu && (
                <div className="absolute top-full right-0 mt-1.5 min-w-[180px] rounded-lg border border-white/14 bg-[#0d121b] overflow-hidden z-50">
                  {qualityOptions.map((opt) => (
                    <button
                      key={opt.url}
                      onClick={() => {
                        onQualityChange(opt.url, opt.label);
                        setShowQualityMenu(false);
                      }}
                      className="w-full text-left py-2.5 px-3 text-[#c5cee2] hover:bg-white/8 border-b border-white/8 last:border-0"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => {
                setShowSpeedMenu((v) => !v);
                setShowQualityMenu(false);
              }}
              className="w-9 h-9 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              title="Speed"
            >
              <Gauge className="w-4 h-4" />
            </button>
            {showSpeedMenu && (
              <div className="absolute top-full right-0 mt-1.5 min-w-[120px] rounded-lg border border-white/14 bg-[#0d121b] overflow-hidden z-50">
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      onSpeedChange(speed);
                      if (videoRef.current) videoRef.current.playbackRate = speed;
                      setShowSpeedMenu(false);
                    }}
                    className="w-full text-left py-2.5 px-3 text-[#c5cee2] hover:bg-white/8 border-b border-white/8 last:border-0"
                  >
                    {speed}x {speed === currentSpeed ? "✓" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleFitMode}
            className="w-9 h-9 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            title="Fit"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={handlePiP}
            className="w-9 h-9 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            title="PiP"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleFullscreen}
            className="w-9 h-9 rounded-full border border-white/25 bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSkipIntro && (
        <button
          onClick={onSkipIntro}
          className="absolute left-3 bottom-12 z-40 flex items-center gap-2 rounded-full bg-[#E50914]/90 text-white py-2 px-3 text-sm font-bold"
        >
          <SkipForward className="w-4 h-4" />
          Skip Intro 90s
        </button>
      )}

      <div className="absolute right-2.5 bottom-2.5 z-40 flex flex-wrap justify-end gap-2">
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-full border border-white/22 bg-black/55 text-white text-xs py-1.5 px-2.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
        {showNextEpisode && (
          <button
            onClick={onNextEpisode}
            className="flex items-center gap-1.5 rounded-full border border-white/22 bg-black/55 text-white text-xs py-1.5 px-2.5"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Next Episode
          </button>
        )}
      </div>

      <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/15 z-40">
        <div
          className="h-full bg-gradient-to-r from-[#ff3f5e] to-[#ffc66f] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}
