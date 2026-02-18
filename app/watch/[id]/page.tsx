"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Layers } from "lucide-react";
import { useMovieById } from "@/lib/hooks/useMovieById";
import type { MflixMovie } from "@/lib/movies";
import { EpisodeList, type Episode, type Season } from "@/components/EpisodeList";
import { PlayerControls, type QualityOption } from "@/components/PlayerControls";

function normalize(raw: MflixMovie) {
  const isSeries =
    raw.content_type === "series" ||
    raw.type === "series" ||
    (Array.isArray((raw as any).seasons) && (raw as any).seasons.length > 0) ||
    String(raw.category || "").toLowerCase().includes("series");

  const title = String(raw.title || (raw as any).original_title || "Untitled");
  const qualityName = String(raw.quality_name || "HD");
  const year = String((raw as any).release_year || raw.year || "2024");
  const genre = Array.isArray((raw as any).genre) ? (raw as any).genre.join(", ") : String((raw as any).genre || "Drama");
  const runtime = raw.runtime ? `${raw.runtime}m` : "N/A";

  let links: QualityOption[] = [];
  if (!isSeries) {
    let rawLinks: any = (raw as any).download_links || (raw as any).qualities;
    if (typeof rawLinks === "string") {
      try {
        rawLinks = JSON.parse(rawLinks);
      } catch {
        rawLinks = [];
      }
    }
    const arr = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks || {});
    links = arr
      .map((item: any) => {
        const url = item?.url || item?.link || item?.movie_link;
        if (!url) return null;
        return {
          url: String(url),
          label: String(item?.quality || item?.label || "HD"),
          info: item?.size ? String(item.size) : undefined,
          server: item?.server ? String(item.server) : undefined
        } satisfies QualityOption;
      })
      .filter(Boolean) as QualityOption[];
  }

  const seasons: Season[] = Array.isArray((raw as any).seasons) ? ((raw as any).seasons as Season[]) : [];

  return {
    isSeries,
    title,
    qualityName,
    year,
    genre,
    runtime,
    rating: String(raw.rating ?? "0.0"),
    cert: String((raw as any).certification || "UA"),
    plot: String((raw as any).description || (raw as any).overview || "No synopsis available."),
    links,
    seasons
  };
}

function flattenEpisodes(seasons: Season[]) {
  const flat: Episode[] = [];
  seasons.forEach((s) => s.episodes?.forEach((e) => flat.push(e)));
  return flat;
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { loading, error, item } = useMovieById(params.id);
  const vRef = useRef<HTMLVideoElement | null>(null);

  const data = useMemo(() => (item ? normalize(item) : null), [item]);
  const qualities = useMemo(() => data?.links || [], [data]);
  const episodes = useMemo(() => (data?.isSeries ? flattenEpisodes(data.seasons) : []), [data]);

  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [episodesOpen, setEpisodesOpen] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const servers = useMemo(() => {
    const set = new Set<string>();
    (qualities || []).forEach((q) => set.add(q.server || "Server 1"));
    return Array.from(set);
  }, [qualities]);
  const [activeServer, setActiveServer] = useState<string>("Server 1");
  useEffect(() => {
    if (!servers.length) return;
    if (!servers.includes(activeServer)) setActiveServer(servers[0] || "Server 1");
  }, [servers, activeServer]);

  const qualitiesForServer = useMemo(() => {
    const s = activeServer || "Server 1";
    return (qualities || []).filter((q) => (q.server || "Server 1") === s);
  }, [qualities, activeServer]);
  const [activeQuality, setActiveQuality] = useState<QualityOption | null>(null);
  useEffect(() => {
    if (data?.isSeries) return;
    const next = qualitiesForServer[0] || null;
    setActiveQuality((prev) => {
      if (prev && qualitiesForServer.some((q) => q.url === prev.url)) return prev;
      return next;
    });
  }, [data?.isSeries, qualitiesForServer]);

  const playUrl = useCallback((url?: string | null) => {
    if (!url) return;
    setCurrentUrl(url);
    const v = vRef.current;
    if (!v) return;
    try {
      v.pause();
      v.src = url;
      v.load();
      v.play().catch(() => undefined);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.isSeries) {
      const first = episodes[0];
      if (first) playUrl((first.url || first.link) ?? null);
    } else {
      if (qualities[0]) playUrl(qualities[0].url);
    }
  }, [data, episodes, qualities, playUrl]);

  const onSelectEpisode = useCallback(
    (ep: Episode) => {
      const url = (ep.url || ep.link) ?? null;
      if (!url) return;
      const idx = episodes.findIndex((e) => (e.url || e.link) === url);
      if (idx >= 0) setCurrentEpisodeIndex(idx);
      playUrl(url);
      setEpisodesOpen(false);
    },
    [episodes, playUrl]
  );

  const onNextEpisode = useCallback(() => {
    const next = episodes[currentEpisodeIndex + 1];
    if (!next) return;
    setCurrentEpisodeIndex((i) => i + 1);
    playUrl((next.url || next.link) ?? null);
  }, [episodes, currentEpisodeIndex, playUrl]);

  if (loading) {
    return (
      <main className="min-h-dvh bg-mflix-bg text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-white/70">Loading…</div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-dvh bg-mflix-bg text-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="text-sm text-white/70">{error || "Not found"}</div>
          <button
            type="button"
            className="mt-4 rounded-md bg-mflix-red px-4 py-2 text-sm font-bold text-white"
            onClick={() => router.push("/")}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const showNextEpisode = data.isSeries && currentEpisodeIndex < episodes.length - 1;

  return (
    <main className="min-h-dvh bg-[#0f0f0f] text-white">
      <div className="flex min-h-dvh flex-col overflow-hidden">
        <div className="relative w-full bg-black aspect-video shrink-0">
          <video
            ref={vRef}
            className="h-full w-full"
            style={{ objectFit: fit }}
            playsInline
            preload="metadata"
            controls={false}
          />

          <PlayerControls
            title={data.title}
            qualities={data.isSeries ? [] : qualitiesForServer}
            showNextEpisode={showNextEpisode}
            onBack={() => router.back()}
            onToggleFit={() => setFit((f) => (f === "contain" ? "cover" : "contain"))}
            onSelectQuality={(q) => {
              setActiveQuality(q);
              playUrl(q.url);
            }}
            onOpenEpisodes={data.isSeries ? () => setEpisodesOpen(true) : undefined}
            onNextEpisode={data.isSeries ? onNextEpisode : undefined}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-14 pt-4">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-extrabold leading-tight">{data.title}</h1>
              <span className="rounded-[4px] bg-mflix-red px-2 py-[2px] text-[11px] font-bold">{data.qualityName}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/90">
              <span className="rounded-md border border-white/5 bg-white/10 px-3 py-1">{data.cert}</span>
              <span className="rounded-md border border-white/5 bg-white/10 px-3 py-1">★ {data.rating}</span>
              <span className="rounded-md border border-white/5 bg-white/10 px-3 py-1">{data.year}</span>
              <span className="rounded-md border border-white/5 bg-white/10 px-3 py-1">{data.genre}</span>
              <span className="rounded-md border border-white/5 bg-white/10 px-3 py-1">{data.runtime}</span>
            </div>

            <div className="my-4 h-px w-full bg-white/15" />

            {!data.isSeries ? (
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                  <details className="relative w-full">
                    <summary className="flex list-none items-center justify-between rounded-[6px] bg-[#222] px-4 py-3 text-[14px] font-bold text-white">
                      <span>Server</span>
                      <span className="text-white/70">{activeServer}</span>
                    </summary>
                    <div className="absolute left-0 right-0 top-[52px] z-20 flex flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[rgba(20,20,20,0.95)]">
                      {(servers.length ? servers : ["Server 1"]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setActiveServer(s)}
                          className="border-b border-white/5 px-4 py-3 text-left text-sm text-white/90 hover:bg-white/5 last:border-b-0"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </details>

                  <details className="relative w-full">
                    <summary className="flex list-none items-center justify-between rounded-[6px] bg-[#222] px-4 py-3 text-[14px] font-bold text-white">
                      <span>Quality</span>
                      <span className="text-white/70">{activeQuality?.label || "Select"}</span>
                    </summary>
                    <div className="absolute left-0 right-0 top-[52px] z-20 flex flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[rgba(20,20,20,0.95)]">
                      {qualitiesForServer.length ? (
                        qualitiesForServer.map((q) => (
                          <button
                            key={`${q.label}-${q.url}`}
                            type="button"
                            onClick={() => setActiveQuality(q)}
                            className="border-b border-white/5 px-4 py-3 text-left text-sm text-white/90 hover:bg-white/5 last:border-b-0"
                          >
                            {q.info ? `${q.label} ${q.info}` : q.label}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-white/60">No qualities</div>
                      )}
                    </div>
                  </details>

                  <button
                    type="button"
                    onClick={() => playUrl(activeQuality?.url || qualitiesForServer[0]?.url || null)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-mflix-red px-4 text-[16px] font-bold text-white sm:w-auto sm:px-6"
                  >
                    <Play className="h-5 w-5" /> Play
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setEpisodesOpen(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#2962FF] text-[16px] font-bold text-white"
                >
                  <Layers className="h-5 w-5" /> View Episodes
                </button>
              </div>
            )}

            <div className="my-4 h-px w-full bg-white/15" />

            <div className="text-[14px] leading-6 text-white/80">{data.plot}</div>

            {currentUrl ? (
              <div className="mt-6 text-[12px] text-white/45">
                Currently playing: <span className="break-all">{currentUrl}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <EpisodeList
        open={episodesOpen}
        seasons={data.seasons}
        onClose={() => setEpisodesOpen(false)}
        onPlayEpisode={onSelectEpisode}
      />
    </main>
  );
}

