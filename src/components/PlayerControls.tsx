"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Layers,
  Gauge,
  Expand,
  Copy,
  Maximize2,
  Share2,
  SkipForward,
  FastForward,
} from "lucide-react";
import { LinkObject } from "@/lib/types";

interface PlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  title: string;
  links: LinkObject[];
  currentLinkIndex: number;
  onBack: () => void;
  onLinkChange: (index: number) => void;
  onShare: () => void;
  showNextEpisode: boolean;
  onNextEpisode: () => void;
  qualityBadge: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function PlayerControls({
  videoRef,
  title,
  links,
  currentLinkIndex,
  onBack,
  onLinkChange,
  onShare,
  showNextEpisode,
  onNextEpisode,
  qualityBadge,
}: PlayerControlsProps) {
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [progress, setProgress] = useState(0);
  const qualityRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);

  const closeAllMenus = useCallback(() => {
    setShowQualityMenu(false);
    setShowSpeedMenu(false);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        qualityRef.current &&
        !qualityRef.current.contains(e.target as Node) &&
        speedRef.current &&
        !speedRef.current.contains(e.target as Node)
      ) {
        closeAllMenus();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [closeAllMenus]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const ct = video.currentTime || 0;
      const dur = video.duration || 0;
      if (dur > 0) {
        setProgress((ct / dur) * 100);
      }
      setShowSkipIntro(ct > 4 && ct < 95);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [videoRef]);

  const toggleFit = () => {
    const newMode = fitMode === "contain" ? "cover" : "contain";
    setFitMode(newMode);
    if (videoRef.current) {
      videoRef.current.style.objectFit = newMode;
    }
  };

  const togglePiP = async () => {
    if (!document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch { /* ignore */ }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch { /* ignore */ }
  };

  const skipIntro = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      videoRef.current.currentTime = Math.min(
        (videoRef.current.currentTime || 0) + 90,
        dur
      );
    }
  };

  const changeSpeed = (speed: number) => {
    setCurrentSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    closeAllMenus();
  };

  const iconBtnClass =
    "w-[38px] h-[38px] border border-white/[0.26] rounded-full bg-black/50 text-white inline-flex items-center justify-center hover:bg-black/70 transition-colors";

  return (
    <>
      {/* Top Overlay */}
      <div className="absolute inset-x-0 top-0 p-2.5 flex justify-between items-start z-30 pointer-events-none bg-gradient-to-b from-black/65 to-transparent">
        <div className="pointer-events-auto flex items-center gap-2">
          <button onClick={onBack} className={iconBtnClass} title="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="max-w-[min(64vw,560px)] px-3 py-2 rounded-full border border-white/[0.18] bg-black/50 backdrop-blur text-xs text-white whitespace-nowrap overflow-hidden text-ellipsis">
            {title} {qualityBadge && `• ${qualityBadge}`}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Quality Menu */}
          <div ref={qualityRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeedMenu(false);
                setShowQualityMenu((v) => !v);
              }}
              className={iconBtnClass}
              title="Video quality"
            >
              <Layers className="w-4 h-4" />
            </button>
            {showQualityMenu && (
              <div className="absolute top-[calc(100%+6px)] right-0 min-w-[180px] rounded-[10px] border border-white/[0.14] bg-[rgba(13,18,27,0.96)] overflow-hidden z-[90]">
                {links.length > 0 ? (
                  links.map((link, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onLinkChange(i);
                        closeAllMenus();
                      }}
                      className={`w-full border-0 text-left px-3 py-2.5 text-[#c5cee2] bg-transparent border-b border-white/[0.08] last:border-b-0 hover:bg-white/[0.08] transition-colors ${
                        i === currentLinkIndex ? "text-mflix-accent font-bold" : ""
                      }`}
                    >
                      {link.label || "HD"}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2.5 text-gray-400">Auto quality</div>
                )}
              </div>
            )}
          </div>

          {/* Speed Menu */}
          <div ref={speedRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQualityMenu(false);
                setShowSpeedMenu((v) => !v);
              }}
              className={iconBtnClass}
              title="Playback speed"
            >
              <Gauge className="w-4 h-4" />
            </button>
            {showSpeedMenu && (
              <div className="absolute top-[calc(100%+6px)] right-0 min-w-[140px] rounded-[10px] border border-white/[0.14] bg-[rgba(13,18,27,0.96)] overflow-hidden z-[90]">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`w-full border-0 text-left px-3 py-2.5 bg-transparent border-b border-white/[0.08] last:border-b-0 hover:bg-white/[0.08] transition-colors ${
                      speed === currentSpeed ? "text-mflix-accent font-bold" : "text-[#c5cee2]"
                    }`}
                  >
                    {speed}x {speed === currentSpeed ? "✓" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleFit} className={iconBtnClass} title="Fit mode">
            <Expand className="w-4 h-4" />
          </button>
          <button onClick={togglePiP} className={iconBtnClass} title="Picture in Picture">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={toggleFullscreen} className={iconBtnClass} title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Skip Intro */}
      {showSkipIntro && (
        <button
          onClick={skipIntro}
          className="absolute left-3 bottom-3 z-[36] border-0 rounded-full bg-mflix-accent px-3 py-2 text-xs font-bold text-white inline-flex items-center gap-1.5"
        >
          <FastForward className="w-3.5 h-3.5" /> Skip Intro 90s
        </button>
      )}

      {/* Floating Controls */}
      <div className="absolute right-2.5 bottom-2.5 z-[35] flex flex-wrap justify-end gap-2">
        <button
          onClick={onShare}
          className="border border-white/[0.22] rounded-full bg-black/55 text-white text-[11px] px-2.5 py-1.5 inline-flex items-center gap-1.5"
        >
          <Share2 className="w-3 h-3" /> Share
        </button>
        {showNextEpisode && (
          <button
            onClick={onNextEpisode}
            className="border border-white/[0.22] rounded-full bg-black/55 text-white text-[11px] px-2.5 py-1.5 inline-flex items-center gap-1.5"
          >
            <SkipForward className="w-3 h-3" /> Next Episode
          </button>
        )}
      </div>

      {/* Watch Progress Bar */}
      <div className="absolute left-0 right-0 bottom-0 h-1 z-40 bg-white/15">
        <span
          className="block h-full bg-gradient-to-r from-[#ff3f5e] to-[#ffc66f] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}
