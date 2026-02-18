import { get, limitToLast, query, ref } from "firebase/database";

import { database } from "@/lib/firebase";
import type { Episode, MediaLink, MovieItem, Season } from "@/types/movie";

const FALLBACK_POSTER = "https://via.placeholder.com/200x300?text=No+Image";

const SEARCH_FIELDS = [
  "title",
  "cast",
  "director",
  "genre",
  "industry",
  "keywords",
  "platform",
  "quality_name",
  "spoken_languages",
  "writer",
  "year",
  "category"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toArray(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof input === "string") {
    if (input.includes(",")) {
      return input
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [input.trim()].filter(Boolean);
  }

  if (isRecord(input)) {
    return Object.values(input)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return [];
}

function entryArray(
  value: unknown
): Array<[string, Record<string, unknown>]> {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item, index) => [String(index), item] as const)
      .filter(([, item]) => isRecord(item)) as Array<
      [string, Record<string, unknown>]
    >;
  }
  if (isRecord(value)) {
    return Object.entries(value).filter(([, item]) =>
      isRecord(item)
    ) as Array<[string, Record<string, unknown>]>;
  }
  return [];
}

function parseLinks(input: unknown): MediaLink[] {
  if (!input) return [];
  let source: unknown = input;

  if (typeof source === "string") {
    const rawSource = source;
    try {
      source = JSON.parse(rawSource);
    } catch {
      const fallbackUrl = rawSource.trim();
      if (/^https?:\/\//i.test(fallbackUrl)) {
        return [
          {
            url: fallbackUrl,
            label: "HD",
            server: "Server 1"
          }
        ];
      }
      return [];
    }
  }

  const items = Array.isArray(source)
    ? source
    : isRecord(source)
      ? Object.values(source)
      : [];
  const links: MediaLink[] = [];
  const seen = new Set<string>();

  items.forEach((raw, index) => {
    if (!raw) return;

    if (typeof raw === "string") {
      if (!raw.trim() || seen.has(raw)) return;
      seen.add(raw);
      links.push({
        url: raw.trim(),
        label: "HD",
        server: `Server ${index + 1}`
      });
      return;
    }

    if (!isRecord(raw)) return;

    const url = [
      raw.url,
      raw.link,
      raw.movie_link,
      raw.file,
      raw.video_url,
      raw.stream
    ]
      .map((value) => (value ? String(value).trim() : ""))
      .find((value) => value && /^https?:\/\//i.test(value));

    if (!url || seen.has(url)) return;

    seen.add(url);
    links.push({
      url,
      label: String(raw.quality || raw.label || raw.resolution || "HD"),
      info: String(raw.size || raw.info || ""),
      server: String(raw.server || `Server ${links.length + 1}`)
    });
  });

  return links;
}

function normalizeSeasons(raw: Record<string, unknown>): Season[] {
  let seasonSource = raw.seasons;

  if (!seasonSource && raw.episodes) {
    seasonSource = [
      {
        name: "Season 1",
        episodes: raw.episodes
      }
    ];
  }

  const seasonEntries = Array.isArray(seasonSource)
    ? seasonSource
    : isRecord(seasonSource)
      ? Object.values(seasonSource)
      : [];

  return seasonEntries
    .map((season, seasonIndex) => {
      if (!isRecord(season)) return null;
      const episodeSource = season.episodes || season.list || [];
      const episodeEntries = Array.isArray(episodeSource)
        ? episodeSource
        : isRecord(episodeSource)
          ? Object.values(episodeSource)
          : [];

      const episodes: Episode[] = episodeEntries
        .map((episode, episodeIndex) => {
          if (!isRecord(episode)) return null;
          const links = parseLinks(
            episode.download_links || episode.qualities || episode.links
          );
          const fallbackUrl = [
            episode.url,
            episode.link,
            episode.movie_link,
            episode.video_url
          ]
            .map((value) => (value ? String(value).trim() : ""))
            .find(Boolean);
          const finalUrl = links[0]?.url || fallbackUrl;
          if (!finalUrl) return null;

          return {
            title: String(
              episode.title ||
                episode.name ||
                episode.episode_title ||
                `Episode ${episodeIndex + 1}`
            ),
            url: finalUrl,
            links: links.length
              ? links
              : [
                  {
                    url: finalUrl,
                    label: "HD",
                    server: "Server 1"
                  }
                ]
          };
        })
        .filter((episode): episode is Episode => Boolean(episode));

      if (!episodes.length) return null;

      return {
        name: String(season.name || season.title || `Season ${seasonIndex + 1}`),
        episodes
      };
    })
    .filter((season): season is Season => Boolean(season));
}

function detectSeries(raw: Record<string, unknown>, seasons: Season[]): boolean {
  const typeHint = String(raw.content_type || raw.type || raw.category || "")
    .toLowerCase()
    .trim();
  return (
    seasons.length > 0 ||
    typeHint.includes("series") ||
    typeHint.includes("tvshow") ||
    typeHint.includes("tv")
  );
}

function normalizeRuntime(raw: Record<string, unknown>): string {
  const runtime = raw.runtime || raw.duration || raw.movie_runtime;
  if (!runtime) return "N/A";
  const asNumber = Number(runtime);
  return Number.isFinite(asNumber) ? `${asNumber}m` : String(runtime);
}

export function normalizeMovie(
  raw: Record<string, unknown>,
  id: string
): MovieItem {
  const seasons = normalizeSeasons(raw);
  const linkCandidates = parseLinks(
    raw.download_links || raw.qualities || raw.links || raw.sources
  );
  const directLink = [raw.url, raw.link, raw.movie_link, raw.video_url]
    .map((value) => (value ? String(value).trim() : ""))
    .find(Boolean);

  const links = [...linkCandidates];
  if (directLink && !links.some((item) => item.url === directLink)) {
    links.unshift({
      url: directLink,
      label: String(raw.quality_name || raw.quality || "HD"),
      server: "Server 1"
    });
  }

  const title = String(raw.title || raw.original_title || "Untitled");
  const year = String(raw.year || raw.release_year || "2024");
  const genre = toArray(raw.genre || raw.genres || "Drama").join(", ") || "Drama";
  const language =
    toArray(raw.original_language || raw.spoken_languages || "Dub")[0] || "Dub";
  const category = String(raw.category || "").toLowerCase();

  const searchBlob = SEARCH_FIELDS.map((field) => String(raw[field] || ""))
    .concat([title, year, genre, language, category])
    .join(" ")
    .toLowerCase();

  return {
    id,
    sourceId: String(raw.movie_id || raw.id || id),
    title,
    poster: String(raw.poster || FALLBACK_POSTER),
    rating: String(raw.rating || "N/A"),
    qualityName: String(raw.quality_name || raw.quality || "HD"),
    year,
    language,
    category,
    genre,
    runtime: normalizeRuntime(raw),
    cert: String(raw.certification || "UA"),
    description: String(raw.description || raw.overview || "No synopsis available."),
    adult: raw.adult_content === true || raw.adult_content === "true",
    isSeries: detectSeries(raw, seasons),
    links,
    seasons,
    searchBlob,
    raw
  };
}

export async function fetchMovies(): Promise<MovieItem[]> {
  const snapshot = await get(ref(database, "movies_by_id"));
  if (!snapshot.exists()) return [];

  const records = entryArray(snapshot.val());
  return records.map(([id, raw]) => normalizeMovie(raw, id));
}

export async function fetchMovieById(id: string): Promise<MovieItem | null> {
  if (!id) return null;

  const directSnapshot = await get(ref(database, `movies_by_id/${id}`));
  if (directSnapshot.exists()) {
    const value = directSnapshot.val();
    if (isRecord(value)) return normalizeMovie(value, id);
  }

  const list = await fetchMovies();
  const found = list.find(
    (item) => item.id === id || item.sourceId === id || String(item.raw.movie_id) === id
  );
  return found || null;
}

export async function fetchRelatedMovies(
  excludeId: string,
  genreHint: string
): Promise<MovieItem[]> {
  const snapshot = await get(query(ref(database, "movies_by_id"), limitToLast(80)));
  if (!snapshot.exists()) return [];

  const records = entryArray(snapshot.val());
  const normalized = records.map(([id, raw]) => normalizeMovie(raw, id));
  const lowerGenre = genreHint.toLowerCase();

  return normalized
    .filter((item) => item.id !== excludeId)
    .sort((a, b) => {
      const aScore = lowerGenre && a.genre.toLowerCase().includes(lowerGenre) ? 1 : 0;
      const bScore = lowerGenre && b.genre.toLowerCase().includes(lowerGenre) ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 12);
}

export const TABS: Array<{ id: TabId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "movies", label: "Movies" },
  { id: "tvshow", label: "Series" },
  { id: "anime", label: "Anime" },
  { id: "adult", label: "18+" }
];

export type TabId = "home" | "movies" | "tvshow" | "anime" | "adult";
