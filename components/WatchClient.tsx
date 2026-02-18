"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layers, Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { EpisodeList } from "@/components/player/EpisodeList";
import { PlayerControls } from "@/components/player/PlayerControls";
import { SourceSelector } from "@/components/player/SourceSelector";
import { fetchMovieById, fetchRelatedMovies } from "@/lib/movies";
import type { Episode, MediaLink, MovieItem } from "@/types/movie";

type WatchClientProps = {
  id: string;
};

function nextEpisodeIndex(
  movie: MovieItem | null,
  seasonIndex: number,
  episodeIndex: number
) {
  if (!movie?.isSeries) return null;
  const season = movie.seasons[seasonIndex];
  if (!season) return null;

  if (episodeIndex + 1 < season.episodes.length) {
    return { seasonIndex, episodeIndex: episodeIndex + 1 };
  }
  if (seasonIndex + 1 < movie.seasons.length) {
    return { seasonIndex: seasonIndex + 1, episodeIndex: 0 };
  }
  return null;
}

function episodeTitle(movie: MovieItem, seasonIndex: number, episodeIndex: number) {
  const season = movie.seasons[seasonIndex];
  const episode = season?.episodes[episodeIndex];
  if (!season || !episode) return movie.title;
  return `${season.name} • ${episode.title}`;
}

export function WatchClient({ id }: WatchClientProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<MovieItem | null>(null);
  const [related, setRelated] = useState<MovieItem[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [overlayTitle, setOverlayTitle] = useState("MFLIX");
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [episodeListOpen, setEpisodeListOpen] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [selectedServer, setSelectedServer] = useState("Server 1");
  const [selectedQuality, setSelectedQuality] = useState("HD");

  useEffect(() => {
    const run = async () => {
      try {
        const content = await fetchMovieById(id);
        setMovie(content);

        if (!content) return;

        const firstLink = content.links[0];
        if (content.isSeries && content.seasons[0]?.episodes[0]) {
          const firstEpisode = content.seasons[0].episodes[0];
          setCurrentSeason(0);
          setCurrentEpisode(0);
          setVideoUrl(firstEpisode.url);
          setOverlayTitle(episodeTitle(content, 0, 0));
          setSelectedServer(firstEpisode.links[0]?.server || "Server 1");
          setSelectedQuality(firstEpisode.links[0]?.label || "HD");
        } else if (firstLink) {
          setVideoUrl(firstLink.url);
          setOverlayTitle(content.title);
          setSelectedServer(firstLink.server || "Server 1");
          setSelectedQuality(firstLink.label || content.qualityName);
        }

        const relatedList = await fetchRelatedMovies(content.id, content.genre);
        setRelated(relatedList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;
    videoRef.current.load();
    videoRef.current.play().catch(() => undefined);
  }, [videoUrl]);

  useEffect(() => {
    if (!qualityMenuOpen) return;

    const close = () => setQualityMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [qualityMenuOpen]);

  const currentEpisodeData: Episode | null = useMemo(() => {
    if (!movie?.isSeries) return null;
    return movie.seasons[currentSeason]?.episodes[currentEpisode] || null;
  }, [movie, currentSeason, currentEpisode]);

  const selectableLinks: MediaLink[] = useMemo(() => {
    if (!movie) return [];
    if (movie.isSeries) return currentEpisodeData?.links || [];
    return movie.links;
  }, [movie, currentEpisodeData]);

  const servers = useMemo(() => {
    const values = selectableLinks.map((link) => link.server || "Server 1");
    return [...new Set(values)];
  }, [selectableLinks]);

  const qualities = useMemo(() => {
    const values = selectableLinks.map((link) => link.label || "HD");
    return [...new Set(values)];
  }, [selectableLinks]);

  const nextEpisode = nextEpisodeIndex(movie, currentSeason, currentEpisode);

  const playSelectedSource = () => {
    const selected =
      selectableLinks.find(
        (link) =>
          (link.server || "Server 1") === selectedServer &&
          (link.label || "HD") === selectedQuality
      ) ||
      selectableLinks.find((link) => (link.server || "Server 1") === selectedServer) ||
      selectableLinks.find((link) => (link.label || "HD") === selectedQuality) ||
      selectableLinks[0];

    if (!selected) return;
    setVideoUrl(selected.url);
  };

  const playEpisode = (seasonIndex: number, episodeIndex: number) => {
    if (!movie?.isSeries) return;
    const episode = movie.seasons[seasonIndex]?.episodes[episodeIndex];
    if (!episode) return;
    setCurrentSeason(seasonIndex);
    setCurrentEpisode(episodeIndex);
    setVideoUrl(episode.url);
    setOverlayTitle(episodeTitle(movie, seasonIndex, episodeIndex));
    setSelectedServer(episode.links[0]?.server || "Server 1");
    setSelectedQuality(episode.links[0]?.label || "HD");
  };

  const playNextEpisode = () => {
    if (!nextEpisode) return;
    playEpisode(nextEpisode.seasonIndex, nextEpisode.episodeIndex);
  };

  const changeQualityFromOverlay = (link: MediaLink) => {
    setVideoUrl(link.url);
    setSelectedServer(link.server || "Server 1");
    setSelectedQuality(link.label || "HD");
    setQualityMenuOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white">
      <div className="relative mx-auto w-full max-w-[1100px]">
        <div className="relative w-full overflow-hidden bg-black [aspect-ratio:16/9]">
          <video
            ref={videoRef}
            controls={false}
            autoPlay
            playsInline
            poster={movie?.poster || ""}
            className="h-full w-full object-contain"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          <PlayerControls
            title={overlayTitle}
            onBack={() => {
              if (window.history.length > 1) router.back();
              else router.push("/");
            }}
            onToggleQuality={() => setQualityMenuOpen((value) => !value)}
            onNextEpisode={playNextEpisode}
            showNextEpisode={Boolean(movie?.isSeries && nextEpisode)}
          />

          {qualityMenuOpen ? (
            <div className="absolute right-3 top-14 z-30 min-w-[140px] overflow-hidden rounded-lg border border-white/15 bg-[rgba(20,20,20,0.95)]">
              {selectableLinks.length > 0 ? (
                selectableLinks.map((link) => (
                  <button
                    key={`${link.server}-${link.label}-${link.url}`}
                    type="button"
                    onClick={() => changeQualityFromOverlay(link)}
                    className="block w-full border-b border-white/10 px-4 py-3 text-left text-sm text-white last:border-b-0 hover:bg-white/10"
                  >
                    {(link.label || "HD").toUpperCase()} • {link.server || "Server 1"}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-[#aaa]">No sources available.</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-4 py-4 pb-12">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-7 w-2/3 rounded bg-white/10" />
            <div className="h-12 w-full rounded bg-white/10" />
            <div className="h-24 w-full rounded bg-white/10" />
          </div>
        ) : null}

        {!loading && !movie ? (
          <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-[#bbb]">
            Content not found.
          </p>
        ) : null}

        {!loading && movie ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold">{movie.title}</h1>
              <span className="rounded bg-[#e50914] px-2 py-1 text-[11px] font-bold">
                {movie.qualityName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-white/10 px-3 py-1.5">{movie.cert}</span>
              <span className="rounded bg-white/10 px-3 py-1.5">
                <Star className="mr-1 inline-block text-[#ffc107]" size={12} />
                {movie.rating}
              </span>
              <span className="rounded bg-white/10 px-3 py-1.5">{movie.year}</span>
              <span className="rounded bg-white/10 px-3 py-1.5">{movie.genre}</span>
              <span className="rounded bg-white/10 px-3 py-1.5">{movie.runtime}</span>
            </div>

            {movie.isSeries ? (
              <button
                type="button"
                onClick={() => setEpisodeListOpen(true)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#2962ff] text-sm font-bold text-white"
              >
                <Layers size={16} />
                Episodes
              </button>
            ) : (
              <SourceSelector
                servers={servers.length ? servers : ["Server 1"]}
                qualities={qualities.length ? qualities : ["HD"]}
                selectedServer={selectedServer}
                selectedQuality={selectedQuality}
                onServerChange={setSelectedServer}
                onQualityChange={setSelectedQuality}
                onPlay={playSelectedSource}
              />
            )}

            <p className="text-sm leading-6 text-[#ccc]">{movie.description}</p>

            <div>
              <h2 className="mb-3 text-lg font-semibold">More Like This</h2>
              <div className="grid grid-cols-3 gap-2.5">
                {related.map((item) => (
                  <Link key={item.id} href={`/watch/${item.id}`} className="block">
                    <Image
                      src={item.poster}
                      alt={item.title}
                      width={240}
                      height={360}
                      className="w-full rounded-md object-cover [aspect-ratio:2/3]"
                    />
                    <p className="mt-1 text-xs text-[#ddd]">{item.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <EpisodeList
        open={episodeListOpen}
        seasons={movie?.seasons || []}
        currentSeason={currentSeason}
        currentEpisode={currentEpisode}
        onClose={() => setEpisodeListOpen(false)}
        onSelectEpisode={playEpisode}
      />
    </div>
  );
}
