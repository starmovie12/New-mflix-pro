"use client";

import { ArrowLeft, Settings, Maximize, SkipForward, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import type { LinkObject } from "@/lib/types";

interface PlayerControlsProps {
  title: string;
  links: LinkObject[];
  isSeries: boolean;
  hasNextEpisode: boolean;
  onQualityChange: (link: LinkObject) => void;
  onNextEpisode: () => void;
  onFitToggle: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function PlayerControls({
  title,
  links,
  isSeries,
  hasNextEpisode,
  onQualityChange,
  onNextEpisode,
  onFitToggle,
  videoRef,
}: PlayerControlsProps) {
  const router = useRouter();
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [progress, setProgress] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const currentTime = video.currentTime;
    const duration = video.duration;
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
    setShowSkipIntro(currentTime > 4 && currentTime < 95);
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoRef, handleTimeUpdate]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowQualityMenu(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSkipIntro = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(video.currentTime + 90, video.duration || 0);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Watch ${title} on MFLIX`,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Top Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 video-controls-overlay flex justify-between items-start z-20 pointer-events-none">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/25 text-white flex items-center justify-center backdrop-blur-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="max-w-[60vw] px-3 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-xs text-white truncate">
            {title}
          </span>
        </div>

        {/* Right: Quality, Share, Fit */}
        <div className="flex items-center gap-2 pointer-events-auto" ref={menuRef}>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/25 text-white flex items-center justify-center"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQualityMenu(!showQualityMenu);
              }}
              className="w-9 h-9 rounded-full bg-black/50 border border-white/25 text-white flex items-center justify-center"
              aria-label="Quality settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            {showQualityMenu && links.length > 0 && (
              <div className="absolute top-12 right-0 min-w-[160px] rounded-lg overflow-hidden menu-popup z-50">
                {links.map((link, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onQualityChange(link);
                      setShowQualityMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 border-b border-white/5"
                  >
                    Switch to {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onFitToggle}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/25 text-white flex items-center justify-center"
            aria-label="Toggle fit"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Controls */}
      <div className="absolute bottom-3 right-3 z-30 flex gap-2">
        {isSeries && hasNextEpisode && (
          <button
            onClick={onNextEpisode}
            className="px-3 py-1.5 rounded-full border border-white/25 bg-black/60 text-white text-xs flex items-center gap-1.5"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Next Episode
          </button>
        )}
      </div>

      {/* Skip Intro */}
      {showSkipIntro && (
        <button
          onClick={handleSkipIntro}
          className="absolute bottom-3 left-3 z-30 px-3 py-2 rounded-full skip-pill text-white text-xs font-bold"
        >
          Skip Intro
        </button>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-40">
        <span
          className="block h-full watch-progress-bar transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}
