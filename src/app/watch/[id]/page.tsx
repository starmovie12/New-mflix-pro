"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, get, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import { MovieItem, NormalizedData, LinkObject } from "@/lib/types";
import { normalizeData } from "@/lib/normalize";
import { asNumber, clamp, toArray, FALLBACK_POSTER } from "@/lib/utils";
import { readJSON, writeJSON, updateSetStorage, boundedPush, STORAGE_KEYS } from "@/lib/storage";
import PlayerControls from "@/components/PlayerControls";
import EpisodeList from "@/components/EpisodeList";
import ReportModal from "@/components/ReportModal";
import Toast from "@/components/Toast";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Download,
  Layers,
  Star,
  Calendar,
  Film,
  Clock,
  Plus,
  ThumbsUp,
  Share2,
  Flag,
  ChevronDown,
} from "lucide-react";

interface RelatedItem {
  id: string;
  title: string;
  poster: string;
  genre: string;
}

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "warn";
}

interface PlaybackRecord {
  id: string;
  title: string;
  poster: string;
  time: number;
  duration: number;
  progress: number;
  updatedAt: number;
  seasonIndex: number;
  episodeIndex: number;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTickRef = useRef(0);

  const [data, setData] = useState<NormalizedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLinkIndex, setCurrentLinkIndex] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(0);
  const [currentEpisodeIdx, setCurrentEpisodeIdx] = useState(0);

  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showResumeBar, setShowResumeBar] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);

  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [resolvedId, setResolvedId] = useState(movieId);

  const notify = useCallback(
    (message: string, type: "success" | "error" | "warn" = "success") => {
      setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const wl = readJSON<string[]>(STORAGE_KEYS.WATCHLIST, []);
    const lk = readJSON<string[]>(STORAGE_KEYS.LIKED, []);
    setWatchlist(new Set(wl.map(String)));
    setLiked(new Set(lk.map(String)));
  }, []);

  const playVideo = useCallback(
    (url: string) => {
      const video = videoRef.current;
      if (!video || !url) return;
      const source = video.querySelector("source");
      if (source) {
        source.src = url;
      }
      video.load();
      video.play().catch(() => undefined);
    },
    []
  );

  useEffect(() => {
    async function loadContent() {
      if (!movieId) {
        notify("No ID provided in URL", "error");
        setTimeout(() => router.push("/"), 1200);
        return;
      }

      if (!db) {
        notify("Firebase not configured. Set .env.local variables.", "error");
        setLoading(false);
        return;
      }

      try {
        let matchKey: string | null = null;
        let matchValue: MovieItem | null = null;

        const directSnap = await get(ref(db!, `movies_by_id/${movieId}`));
        if (directSnap.exists()) {
          matchKey = movieId;
          matchValue = directSnap.val();
        } else {
          const fullSnap = await get(ref(db!, "movies_by_id"));
          if (fullSnap.exists()) {
            const raw = fullSnap.val();
            const entries: [string, MovieItem][] = Array.isArray(raw)
              ? raw.map((val: MovieItem, i: number) => [String(i), val])
              : Object.entries(raw);
            const found = entries.find(
              ([, val]) =>
                String(val?.movie_id || val?.id || "") === String(movieId)
            );
            if (found) {
              matchKey = found[0];
              matchValue = found[1];
            }
          }
        }

        if (!matchKey || !matchValue) {
          notify("Content not found", "error");
          setLoading(false);
          return;
        }

        setResolvedId(matchKey);
        const normalized = normalizeData(matchValue, matchKey);
        setData(normalized);

        document.title = `${normalized.title} | MFLIX Player`;

        const playback = readJSON<Record<string, PlaybackRecord>>(
          STORAGE_KEYS.PLAYBACK,
          {}
        );
        if (normalized.isSeries) {
          const record = playback[matchKey];
          const si = record ? asNumber(record.seasonIndex, 0) : 0;
          const ei = record ? asNumber(record.episodeIndex, 0) : 0;
          const safeSi = clamp(si, 0, Math.max(0, normalized.seasons.length - 1));
          const safeEi = clamp(
            ei,
            0,
            Math.max(0, (normalized.seasons[safeSi]?.episodes?.length || 1) - 1)
          );
          setCurrentSeason(safeSi);
          setCurrentEpisodeIdx(safeEi);
        }

        loadRelated(matchKey, normalized.genre);
      } catch (e) {
        console.error(e);
        notify("Unable to load player content", "error");
      } finally {
        setLoading(false);
      }
    }
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  useEffect(() => {
    if (!data) return;
    if (data.isSeries) {
      const season = data.seasons[currentSeason];
      const episode = season?.episodes?.[currentEpisodeIdx];
      if (episode) {
        playVideo(episode.url);
      }
    } else {
      if (data.links.length > 0) {
        playVideo(data.links[0].url);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentSeason, currentEpisodeIdx]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !data) return;

    const onLoadedMetadata = () => {
      const playback = readJSON<Record<string, PlaybackRecord>>(
        STORAGE_KEYS.PLAYBACK,
        {}
      );
      const record = playback[resolvedId];
      if (record) {
        const time = asNumber(record.time, 0);
        const dur = asNumber(record.duration, 0);
        if (time >= 20 && (dur <= 0 || time < dur - 20)) {
          setResumeTime(time);
          setShowResumeBar(true);
        }
      }
    };

    const onTimeUpdate = () => {
      if (!data) return;
      const currentTime = asNumber(video.currentTime, 0);
      const duration = asNumber(video.duration, 0);
      if (duration <= 0 || currentTime < 0) return;

      progressTickRef.current += 1;
      if (progressTickRef.current % 3 !== 0) return;

      const playback = readJSON<Record<string, PlaybackRecord>>(
        STORAGE_KEYS.PLAYBACK,
        {}
      );
      const progress = clamp((currentTime / duration) * 100, 0, 100);
      playback[resolvedId] = {
        id: resolvedId,
        title: data.title,
        poster: data.poster,
        time: currentTime,
        duration,
        progress,
        updatedAt: Date.now(),
        seasonIndex: currentSeason,
        episodeIndex: currentEpisodeIdx,
      };
      writeJSON(STORAGE_KEYS.PLAYBACK, playback);

      boundedPush(
        STORAGE_KEYS.HISTORY,
        {
          id: resolvedId,
          title: data.title,
          poster: data.poster,
          progress,
          duration,
          lastTime: currentTime,
          updatedAt: Date.now(),
          type: data.isSeries ? "series" : "movie",
        },
        60,
        "id"
      );
    };

    const onEnded = () => {
      if (data?.isSeries) {
        const next = findNextEpisode();
        if (next) {
          notify("Up next episode in 4s...", "warn");
          setTimeout(() => {
            setCurrentSeason(next.seasonIndex);
            setCurrentEpisodeIdx(next.episodeIndex);
          }, 4000);
        }
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, resolvedId, currentSeason, currentEpisodeIdx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      const video = videoRef.current;
      if (!video) return;

      const key = e.key.toLowerCase();
      if (key === " ") {
        e.preventDefault();
        if (video.paused) video.play().catch(() => undefined);
        else video.pause();
      } else if (key === "arrowright") {
        video.currentTime = clamp(
          asNumber(video.currentTime) + 10,
          0,
          asNumber(video.duration, 0)
        );
      } else if (key === "arrowleft") {
        video.currentTime = clamp(
          asNumber(video.currentTime) - 10,
          0,
          asNumber(video.duration, 0)
        );
      } else if (key === "f") {
        if (!document.fullscreenElement)
          document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      } else if (key === "m") {
        video.muted = !video.muted;
      } else if (key === "escape") {
        setShowEpisodes(false);
        setShowReport(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const findNextEpisode = useCallback(() => {
    if (!data?.isSeries) return null;
    const season = data.seasons[currentSeason];
    if (!season) return null;
    if (currentEpisodeIdx + 1 < season.episodes.length) {
      return { seasonIndex: currentSeason, episodeIndex: currentEpisodeIdx + 1 };
    }
    if (
      currentSeason + 1 < data.seasons.length &&
      data.seasons[currentSeason + 1].episodes.length > 0
    ) {
      return { seasonIndex: currentSeason + 1, episodeIndex: 0 };
    }
    return null;
  }, [data, currentSeason, currentEpisodeIdx]);

  const hasNextEpisode = useMemo(() => !!findNextEpisode(), [findNextEpisode]);

  async function loadRelated(currentId: string, genre: string) {
    if (!db) return;
    try {
      const snap = await get(query(ref(db!, "movies_by_id"), limitToLast(48)));
      if (!snap.exists()) return;
      const raw = snap.val();
      const entries: [string, MovieItem][] = Array.isArray(raw)
        ? raw.map((val: MovieItem, i: number) => [String(i), val])
        : Object.entries(raw);

      const source = entries
        .filter(([, val]) => val && typeof val === "object")
        .map(([id, val]) => ({
          id,
          title: val.title || val.original_title || "Untitled",
          poster: val.poster || FALLBACK_POSTER,
          genre: toArray(val.genre).join(", ").toLowerCase(),
        }))
        .filter((item) => item.id !== currentId);

      const currentGenre = genre.toLowerCase();
      const sorted = source
        .map((item) => ({
          ...item,
          score:
            currentGenre && item.genre.includes(currentGenre.split(",")[0])
              ? 1
              : 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      setRelated(sorted);
    } catch (e) {
      console.error(e);
    }
  }

  const handleShare = useCallback(() => {
    const shareTitle = data?.title || "MFLIX";
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator
        .share({ title: shareTitle, text: `Watch ${shareTitle} on MFLIX`, url: shareUrl })
        .catch(() => undefined);
      return;
    }
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => notify("Link copied to clipboard", "success"))
      .catch(() => notify("Could not copy link automatically", "warn"));
  }, [data, notify]);

  const handleLinkChange = useCallback(
    (index: number) => {
      if (!data) return;
      setCurrentLinkIndex(index);
      playVideo(data.links[index].url);
    },
    [data, playVideo]
  );

  const handlePlayEpisode = useCallback(
    (seasonIndex: number, episodeIndex: number) => {
      setCurrentSeason(seasonIndex);
      setCurrentEpisodeIdx(episodeIndex);
    },
    []
  );

  const handleNextEpisode = useCallback(() => {
    const next = findNextEpisode();
    if (next) {
      setCurrentSeason(next.seasonIndex);
      setCurrentEpisodeIdx(next.episodeIndex);
      notify("Playing next episode", "success");
    }
  }, [findNextEpisode, notify]);

  const toggleWatchlist = useCallback(() => {
    const isInList = watchlist.has(resolvedId);
    const updated = updateSetStorage(
      STORAGE_KEYS.WATCHLIST,
      resolvedId,
      !isInList
    );
    setWatchlist(new Set(Array.from(updated).map(String)));
    notify(isInList ? "Removed from My List" : "Added to My List", "success");
  }, [watchlist, resolvedId, notify]);

  const toggleLike = useCallback(() => {
    const isLiked = liked.has(resolvedId);
    const updated = updateSetStorage(STORAGE_KEYS.LIKED, resolvedId, !isLiked);
    setLiked(new Set(Array.from(updated).map(String)));
    notify(isLiked ? "Like removed" : "Liked", "success");
  }, [liked, resolvedId, notify]);

  const handleReport = useCallback(
    (message: string) => {
      const existing = readJSON<
        { id: string; title: string; message: string; createdAt: number }[]
      >("mflix_reports_v1", []);
      existing.unshift({
        id: resolvedId,
        title: data?.title || "Unknown",
        message,
        createdAt: Date.now(),
      });
      writeJSON("mflix_reports_v1", existing.slice(0, 100));
      notify("Thanks, report submitted", "success");
    },
    [resolvedId, data, notify]
  );

  const handleResume = useCallback(() => {
    if (videoRef.current && resumeTime > 0) {
      videoRef.current.currentTime = resumeTime;
      videoRef.current.play().catch(() => undefined);
      setShowResumeBar(false);
    }
  }, [resumeTime]);

  const currentLinks = useMemo((): LinkObject[] => {
    if (!data) return [];
    if (data.isSeries) {
      const ep = data.seasons[currentSeason]?.episodes?.[currentEpisodeIdx];
      return ep?.qualityLinks?.length ? ep.qualityLinks : [];
    }
    return data.links;
  }, [data, currentSeason, currentEpisodeIdx]);

  const currentQualityBadge = useMemo(() => {
    if (!data) return "HD";
    if (data.isSeries) {
      const ep = data.seasons[currentSeason]?.episodes?.[currentEpisodeIdx];
      return ep?.qualityLinks?.[0]?.label || data.qualityName;
    }
    return data.links[currentLinkIndex]?.label || data.qualityName;
  }, [data, currentSeason, currentEpisodeIdx, currentLinkIndex]);

  const overlayTitle = useMemo(() => {
    if (!data) return "Loading...";
    if (data.isSeries) {
      const season = data.seasons[currentSeason];
      const ep = season?.episodes?.[currentEpisodeIdx];
      return ep ? `${data.title} • ${season.name} • ${ep.title}` : data.title;
    }
    return data.title;
  }, [data, currentSeason, currentEpisodeIdx]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mflix-bg flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-white/10 border-t-mflix-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-mflix-bg flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Content not found</p>
        <Link
          href="/"
          className="px-4 py-2 bg-mflix-accent rounded-lg text-white font-bold"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mflix-bg font-inter">
      {/* Video Shell */}
      <section className="relative w-full bg-black aspect-video max-h-[min(62vh,700px)] overflow-hidden border-b border-white/10">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          preload="metadata"
          poster={data.poster || FALLBACK_POSTER}
          className="w-full h-full bg-black object-contain"
        >
          <source src="" type="video/mp4" />
        </video>

        <PlayerControls
          videoRef={videoRef}
          title={overlayTitle}
          links={currentLinks}
          currentLinkIndex={currentLinkIndex}
          onBack={() =>
            window.history.length > 1 ? router.back() : router.push("/")
          }
          onLinkChange={handleLinkChange}
          onShare={handleShare}
          showNextEpisode={hasNextEpisode}
          onNextEpisode={handleNextEpisode}
          qualityBadge={currentQualityBadge}
        />
      </section>

      {/* Content Below Player */}
      <section className="overflow-auto">
        <div className="w-full max-w-[1480px] mx-auto px-3 py-3.5 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] gap-3.5">
          {/* Main Panel */}
          <article className="rounded-2xl border border-white/[0.12] bg-white/[0.03] p-3.5">
            {/* Title Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="m-0 text-[clamp(20px,3vw,30px)] leading-tight font-bold">
                {data.title}
              </h1>
              <span className="bg-mflix-accent/90 rounded-md text-[11px] font-bold px-2 py-1">
                {currentQualityBadge}
              </span>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap gap-2 mt-2.5 mb-4">
              <MetaPill>
                <span>{data.cert}</span>
              </MetaPill>
              <MetaPill>
                <Star className="w-3 h-3 text-yellow-400" />
                <span>{data.rating}</span>
              </MetaPill>
              <MetaPill>
                <Calendar className="w-3 h-3" />
                <span>{data.year}</span>
              </MetaPill>
              <MetaPill>
                <Film className="w-3 h-3" />
                <span>{data.genre || "N/A"}</span>
              </MetaPill>
              <MetaPill>
                <Clock className="w-3 h-3" />
                <span>{data.runtime}</span>
              </MetaPill>
            </div>

            {/* Resume Bar */}
            {showResumeBar && (
              <div className="mt-3 border border-dashed border-white/20 rounded-[10px] px-2.5 py-2 flex justify-between items-center gap-2.5 text-xs">
                <span>
                  Resume from{" "}
                  {Math.floor(resumeTime / 60)}:
                  {Math.floor(resumeTime % 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
                <button
                  onClick={handleResume}
                  className="border-0 rounded-xl px-3 py-2 bg-gradient-to-br from-mflix-accent to-red-400 text-white font-bold text-xs"
                >
                  Resume
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={`grid gap-2.5 mt-3 ${
                data.isSeries
                  ? "grid-cols-[1fr_auto]"
                  : "grid-cols-[1fr_auto_auto]"
              }`}
            >
              {data.isSeries ? (
                <button
                  onClick={() => setShowEpisodes(true)}
                  className="border-0 rounded-xl h-[46px] px-3.5 font-bold text-white bg-gradient-to-br from-mflix-accent to-red-400 inline-flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" /> View Episodes
                </button>
              ) : (
                <>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowDownloadMenu(false);
                        setShowPlayMenu((v) => !v);
                      }}
                      className="w-full border-0 rounded-xl h-[46px] px-3.5 font-bold text-white bg-gradient-to-br from-mflix-accent to-red-400 inline-flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Play Movie{" "}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showPlayMenu && (
                      <div className="absolute top-[calc(100%+6px)] right-0 left-0 min-w-[180px] rounded-[10px] border border-white/[0.14] bg-[rgba(13,18,27,0.96)] overflow-hidden z-[90]">
                        {data.links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleLinkChange(i);
                              setShowPlayMenu(false);
                            }}
                            className="w-full border-0 text-left px-3 py-2.5 text-[#c5cee2] bg-transparent border-b border-white/[0.08] last:border-b-0 hover:bg-white/[0.08]"
                          >
                            Play {link.label || "HD"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowPlayMenu(false);
                        setShowDownloadMenu((v) => !v);
                      }}
                      className="border border-white/[0.16] rounded-xl bg-white/[0.08] text-white min-w-[46px] px-3 text-base h-[46px] inline-flex items-center justify-center"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {showDownloadMenu && (
                      <div className="absolute top-[calc(100%+6px)] right-0 min-w-[180px] rounded-[10px] border border-white/[0.14] bg-[rgba(13,18,27,0.96)] overflow-hidden z-[90]">
                        {data.links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              window.open(link.url, "_blank", "noopener");
                              setShowDownloadMenu(false);
                            }}
                            className="w-full border-0 text-left px-3 py-2.5 text-[#c5cee2] bg-transparent border-b border-white/[0.08] last:border-b-0 hover:bg-white/[0.08]"
                          >
                            {link.label || "HD"}{" "}
                            {link.info ? `(${link.info})` : ""}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  const q = encodeURIComponent(
                    `${data.title || "movie"} trailer`
                  );
                  window.open(
                    `https://www.youtube.com/results?search_query=${q}`,
                    "_blank",
                    "noopener"
                  );
                }}
                className="border border-white/[0.16] rounded-xl bg-white/[0.08] text-white min-w-[46px] px-3 text-base h-[46px] inline-flex items-center justify-center"
                title="Trailer"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.6 9.5.6 9.5.6s7.6 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
                </svg>
              </button>
            </div>

            {/* Social Row */}
            <div className="mt-3.5 flex flex-wrap gap-2">
              <SocialBtn
                onClick={toggleWatchlist}
                icon={<Plus className="w-3.5 h-3.5" />}
                label={watchlist.has(resolvedId) ? "Added" : "My List"}
              />
              <SocialBtn
                onClick={toggleLike}
                icon={
                  <ThumbsUp
                    className={`w-3.5 h-3.5 ${
                      liked.has(resolvedId) ? "fill-current" : ""
                    }`}
                  />
                }
                label={liked.has(resolvedId) ? "Liked" : "Like"}
              />
              <SocialBtn
                onClick={handleShare}
                icon={<Share2 className="w-3.5 h-3.5" />}
                label="Share"
              />
              <SocialBtn
                onClick={() => setShowReport(true)}
                icon={<Flag className="w-3.5 h-3.5" />}
                label="Report"
              />
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.16] to-transparent my-4" />

            {/* Synopsis */}
            <div className="text-[#c5cee2] leading-relaxed text-sm">
              {data.plot}
            </div>

            {/* Details Grid */}
            <div className="mt-3.5 grid grid-cols-2 max-md:grid-cols-1 gap-2">
              <DetailTile label="Language" value={data.language} />
              <DetailTile label="Director" value={data.director} />
              <DetailTile label="Cast" value={data.cast} />
              <DetailTile label="Platform" value={data.platform} />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="rounded-2xl border border-white/[0.12] bg-white/[0.03] p-3 grid gap-3 content-start">
            {/* Playback Tips */}
            <section className="border border-white/[0.12] rounded-xl overflow-hidden bg-white/[0.03]">
              <h3 className="m-0 text-sm p-2.5 border-b border-white/10 font-bold">
                Playback Tips
              </h3>
              <div className="p-2.5 text-xs text-gray-400 leading-relaxed space-y-1">
                <p>
                  <kbd className="border border-white/20 border-b-2 rounded-md px-1 text-white font-mono">
                    Space
                  </kbd>{" "}
                  Play/Pause,{" "}
                  <kbd className="border border-white/20 border-b-2 rounded-md px-1 text-white font-mono">
                    ←
                  </kbd>
                  /
                  <kbd className="border border-white/20 border-b-2 rounded-md px-1 text-white font-mono">
                    →
                  </kbd>{" "}
                  seek 10s
                </p>
                <p>
                  <kbd className="border border-white/20 border-b-2 rounded-md px-1 text-white font-mono">
                    F
                  </kbd>{" "}
                  Fullscreen,{" "}
                  <kbd className="border border-white/20 border-b-2 rounded-md px-1 text-white font-mono">
                    M
                  </kbd>{" "}
                  mute
                </p>
              </div>
            </section>

            {/* Related */}
            <section className="border border-white/[0.12] rounded-xl overflow-hidden bg-white/[0.03]">
              <h3 className="m-0 text-sm p-2.5 border-b border-white/10 font-bold">
                More Like This
              </h3>
              <div className="p-2.5 grid grid-cols-2 max-md:grid-cols-3 max-sm:grid-cols-2 gap-2">
                {related.length > 0 ? (
                  related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/watch/${item.id}?source=firebase`}
                      className="border border-white/[0.11] rounded-[10px] overflow-hidden bg-[#121723] block"
                    >
                      <div className="relative w-full aspect-[2/3]">
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="120px"
                          unoptimized
                        />
                      </div>
                      <p className="m-1.5 text-[11px] leading-snug truncate">
                        {item.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-gray-400 text-center text-sm">
                    No related titles found.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>

      {/* Overlays */}
      {showEpisodes && data.isSeries && (
        <EpisodeList
          seasons={data.seasons}
          currentSeason={currentSeason}
          currentEpisode={currentEpisodeIdx}
          onPlayEpisode={handlePlayEpisode}
          onClose={() => setShowEpisodes(false)}
        />
      )}

      {showReport && (
        <ReportModal
          movieId={resolvedId}
          movieTitle={data.title}
          onClose={() => setShowReport(false)}
          onSubmit={handleReport}
        />
      )}

      {/* Toasts */}
      <div className="fixed right-4 bottom-4 z-[10000] flex flex-col gap-2.5">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] text-xs text-[#c5cee2] inline-flex items-center gap-1.5">
      {children}
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/[0.12] rounded-[10px] p-2 bg-white/[0.03]">
      <p className="m-0 text-[#8d99b8] text-[11px]">{label}</p>
      <p className="m-0 mt-1 text-[13px] text-white">{value}</p>
    </div>
  );
}

function SocialBtn({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-white/[0.14] rounded-[10px] bg-white/[0.04] text-[#c5cee2] h-[38px] px-3 inline-flex items-center gap-2 hover:bg-white/[0.08] transition-colors"
    >
      {icon} {label}
    </button>
  );
}
