import {
  MovieItem,
  LinkObject,
  NormalizedData,
  NormalizedSeason,
  LinkInput,
  LinkEntryInput,
  SeasonInput,
  EpisodeInput,
} from "./types";
import { toLower, toArray, asNumber, formatDuration, parseYear, FALLBACK_POSTER } from "./utils";

export function parseLinkObjects(input: LinkInput | undefined): LinkObject[] {
  if (!input) return [];
  let data: unknown = input;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = /^https?:\/\//i.test((data as string).trim())
        ? [(data as string).trim()]
        : [];
    }
  }

  const entries: unknown[] = Array.isArray(data)
    ? data
    : Object.values((data as Record<string, unknown>) || {});

  const output: LinkObject[] = [];
  entries.forEach((entry) => {
    if (!entry) return;
    if (typeof entry === "string") {
      output.push({ url: entry, label: "HD", info: "" });
      return;
    }
    const e = entry as LinkEntryInput;
    const url = e.url || e.link || e.movie_link || e.file || e.video_url;
    if (!url) return;
    output.push({
      url,
      label: String(e.quality || e.label || "HD"),
      info: String(e.size || e.info || ""),
    });
  });
  return output;
}

export function normalizeSeasons(raw: MovieItem): NormalizedSeason[] {
  let seasonSource: SeasonInput[] | Record<string, SeasonInput> =
    raw.seasons || raw.season_list || [];
  if (
    (!seasonSource ||
      (Array.isArray(seasonSource) && seasonSource.length === 0)) &&
    raw.episodes
  ) {
    seasonSource = [
      { name: "Season 1", episodes: raw.episodes as EpisodeInput[] },
    ];
  }
  if (!Array.isArray(seasonSource))
    seasonSource = Object.values(seasonSource || {});

  return (seasonSource as SeasonInput[])
    .map((season, sIndex) => {
      const episodeSource = season?.episodes || season?.list || [];
      const episodesArray = Array.isArray(episodeSource)
        ? episodeSource
        : Object.values(episodeSource || {});
      const episodes = (episodesArray as EpisodeInput[])
        .map((ep, eIndex) => {
          if (!ep) return null;
          const qualityLinks = parseLinkObjects(
            ep.download_links || ep.qualities || ep.links
          );
          const fallbackUrl =
            ep.url ||
            ep.link ||
            ep.movie_link ||
            ep.video_url ||
            ep.stream ||
            qualityLinks[0]?.url ||
            "";
          if (!fallbackUrl) return null;
          return {
            title:
              ep.title ||
              ep.name ||
              ep.episode_title ||
              `Episode ${eIndex + 1}`,
            url: fallbackUrl,
            qualityLinks,
            runtimeMinutes: asNumber(ep.runtime || ep.duration, 0),
            description: ep.description || "",
          };
        })
        .filter(Boolean);

      if (episodes.length === 0) return null;
      return {
        name: season?.name || season?.title || `Season ${sIndex + 1}`,
        episodes: episodes as NonNullable<(typeof episodes)[number]>[],
      };
    })
    .filter(Boolean) as NormalizedSeason[];
}

export function normalizeData(raw: MovieItem, keyId: string): NormalizedData {
  const seasons = normalizeSeasons(raw);
  const typeHint = toLower(raw.content_type || raw.type || raw.category || "");
  const isSeries =
    seasons.length > 0 ||
    typeHint.includes("series") ||
    typeHint.includes("tv");

  const links = parseLinkObjects(
    raw.download_links || raw.qualities || raw.links || raw.sources
  );
  const directUrl = raw.url || raw.link || raw.movie_link || raw.video_url;
  if (directUrl) {
    links.unshift({
      url: directUrl,
      label: raw.quality_name || "HD",
      info: "",
    });
  }

  const uniqueLinks: LinkObject[] = [];
  const seen = new Set<string>();
  links.forEach((link) => {
    if (!link?.url || seen.has(link.url)) return;
    seen.add(link.url);
    uniqueLinks.push(link);
  });

  return {
    id: keyId,
    title: raw.title || raw.original_title || "Untitled",
    qualityName: raw.quality_name || "HD",
    year: parseYear(raw.year || raw.release_year || "2024"),
    genre: toArray(raw.genre || "Drama").join(", "),
    runtime: formatDuration(asNumber(raw.runtime || raw.duration, 0)),
    cert: raw.certification || "UA",
    rating: String(raw.rating || "0.0"),
    plot: raw.description || raw.overview || "No synopsis available.",
    language: toArray(raw.spoken_languages || raw.original_language || "Dub").join(", "),
    director: raw.director || "Unknown",
    cast: toArray(raw.cast || "N/A").join(", "),
    platform: raw.platform || "MFLIX",
    poster: raw.poster || FALLBACK_POSTER,
    isSeries,
    links: uniqueLinks,
    seasons,
  };
}
