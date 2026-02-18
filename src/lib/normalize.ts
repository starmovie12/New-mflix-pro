import { asNumber, toArray, toLower, formatDuration, parseYear, FALLBACK_POSTER, SEARCH_FIELDS, normalizeCategory } from "./utils";
import type { MovieItem, LinkObject, Season, NormalizedPlayerData } from "./types";

const TODAY_YEAR = new Date().getFullYear();

export function normalizeItem(raw: Record<string, unknown>, key: string): MovieItem {
  const databaseKey = String(key || raw.movie_id || raw.id || `mflix-${Date.now()}`);
  const title = String(raw.title || raw.original_title || "Untitled");
  const poster = String(raw.poster || raw.image || FALLBACK_POSTER);
  const rating = asNumber(raw.rating, 0);
  const year = parseYear(raw.year || raw.release_year || raw.released || TODAY_YEAR);
  const quality = String(raw.quality_name || raw.quality || "HD");
  const tabCategory = normalizeCategory(raw);
  const adult = raw.adult_content === true || raw.adult_content === "true";
  const languageList = toArray(raw.spoken_languages || raw.original_language || raw.language || "Dub")
    .map((l) => l.trim())
    .filter(Boolean);
  const genreList = toArray(raw.genre || raw.genres || raw.tags || "Drama")
    .map((g) => g.trim())
    .filter(Boolean);
  const castList = toArray(raw.cast).map((m) => m.trim()).filter(Boolean);
  const director = String(raw.director || "Unknown");
  const runtimeMinutes = asNumber(raw.runtime || raw.duration || raw.movie_runtime, 0);
  const description = String(raw.description || raw.overview || "No synopsis available.");
  const platform = String(raw.platform || raw.stream_platform || "MFLIX");

  const searchBlob = SEARCH_FIELDS.map((field) => String(raw[field] ?? ""))
    .concat([title, ...genreList, ...castList, ...languageList, director, platform])
    .join(" ")
    .toLowerCase();

  return {
    id: databaseKey,
    movieId: databaseKey,
    title,
    poster,
    rating,
    year,
    quality,
    tabCategory,
    adult,
    languageList,
    genreList,
    description,
    runtimeMinutes,
    director,
    castList,
    platform,
    searchBlob,
    raw,
  };
}

export function parseLinkObjects(input: unknown): LinkObject[] {
  if (!input) return [];
  let data: unknown = input;
  if (typeof data === "string") {
    const str = data;
    try {
      data = JSON.parse(str);
    } catch {
      data = /^https?:\/\//i.test(str.trim()) ? [str.trim()] : [];
    }
  }

  const entries = Array.isArray(data) ? data : Object.values((data as Record<string, unknown>) || {});
  const output: LinkObject[] = [];
  entries.forEach((entry) => {
    if (!entry) return;
    if (typeof entry === "string") {
      output.push({ url: entry, label: "HD", info: "" });
      return;
    }
    const e = entry as Record<string, unknown>;
    const url = String(e.url || e.link || e.movie_link || e.file || e.video_url || "");
    if (!url) return;
    output.push({
      url,
      label: String(e.quality || e.label || "HD"),
      info: String(e.size || e.info || ""),
    });
  });
  return output;
}

export function normalizeSeasons(raw: Record<string, unknown>): Season[] {
  let seasonSource = (raw.seasons || raw.season_list || []) as unknown[];
  if (
    (!seasonSource || (Array.isArray(seasonSource) && seasonSource.length === 0)) &&
    raw.episodes
  ) {
    seasonSource = [{ name: "Season 1", episodes: raw.episodes }];
  }
  if (!Array.isArray(seasonSource)) seasonSource = Object.values(seasonSource || {});

  return seasonSource
    .map((season, sIndex) => {
      const s = season as Record<string, unknown>;
      const episodeSource = (s?.episodes || s?.list || []) as unknown[];
      const episodesArray = Array.isArray(episodeSource) ? episodeSource : Object.values(episodeSource || {});
      const episodes = episodesArray
        .map((ep, eIndex) => {
          if (!ep) return null;
          const e = ep as Record<string, unknown>;
          const qualityLinks = parseLinkObjects(e.download_links || e.qualities || e.links);
          const fallbackUrl = String(
            e.url || e.link || e.movie_link || e.video_url || e.stream || qualityLinks[0]?.url || ""
          );
          if (!fallbackUrl) return null;
          return {
            title: String(e.title || e.name || e.episode_title || `Episode ${eIndex + 1}`),
            url: fallbackUrl,
            qualityLinks,
            runtimeMinutes: asNumber(e.runtime || e.duration, 0),
            description: String(e.description || ""),
          };
        })
        .filter(Boolean) as Season["episodes"];

      if (episodes.length === 0) return null;
      return {
        name: String(s?.name || s?.title || `Season ${sIndex + 1}`),
        episodes,
      };
    })
    .filter(Boolean) as Season[];
}

export function normalizePlayerData(raw: Record<string, unknown>, keyId: string): NormalizedPlayerData {
  const seasons = normalizeSeasons(raw);
  const typeHint = toLower(raw.content_type || raw.type || raw.category || "");
  const isSeries = seasons.length > 0 || typeHint.includes("series") || typeHint.includes("tv");

  const links = parseLinkObjects(raw.download_links || raw.qualities || raw.links || raw.sources);
  const directUrl = raw.url || raw.link || raw.movie_link || raw.video_url;
  if (directUrl) {
    links.unshift({
      url: String(directUrl),
      label: String(raw.quality_name || "HD"),
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
    title: String(raw.title || raw.original_title || "Untitled"),
    qualityName: String(raw.quality_name || "HD"),
    year: parseYear(raw.year || raw.release_year || "2024"),
    genre: toArray(raw.genre || "Drama").join(", "),
    runtime: formatDuration(asNumber(raw.runtime || raw.duration, 0)),
    cert: String(raw.certification || "UA"),
    rating: String(raw.rating || "0.0"),
    plot: String(raw.description || raw.overview || "No synopsis available."),
    language: toArray(raw.spoken_languages || raw.original_language || "Dub").join(", "),
    director: String(raw.director || "Unknown"),
    cast: toArray(raw.cast || "N/A").join(", "),
    platform: String(raw.platform || "MFLIX"),
    poster: String(raw.poster || FALLBACK_POSTER),
    isSeries,
    links: uniqueLinks,
    seasons,
  };
}
