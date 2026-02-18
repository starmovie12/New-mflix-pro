"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { get, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { normalizePlayerData, type NormalizedContent } from "@/lib/player-utils";
import { PlayerControls } from "@/components/player/PlayerControls";
import { EpisodeList } from "@/components/player/EpisodeList";
import type { MovieItem } from "@/types/movie";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

async function findItemById(id: string): Promise<{ key: string; value: MovieItem } | null> {
  const directSnap = await get(ref(db, `movies_by_id/${id}`));
  if (directSnap.exists()) return { key: id, value: directSnap.val() as MovieItem };

  const fullSnap = await get(ref(db, "movies_by_id"));
  if (!fullSnap.exists()) return null;

  const data = fullSnap.val();
  const entries = Array.isArray(data)
    ? data.map((v: unknown, i: number) => [String(i), v])
    : Object.entries(data || {});
  const found = entries.find(
    ([, v]) => String((v as MovieItem)?.movie_id || (v as MovieItem)?.id || "") === String(id)
  );
  if (!found) return null;
  return { key: String(found[0]), value: found[1] as MovieItem };
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [data, setData] = useState<NormalizedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [currentQuality, setCurrentQuality] = useState("");
  const [qualityOptions, setQualityOptions] = useState<{ label: string; url: string }[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState({ seasonIndex: 0, episodeIndex: 0 });
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [episodesOpen, setEpisodesOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const playVideo = useCallback((url: string) => {
    if (!url) return;
    setVideoUrl(url);
    if (videoRef.current) {
      const source = videoRef.current.querySelector("#videoSource") as HTMLSourceElement;
      if (source) {
        source.src = url;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }
  }, []);

  const findNextEpisode = useCallback(() => {
    if (!data?.isSeries || !data.seasons.length) return null;
    const { seasonIndex, episodeIndex } = currentEpisode;
    const season = data.seasons[seasonIndex];
    if (!season) return null;
    if (episodeIndex + 1 < season.episodes.length) {
      return { seasonIndex, episodeIndex: episodeIndex + 1 };
    }
    if (
      seasonIndex + 1 < data.seasons.length &&
      data.seasons[seasonIndex + 1].episodes.length > 0
    ) {
      return { seasonIndex: seasonIndex + 1, episodeIndex: 0 };
    }
    return null;
  }, [data, currentEpisode]);

  const playEpisode = useCallback(
    (seasonIndex: number, episodeIndex: number) => {
      if (!data?.isSeries) return;
      const season = data.seasons[seasonIndex];
      const episode = season?.episodes?.[episodeIndex];
      if (!episode) return;

      setCurrentEpisode({ seasonIndex, episodeIndex });
      playVideo(episode.url);

      const opts = (episode as { qualityLinks?: { url: string; label: string }[] }).qualityLinks || [];
      setQualityOptions(opts.map((l) => ({ label: l.label, url: l.url })));
      setCurrentQuality(opts[0]?.label || data.qualityName);

      const next = findNextEpisode();
      setShowNextEpisode(!!next);
    },
    [data, playVideo, findNextEpisode]
  );

  const playNextEpisode = useCallback(() => {
    const next = findNextEpisode();
    if (next) playEpisode(next.seasonIndex, next.episodeIndex);
  }, [findNextEpisode, playEpisode]);

  useEffect(() => {
    if (!id) {
      setError("No ID provided");
      setLoading(false);
      return;
    }

    findItemById(id)
      .then((match) => {
        if (!match) {
          setError("Content not found");
          return;
        }
        const normalized = normalizePlayerData(match.value, match.key);
        setData(normalized);

        if (normalized.isSeries) {
          const defaultEp = { seasonIndex: 0, episodeIndex: 0 };
          const season = normalized.seasons[0];
          const episode = season?.episodes?.[0];
          if (episode) {
            setVideoUrl(episode.url);
            setQualityOptions(
              (episode as { qualityLinks?: { url: string; label: string }[] }).qualityLinks?.map((l) => ({
                label: l.label,
                url: l.url,
              })) || []
            );
            setCurrentQuality(
              (episode as { qualityLinks?: { url: string; label: string }[] }).qualityLinks?.[0]?.label ||
                normalized.qualityName
            );
            setCurrentEpisode(defaultEp);
            setShowNextEpisode(!!(season?.episodes?.[1] || normalized.seasons[1]));
          }
        } else {
          if (normalized.links.length > 0) {
            setVideoUrl(normalized.links[0].url);
            setQualityOptions(normalized.links.map((l) => ({ label: l.label, url: l.url })));
            setCurrentQuality(normalized.links[0].label);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load content");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    const source = videoRef.current.querySelector("#videoSource") as HTMLSourceElement;
    if (source) {
      source.src = videoUrl;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const dur = video.duration || 0;
      const cur = video.currentTime || 0;
      if (dur > 0) setProgress((cur / dur) * 100);
      setShowSkipIntro(cur > 4 && cur < 95);
      if (data?.isSeries && dur > 0 && dur - cur < 20) setShowNextEpisode(!!findNextEpisode());
    };

    const onEnded = () => {
      if (data?.isSeries && findNextEpisode()) {
        setTimeout(playNextEpisode, 4000);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [data, findNextEpisode, playNextEpisode]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  const handleQualityChange = useCallback((url: string, label: string) => {
    playVideo(url);
    setCurrentQuality(label);
  }, [playVideo]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: data?.title || "MFLIX", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }, [data?.title]);

  const handleSkipIntro = useCallback(() => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      videoRef.current.currentTime = Math.min(
        (videoRef.current.currentTime || 0) + 90,
        dur
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#E50914] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 p-4">
        <p>{error || "Content not found"}</p>
        <Link href="/" className="text-[#E50914] hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <div className="grid grid-rows-[auto_1fr] min-h-screen">
        <section className="relative w-full bg-black aspect-video max-h-[62vh] overflow-hidden">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            poster={data.poster}
            className="w-full h-full object-contain bg-black"
            autoPlay
          >
            <source id="videoSource" src={videoUrl} type="video/mp4" />
          </video>
          <PlayerControls
            title={data.title}
            onBack={handleBack}
            videoRef={videoRef}
            progress={progress}
            qualityOptions={qualityOptions}
            onQualityChange={handleQualityChange}
            speedOptions={SPEED_OPTIONS}
            currentSpeed={currentSpeed}
            onSpeedChange={setCurrentSpeed}
            onShare={handleShare}
            showNextEpisode={showNextEpisode}
            onNextEpisode={playNextEpisode}
            showSkipIntro={showSkipIntro}
            onSkipIntro={handleSkipIntro}
          />
        </section>

        <section className="overflow-auto flex-1">
          <div className="max-w-[1480px] mx-auto p-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <article className="rounded-2xl border border-white/12 bg-white/3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold m-0">{data.title}</h1>
                <span className="rounded-md text-xs font-bold py-1 px-2 bg-[#E50914]/90">
                  {currentQuality || data.qualityName}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                <span className="px-2.5 py-1.5 rounded-full border border-white/12 bg-white/4 text-xs">
                  {data.cert}
                </span>
                <span className="px-2.5 py-1.5 rounded-full border border-white/12 bg-white/4 text-xs flex items-center gap-1">
                  ★ {data.rating}
                </span>
                <span className="px-2.5 py-1.5 rounded-full border border-white/12 bg-white/4 text-xs">
                  {data.year}
                </span>
                <span className="px-2.5 py-1.5 rounded-full border border-white/12 bg-white/4 text-xs">
                  {data.genre}
                </span>
                <span className="px-2.5 py-1.5 rounded-full border border-white/12 bg-white/4 text-xs">
                  {data.runtime}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.isSeries ? (
                  <button
                    onClick={() => setEpisodesOpen(true)}
                    className="flex items-center gap-2 rounded-xl h-12 px-4 font-bold text-white bg-gradient-to-br from-[#E50914] to-[#E50914]/80"
                  >
                    View Episodes
                  </button>
                ) : (
                  qualityOptions.length > 0 && (
                    <button
                      onClick={() => playVideo(qualityOptions[0].url)}
                      className="flex items-center gap-2 rounded-xl h-12 px-4 font-bold text-white bg-gradient-to-br from-[#E50914] to-[#E50914]/80"
                    >
                      Play Movie
                    </button>
                  )
                )}
              </div>
              <p className="mt-4 text-[#c5cee2] leading-relaxed">{data.plot}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-lg border border-white/12 p-2">
                  <p className="text-xs text-[#8d99b8] m-0">Language</p>
                  <p className="text-sm m-0 mt-1">{data.language}</p>
                </div>
                <div className="rounded-lg border border-white/12 p-2">
                  <p className="text-xs text-[#8d99b8] m-0">Director</p>
                  <p className="text-sm m-0 mt-1">{data.director}</p>
                </div>
                <div className="rounded-lg border border-white/12 p-2 col-span-2">
                  <p className="text-xs text-[#8d99b8] m-0">Cast</p>
                  <p className="text-sm m-0 mt-1">{data.cast}</p>
                </div>
              </div>
            </article>
            <aside className="rounded-xl border border-white/12 bg-white/3 p-3">
              <h3 className="text-sm font-semibold m-0 pb-2 border-b border-white/10">
                Playback Tips
              </h3>
              <div className="text-xs text-[#8d99b8] mt-2 space-y-1">
                <p><kbd className="px-1 py-0.5 rounded border border-white/20">Space</kbd> Play/Pause</p>
                <p><kbd className="px-1 py-0.5 rounded border border-white/20">←</kbd>/<kbd className="px-1 py-0.5 rounded border border-white/20">→</kbd> seek 10s</p>
                <p><kbd className="px-1 py-0.5 rounded border border-white/20">F</kbd> Fullscreen, <kbd className="px-1 py-0.5 rounded border border-white/20">M</kbd> mute</p>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {data.isSeries && data.seasons.length > 0 && (
        <EpisodeList
          seasons={data.seasons}
          currentSeason={currentEpisode.seasonIndex}
          currentEpisode={currentEpisode.episodeIndex}
          onSelectEpisode={playEpisode}
          onClose={() => setEpisodesOpen(false)}
          isOpen={episodesOpen}
        />
      )}
    </div>
  );
}
