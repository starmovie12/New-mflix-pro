import type { MovieItem, LinkObject, Season, Episode } from "@/types/movie";

function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (val && typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function parseLinkObjects(input: unknown): { url: string; label: string; info: string }[] {
  if (!input) return [];
  let data = input;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data as string);
    } catch {
      data = /^https?:\/\//i.test((data as string).trim())
        ? [(data as string).trim()]
        : [];
    }
  }
  const entries = Array.isArray(data) ? data : Object.values((data as object) || {});
  const output: { url: string; label: string; info: string }[] = [];
  for (const entry of entries) {
    if (!entry) continue;
    if (typeof entry === "string") {
      output.push({ url: entry, label: "HD", info: "" });
      continue;
    }
    const url =
      (entry as LinkObject).url ||
      (entry as LinkObject).link ||
      (entry as Record<string, string>).movie_link ||
      (entry as Record<string, string>).file ||
      (entry as Record<string, string>).video_url;
    if (!url) continue;
    output.push({
      url: String(url),
      label: String((entry as LinkObject).quality || (entry as LinkObject).label || "HD"),
      info: String((entry as LinkObject).size || (entry as LinkObject).info || ""),
    });
  }
  return output;
}

function normalizeSeasons(raw: MovieItem): NormalizedSeason[] {
  let seasonSource = raw.seasons || raw.season_list || [];
  if (
    (!seasonSource || (Array.isArray(seasonSource) && seasonSource.length === 0)) &&
    raw.episodes
  ) {
    seasonSource = [{ name: "Season 1", episodes: raw.episodes }];
  }
  if (!Array.isArray(seasonSource)) seasonSource = Object.values(seasonSource || {});

  return (seasonSource as Season[])
    .map((season, sIndex) => {
      const episodeSource = season?.episodes || season?.list || [];
      const episodesArray = Array.isArray(episodeSource)
        ? episodeSource
        : Object.values(episodeSource || {});
      const episodes = episodesArray
        .map((ep, eIndex) => {
          if (!ep) return null;
          const qualityLinks = parseLinkObjects(
            (ep as Episode).download_links || (ep as Episode).qualities || (ep as Episode).links
          );
          const fallbackUrl =
            (ep as Episode).url ||
            (ep as Episode).link ||
            (ep as Episode).movie_link ||
            (ep as Episode).video_url ||
            (ep as Episode).stream ||
            qualityLinks[0]?.url ||
            "";
          if (!fallbackUrl) return null;
          return {
            title: (ep as Episode).title || (ep as Episode).name || `Episode ${eIndex + 1}`,
            url: fallbackUrl,
            qualityLinks,
          };
        })
        .filter(Boolean) as { title: string; url: string; qualityLinks: { url: string; label: string }[] }[];

      if (episodes.length === 0) return null;
      return {
        name: season?.name || (season as Season).title || `Season ${sIndex + 1}`,
        episodes,
      };
    })
    .filter((s): s is NormalizedSeason => Boolean(s));
}

export interface NormalizedEpisode {
  title: string;
  url: string;
  qualityLinks: { url: string; label: string }[];
}

export interface NormalizedSeason {
  name: string;
  episodes: NormalizedEpisode[];
}

export interface NormalizedContent {
  id: string;
  title: string;
  qualityName: string;
  year: string;
  genre: string;
  runtime: string;
  cert: string;
  rating: string;
  plot: string;
  language: string;
  director: string;
  cast: string;
  platform: string;
  poster: string;
  isSeries: boolean;
  links: { url: string; label: string; info: string }[];
  seasons: NormalizedSeason[];
}

export function normalizePlayerData(raw: MovieItem, keyId: string): NormalizedContent {
  const seasons = normalizeSeasons(raw);
  const typeHint = String(raw.content_type || raw.type || raw.category || "").toLowerCase();
  const isSeries =
    seasons.length > 0 || typeHint.includes("series") || typeHint.includes("tv");

  const links = parseLinkObjects(
    raw.download_links || raw.qualities || raw.links || raw.sources
  );
  const directUrl = raw.url || raw.link || raw.movie_link || raw.video_url;
  if (directUrl) {
    links.unshift({
      url: String(directUrl),
      label: raw.quality_name || "HD",
      info: "",
    });
  }

  const seen = new Set<string>();
  const uniqueLinks = links.filter((l) => {
    if (!l.url || seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });

  const formatDuration = (mins: number) => {
    if (!mins || mins < 0) return "--";
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const parseYear = (v: unknown) => {
    const n = Number(v);
    return !isNaN(n) && n > 1900 ? String(Math.floor(n)) : "2024";
  };

  return {
    id: keyId,
    title: raw.title || raw.original_title || "Untitled",
    qualityName: raw.quality_name || "HD",
    year: parseYear(raw.year || raw.release_year || "2024"),
    genre: toArray(raw.genre).join(", "),
    runtime: formatDuration(Number(raw.runtime || raw.duration) || 0),
    cert: (raw as Record<string, string>).certification || "UA",
    rating: String(raw.rating || "0.0"),
    plot: raw.description || raw.overview || "No synopsis available.",
    language: toArray(raw.spoken_languages || raw.original_language || "Dub").join(", "),
    director: raw.director || "Unknown",
    cast: toArray(raw.cast).join(", "),
    platform: raw.platform || "MFLIX",
    poster: raw.poster || "https://via.placeholder.com/400x600?text=MFLIX",
    isSeries,
    links: uniqueLinks,
    seasons,
  };
}
