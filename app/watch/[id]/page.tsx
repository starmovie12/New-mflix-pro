"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { get, ref } from "firebase/database";
import { getFirebaseDatabase, FALLBACK_POSTER } from "@/lib/firebase";
import { PlayerControls } from "@/components/PlayerControls";
import { EpisodeList, type Episode, type Season } from "@/components/EpisodeList";
import {
  Play,
  Download,
  Layers,
  Plus,
  ThumbsUp,
  Share2,
  Flag,
  Star,
  Calendar,
  Film,
  Clock,
  SkipForward,
} from "lucide-react";

interface LinkItem {
  url?: string;
  link?: string;
  movie_link?: string;
  quality?: string;
  label?: string;
  size?: string;
  info?: string;
}

function parseLinkObjects(input: unknown): LinkItem[] {
  if (!input) return [];
  let data = input;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = /^https?:\/\//i.test((data as string).trim())
        ? [(data as string).trim()]
        : [];
    }
  }
  const arr = Array.isArray(data) ? data : Object.values(data || {});
  const output: LinkItem[] = [];
  arr.forEach((entry: unknown) => {
    const item = entry as Record<string, unknown>;
    if (!item) return;
    if (typeof item === "string") {
      output.push({ url: item, quality: "HD", label: "HD" });
      return;
    }
    const url =
      (item.url as string) ||
      (item.link as string) ||
      (item.movie_link as string);
    if (!url) return;
    output.push({
      url,
      quality: String(item.quality || "HD"),
      label: String(item.quality || item.label || "HD"),
      size: String(item.size || ""),
      info: String(item.size || item.info || ""),
    });
  });
  return output;
}

function normalizeSeasons(raw: Record<string, unknown>): Season[] {
  let seasonSource = raw.seasons || raw.season_list || [];
  if (
    (!seasonSource || (Array.isArray(seasonSource) && seasonSource.length === 0)) &&
    raw.episodes
  ) {
    seasonSource = [{ name: "Season 1", episodes: raw.episodes }];
  }
  if (!Array.isArray(seasonSource))
    seasonSource = Object.values(seasonSource || {});

  return (seasonSource as Season[]).map((season, sIndex) => {
    const episodeSource = season?.episodes || season?.list || [];
    const episodesArray = Array.isArray(episodeSource)
      ? episodeSource
      : Object.values(episodeSource || {});
    const episodes: Episode[] = episodesArray
      .map((ep: unknown) => {
        const e = ep as Record<string, unknown>;
        if (!e) return null;
        const qualityLinks = parseLinkObjects(
          e.download_links || e.qualities || e.links
        );
        const fallbackUrl =
          (e.url as string) ||
          (e.link as string) ||
          (e.movie_link as string) ||
          (e.video_url as string) ||
          qualityLinks[0]?.url ||
          "";
        if (!fallbackUrl) return null;
        return {
          title:
            (e.title as string) ||
            (e.name as string) ||
            (e.episode_title as string) ||
            `Episode ${episodesArray.indexOf(ep) + 1}`,
          url: fallbackUrl,
          link: fallbackUrl,
        };
      })
      .filter(Boolean) as Episode[];

    if (episodes.length === 0) return null;
    return {
      name: (season?.name as string) || (season?.title as string) || `Season ${sIndex + 1}`,
      episodes,
    };
  }).filter(Boolean) as Season[];
}

interface NormalizedData {
  isSeries: boolean;
  title: string;
  qualityName: string;
  year: string;
  genre: string;
  runtime: string;
  cert: string;
  rating: string;
  plot: string;
  poster: string;
  links: LinkItem[];
  seasons: Season[];
}

function normalizeData(raw: Record<string, unknown>, keyId: string): NormalizedData {
  const seasons = normalizeSeasons(raw);
  const typeHint = String(
    raw.content_type || raw.type || raw.category || ""
  ).toLowerCase();
  const isSeries =
    seasons.length > 0 ||
    typeHint.includes("series") ||
    typeHint.includes("tv");

  let links = parseLinkObjects(
    raw.download_links || raw.qualities || raw.links || raw.sources
  );
  const directUrl =
    (raw.url as string) ||
    (raw.link as string) ||
    (raw.movie_link as string) ||
    (raw.video_url as string);
  if (directUrl) {
    links = [
      {
        url: directUrl,
        quality: (raw.quality_name as string) || "HD",
        label: (raw.quality_name as string) || "HD",
      },
      ...links,
    ];
  }

  const genre = Array.isArray(raw.genre)
    ? (raw.genre as string[]).join(", ")
    : String(raw.genre || "Drama");
  const runtimeVal = Number(raw.runtime || raw.duration || 0);
  const runtime = runtimeVal ? `${runtimeVal}m` : "N/A";

  return {
    isSeries,
    title: (raw.title as string) || (raw.original_title as string) || "Untitled",
    qualityName: (raw.quality_name as string) || "HD",
    year: String(raw.release_year || raw.year || "2024"),
    genre,
    runtime,
    cert: (raw.certification as string) || "UA",
    rating: String(raw.rating || "0.0"),
    plot:
      (raw.description as string) ||
      (raw.overview as string) ||
      "No synopsis available.",
    poster: (raw.poster as string) || FALLBACK_POSTER,
    links,
    seasons,
  };
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const [data, setData] = useState<NormalizedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodesOpen, setEpisodesOpen] = useState(false);
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState({
    seasonIndex: 0,
    episodeIndex: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceRef = useRef<HTMLSourceElement>(null);

  const playVideo = useCallback((url: string) => {
    if (!videoRef.current || !sourceRef.current) return;
    videoRef.current.pause();
    sourceRef.current.src = url;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  }, []);

  const findNextEpisode = useCallback(() => {
    if (!data?.isSeries || !data.seasons.length) return null;
    const { seasonIndex, episodeIndex } = currentEpisodeIndex;
    const season = data.seasons[seasonIndex];
    if (!season) return null;
    if (episodeIndex + 1 < (season.episodes?.length || 0)) {
      return { seasonIndex, episodeIndex: episodeIndex + 1 };
    }
    if (
      seasonIndex + 1 < data.seasons.length &&
      (data.seasons[seasonIndex + 1]?.episodes?.length || 0) > 0
    ) {
      return { seasonIndex: seasonIndex + 1, episodeIndex: 0 };
    }
    return null;
  }, [data, currentEpisodeIndex]);

  const playEpisode = useCallback(
    (seasonIndex: number, episodeIndex: number) => {
      if (!data?.seasons[seasonIndex]?.episodes?.[episodeIndex]) return;
      const ep = data.seasons[seasonIndex].episodes[episodeIndex];
      const url = ep.url || ep.link;
      if (url) {
        setCurrentEpisode(ep);
        setCurrentEpisodeIndex({ seasonIndex, episodeIndex });
        playVideo(url);
        setEpisodesOpen(false);
      }
    },
    [data, playVideo]
  );

  const playNextEpisode = useCallback(() => {
    const next = findNextEpisode();
    if (next) playEpisode(next.seasonIndex, next.episodeIndex);
  }, [findNextEpisode, playEpisode]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const db = getFirebaseDatabase();
        let snapshot = await get(ref(db, `movies_by_id/${id}`));
        let raw: Record<string, unknown> | null = null;
        let keyId = id;

        if (snapshot.exists()) {
          raw = snapshot.val();
        } else {
          const fullSnap = await get(ref(db, "movies_by_id"));
          if (!fullSnap.exists()) {
            setLoading(false);
            return;
          }
          const val = fullSnap.val();
          const entries = Array.isArray(val)
            ? val.map((v: unknown, i: number) => [String(i), v])
            : Object.entries(val || {});
          const found = entries.find(
            ([, v]) =>
              String((v as Record<string, unknown>)?.movie_id || (v as Record<string, unknown>)?.id || "") === id
          );
          if (found) {
            keyId = String(found[0]);
            raw = found[1] as Record<string, unknown>;
          }
        }

        if (raw && typeof raw === "object") {
          const normalized = normalizeData(raw, keyId);
          setData(normalized);

          if (normalized.isSeries && normalized.seasons[0]?.episodes?.[0]) {
            const first = normalized.seasons[0].episodes[0];
            setCurrentEpisode(first);
            setCurrentEpisodeIndex({ seasonIndex: 0, episodeIndex: 0 });
            playVideo(first.url || first.link || "");
          } else if (!normalized.isSeries && normalized.links[0]?.url) {
            playVideo(normalized.links[0].url);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, playVideo]);

  useEffect(() => {
    const closeMenus = () => {
      setQualityMenuOpen(false);
      setPlayMenuOpen(false);
      setDownloadMenuOpen(false);
    };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      <div className="relative w-full bg-black shrink-0" style={{ aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          controls={false}
          autoPlay
          playsInline
          poster={data.poster}
          className="w-full h-full object-contain"
          style={{ objectFit: fitMode }}
        >
          <source ref={sourceRef} src="" type="video/mp4" />
        </video>
        <PlayerControls
          onQualityClick={() => setQualityMenuOpen((v) => !v)}
          onFitClick={() =>
            setFitMode((m) => (m === "contain" ? "cover" : "contain"))
          }
          fitMode={fitMode}
        />
        {data.isSeries && findNextEpisode() && (
          <button
            type="button"
            className="absolute bottom-4 right-4 z-[150] bg-mflix-accent/90 text-white px-4 py-2 rounded-full flex items-center gap-2 font-semibold hover:bg-mflix-accent transition-colors"
            onClick={playNextEpisode}
          >
            <SkipForward className="w-4 h-4" />
            Next Episode
          </button>
        )}
        {qualityMenuOpen && (
          <div
            className="absolute top-14 right-0 bg-[rgba(20,20,20,0.95)] border border-white/10 rounded-lg flex flex-col min-w-[140px] z-[200]"
            onClick={(e) => e.stopPropagation()}
          >
            {data.isSeries && currentEpisode ? (
              <button
                type="button"
                className="bg-transparent border-none text-[#eee] py-3 px-4 text-left border-b border-white/5 cursor-pointer w-full hover:bg-white/5"
                onClick={() => setQualityMenuOpen(false)}
              >
                Auto quality
              </button>
            ) : (
              data.links.map((link, i) => (
                <button
                  key={i}
                  type="button"
                  className="bg-transparent border-none text-[#eee] py-3 px-4 text-left border-b border-white/5 cursor-pointer w-full hover:bg-white/5"
                  onClick={() => {
                    if (link.url) playVideo(link.url);
                    setQualityMenuOpen(false);
                  }}
                >
                  Switch to {link.label || link.quality || "HD"}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-12">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <h1 className="text-2xl font-extrabold leading-tight m-0">
            {data.title}
          </h1>
          <span className="bg-mflix-accent text-white text-[11px] font-bold py-0.5 px-1.5 rounded">
            {data.qualityName}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-2 mb-6">
          <span className="bg-white/10 py-1.5 px-3 rounded text-xs text-[#e0e0e0] border border-white/5">
            {data.cert}
          </span>
          <span className="bg-white/10 py-1.5 px-3 rounded text-xs text-[#e0e0e0] border border-white/5 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            {data.rating}
          </span>
          <span className="bg-white/10 py-1.5 px-3 rounded text-xs text-[#e0e0e0] border border-white/5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {data.year}
          </span>
          <span className="bg-white/10 py-1.5 px-3 rounded text-xs text-[#e0e0e0] border border-white/5 flex items-center gap-1">
            <Film className="w-3 h-3" />
            {data.genre}
          </span>
          <span className="bg-white/10 py-1.5 px-3 rounded text-xs text-[#e0e0e0] border border-white/5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {data.runtime}
          </span>
        </div>

        <div className="h-px w-full bg-white/15 my-4" />

        <div
          className={`grid gap-3 mb-4 ${
            data.isSeries ? "grid-cols-1" : "grid-cols-[1fr_auto]"
          }`}
        >
          {data.isSeries ? (
            <button
              type="button"
              onClick={() => setEpisodesOpen(true)}
              className="bg-[#2962FF] text-white border-none rounded-md h-12 text-base font-bold flex items-center justify-center gap-2 cursor-pointer w-full hover:bg-[#3d73ff] transition-colors"
            >
              <Layers className="w-5 h-5" />
              View Episodes
            </button>
          ) : (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlayMenuOpen((v) => !v);
                  }}
                  className="w-full bg-mflix-accent text-white border-none rounded-md h-12 text-base font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-mflix-accent/90 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Play Movie
                </button>
                {playMenuOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-[rgba(20,20,20,0.95)] border border-white/10 rounded-lg flex flex-col min-w-[140px] z-[200]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {data.links.map((link, i) => (
                      <button
                        key={i}
                        type="button"
                        className="bg-transparent border-none text-[#eee] py-3 px-4 text-left border-b border-white/5 cursor-pointer w-full hover:bg-white/5"
                        onClick={() => {
                          if (link.url) playVideo(link.url);
                          setPlayMenuOpen(false);
                        }}
                      >
                        Play {link.label || link.quality || "HD"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDownloadMenuOpen((v) => !v);
                  }}
                  className="w-12 h-12 bg-[#333] text-white border-none rounded-md flex items-center justify-center cursor-pointer hover:bg-[#444] transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                {downloadMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-1 bg-[rgba(20,20,20,0.95)] border border-white/10 rounded-lg flex flex-col min-w-[140px] z-[200]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {data.links.map((link, i) => (
                      <button
                        key={i}
                        type="button"
                        className="bg-transparent border-none text-[#eee] py-3 px-4 text-left border-b border-white/5 cursor-pointer w-full hover:bg-white/5"
                        onClick={() => {
                          if (link.url) window.open(link.url, "_blank");
                          setDownloadMenuOpen(false);
                        }}
                      >
                        {link.label || link.quality} {link.info || link.size || ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-around py-1">
          <button
            type="button"
            className="bg-transparent border-none text-[#a3a3a3] flex flex-col items-center gap-1.5 text-[11px] cursor-pointer hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
            My List
          </button>
          <button
            type="button"
            className="bg-transparent border-none text-[#a3a3a3] flex flex-col items-center gap-1.5 text-[11px] cursor-pointer hover:text-white transition-colors"
          >
            <ThumbsUp className="w-5 h-5 text-white" />
            Like
          </button>
          <button
            type="button"
            className="bg-transparent border-none text-[#a3a3a3] flex flex-col items-center gap-1.5 text-[11px] cursor-pointer hover:text-white transition-colors"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: data.title,
                  text: `Watch ${data.title} on MFLIX`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
          >
            <Share2 className="w-5 h-5 text-white" />
            Share
          </button>
          <button
            type="button"
            className="bg-transparent border-none text-[#a3a3a3] flex flex-col items-center gap-1.5 text-[11px] cursor-pointer hover:text-white transition-colors"
          >
            <Flag className="w-5 h-5 text-white" />
            Report
          </button>
        </div>

        <div className="h-px w-full bg-white/15 my-4" />
        <p className="text-sm leading-relaxed text-[#ccc] mb-6">{data.plot}</p>

        <h3 className="text-white mb-4 font-bold">More Like This</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Link
              key={i}
              href="/"
              className="block rounded-md overflow-hidden bg-mflix-card"
            >
              <div className="aspect-video bg-[#222]" />
              <p className="text-xs text-[#ddd] mt-1 px-1">Related {i}</p>
            </Link>
          ))}
        </div>
      </div>

      <EpisodeList
        seasons={data.seasons}
        isOpen={episodesOpen}
        onClose={() => setEpisodesOpen(false)}
        onEpisodeSelect={(ep, seasonIndex, episodeIndex) => {
          const url = ep.url || ep.link;
          if (url) {
            setCurrentEpisode(ep);
            setCurrentEpisodeIndex({ seasonIndex, episodeIndex });
            playVideo(url);
          }
        }}
        currentEpisode={currentEpisode}
      />
    </div>
  );
}
