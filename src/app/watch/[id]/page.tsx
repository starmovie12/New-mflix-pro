"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ref, get, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import { normalizePlayerData } from "@/lib/normalize";
import { FALLBACK_POSTER, toArray } from "@/lib/utils";
import type { NormalizedPlayerData, LinkObject } from "@/lib/types";
import {
  Play,
  Download,
  ListVideo,
  Plus,
  ThumbsUp,
  Share2,
  Flag,
  Star,
  Calendar,
  Film,
  Clock,
  Award,
} from "lucide-react";
import PlayerControls from "@/components/PlayerControls";
import EpisodeList from "@/components/EpisodeList";
import RelatedGrid from "@/components/RelatedGrid";
import SkeletonLoader from "@/components/SkeletonLoader";

interface RelatedItem {
  id: string;
  title: string;
  poster: string;
  genre: string;
}

export default function WatchPage() {
  const params = useParams();
  const movieId = params.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [data, setData] = useState<NormalizedPlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setFitMode] = useState<"contain" | "cover">("contain");

  // Movie-specific
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Series-specific
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(0);
  const [currentEpisodeIdx, setCurrentEpisodeIdx] = useState(0);

  // Related
  const [related, setRelated] = useState<RelatedItem[]>([]);

  // Overlay title for player
  const [overlayTitle, setOverlayTitle] = useState("");

  useEffect(() => {
    async function loadContent() {
      if (!movieId) return;
      try {
        const snap = await get(ref(db, `movies_by_id/${movieId}`));
        if (snap.exists()) {
          const raw = snap.val();
          const normalized = normalizePlayerData(raw, movieId);
          setData(normalized);
          setOverlayTitle(normalized.title);
          document.title = `${normalized.title} | MFLIX Player`;

          if (normalized.isSeries) {
            if (normalized.seasons[0]?.episodes[0]) {
              playEpisodeInternal(normalized, 0, 0);
            }
          } else {
            if (normalized.links.length > 0) {
              playVideoUrl(normalized.links[0].url);
              setOverlayTitle(`${normalized.title} • ${normalized.links[0].label || "HD"}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load content:", error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
    loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  async function loadRelated() {
    try {
      const snap = await get(query(ref(db, "movies_by_id"), limitToLast(48)));
      if (!snap.exists()) return;
      const raw = snap.val();
      const entries: [string, unknown][] = Array.isArray(raw)
        ? raw.map((v: unknown, i: number) => [String(i), v] as [string, unknown])
        : Object.entries(raw);
      const items = entries
        .filter(([, v]) => v && typeof v === "object")
        .map(([id, v]) => {
          const val = v as Record<string, unknown>;
          return {
            id,
            title: String(val.title || val.original_title || "Untitled"),
            poster: String(val.poster || FALLBACK_POSTER),
            genre: toArray(val.genre).join(", ").toLowerCase(),
          };
        })
        .filter((item) => item.id !== movieId)
        .slice(0, 12);
      setRelated(items);
    } catch (error) {
      console.error("Failed to load related:", error);
    }
  }

  function playVideoUrl(url: string) {
    const video = videoRef.current;
    if (!video || !url) return;
    const source = video.querySelector("source");
    if (source) {
      source.src = url;
    }
    video.load();
    video.play().catch(() => {});
  }

  function playEpisodeInternal(d: NormalizedPlayerData, sIdx: number, eIdx: number) {
    const season = d.seasons[sIdx];
    const episode = season?.episodes?.[eIdx];
    if (!episode) return;

    setCurrentSeason(sIdx);
    setCurrentEpisodeIdx(eIdx);
    playVideoUrl(episode.url);
    setOverlayTitle(`${d.title} • ${season.name} • ${episode.title}`);
  }

  const handleEpisodeSelect = useCallback(
    (sIdx: number, eIdx: number) => {
      if (!data) return;
      playEpisodeInternal(data, sIdx, eIdx);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const handleQualityChange = useCallback(
    (link: LinkObject) => {
      playVideoUrl(link.url);
      if (data) {
        setOverlayTitle(`${data.title} • ${link.label}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const handleNextEpisode = useCallback(() => {
    if (!data) return;
    const season = data.seasons[currentSeason];
    if (!season) return;
    if (currentEpisodeIdx + 1 < season.episodes.length) {
      playEpisodeInternal(data, currentSeason, currentEpisodeIdx + 1);
    } else if (currentSeason + 1 < data.seasons.length) {
      playEpisodeInternal(data, currentSeason + 1, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentSeason, currentEpisodeIdx]);

  const hasNextEpisode = (() => {
    if (!data?.isSeries) return false;
    const season = data.seasons[currentSeason];
    if (!season) return false;
    if (currentEpisodeIdx + 1 < season.episodes.length) return true;
    if (currentSeason + 1 < data.seasons.length && data.seasons[currentSeason + 1].episodes.length > 0) return true;
    return false;
  })();

  const handleFitToggle = useCallback(() => {
    setFitMode((prev) => {
      const next = prev === "contain" ? "cover" : "contain";
      if (videoRef.current) {
        videoRef.current.style.objectFit = next;
      }
      return next;
    });
  }, []);

  const handlePlayLink = (link: LinkObject) => {
    playVideoUrl(link.url);
    if (data) setOverlayTitle(`${data.title} • ${link.label}`);
    setShowPlayMenu(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Watch ${data?.title || "MFLIX"} on MFLIX`,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const qualityLinks = data?.isSeries
    ? data.seasons[currentSeason]?.episodes[currentEpisodeIdx]?.qualityLinks || []
    : data?.links || [];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0f0f0f]">
      {/* Video Player */}
      <div className="relative w-full bg-black aspect-video max-h-[62vh] flex-shrink-0 overflow-hidden border-b border-white/10">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          poster={data?.poster || ""}
        >
          <source src="" type="video/mp4" />
        </video>

        <PlayerControls
          title={overlayTitle}
          links={qualityLinks}
          isSeries={data?.isSeries || false}
          hasNextEpisode={hasNextEpisode}
          onQualityChange={handleQualityChange}
          onNextEpisode={handleNextEpisode}
          onFitToggle={handleFitToggle}
          videoRef={videoRef}
        />
      </div>

      {/* Scrollable Content Below */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonLoader />
        ) : data ? (
          <div className="p-4">
            {/* Title Row */}
            <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
                {data.title}
              </h1>
              <span className="bg-mflix-red text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                {data.qualityName}
              </span>
            </div>

            {/* Meta Pills */}
            <div className="flex items-center flex-wrap gap-2 mb-6 mt-2.5">
              <MetaPill icon={<Award className="w-3.5 h-3.5" />} text={data.cert} />
              <MetaPill
                icon={<Star className="w-3.5 h-3.5 text-mflix-gold" />}
                text={data.rating}
              />
              <MetaPill icon={<Calendar className="w-3.5 h-3.5" />} text={data.year} />
              <MetaPill icon={<Film className="w-3.5 h-3.5" />} text={data.genre} />
              <MetaPill icon={<Clock className="w-3.5 h-3.5" />} text={data.runtime} />
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/15 mb-4" />

            {/* Action Buttons */}
            <div
              className={`grid gap-3 mb-4 ${
                data.isSeries ? "grid-cols-1" : "grid-cols-[1fr_auto]"
              }`}
            >
              {data.isSeries ? (
                /* Series: Episodes Button */
                <button
                  onClick={() => setShowEpisodes(true)}
                  className="bg-blue-700 text-white border-none rounded-md h-12 text-base font-bold flex items-center justify-center gap-2 w-full hover:bg-blue-600 transition-colors"
                >
                  <ListVideo className="w-5 h-5" />
                  View Episodes
                </button>
              ) : (
                /* Movie: Play + Download */
                <>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPlayMenu(!showPlayMenu);
                        setShowDownloadMenu(false);
                      }}
                      className="bg-mflix-red text-white border-none rounded-md h-12 text-base font-bold flex items-center justify-center gap-2 w-full hover:brightness-110 transition"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Play Movie
                    </button>
                    {showPlayMenu && data.links.length > 0 && (
                      <div className="absolute top-14 left-0 right-0 rounded-lg overflow-hidden menu-popup z-50">
                        {data.links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => handlePlayLink(link)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-200 border-b border-white/5"
                          >
                            Play {link.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDownloadMenu(!showDownloadMenu);
                        setShowPlayMenu(false);
                      }}
                      className="bg-[#333] text-white border-none rounded-md w-12 h-12 text-lg flex items-center justify-center hover:bg-[#444] transition-colors"
                      aria-label="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {showDownloadMenu && data.links.length > 0 && (
                      <div className="absolute top-14 right-0 min-w-[160px] rounded-lg overflow-hidden menu-popup z-50">
                        {data.links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              window.open(link.url, "_blank", "noopener");
                              setShowDownloadMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-200 border-b border-white/5"
                          >
                            {link.label} {link.info}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Social Actions */}
            <div className="flex justify-around py-1 flex-wrap gap-2">
              <SocialButton icon={<Plus className="w-5 h-5" />} label="My List" />
              <SocialButton icon={<ThumbsUp className="w-5 h-5" />} label="Like" />
              <SocialButton
                icon={<Share2 className="w-5 h-5" />}
                label="Share"
                onClick={handleShare}
              />
              <SocialButton icon={<Flag className="w-5 h-5" />} label="Report" />
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/15 my-4" />

            {/* Synopsis */}
            <p className="text-sm leading-relaxed text-gray-300 mb-6">
              {data.plot}
            </p>

            {/* More Like This */}
            <h3 className="text-white font-bold mb-4">More Like This</h3>
            <RelatedGrid items={related} />
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12">Content not found</div>
        )}
      </div>

      {/* Episodes Overlay */}
      {showEpisodes && data?.isSeries && (
        <EpisodeList
          seasons={data.seasons}
          currentSeason={currentSeason}
          currentEpisode={currentEpisodeIdx}
          onEpisodeSelect={handleEpisodeSelect}
          onClose={() => setShowEpisodes(false)}
        />
      )}
    </div>
  );
}

function MetaPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="bg-white/10 px-3 py-1.5 rounded-md text-xs text-gray-200 border border-white/5 flex items-center gap-1.5">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function SocialButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border-none text-gray-400 flex flex-col items-center gap-1.5 text-[11px] cursor-pointer hover:text-white transition-colors"
    >
      <span className="text-white">{icon}</span>
      {label}
    </button>
  );
}
