import type { NormalizedMovie, NormalizedPlayerData, RawMovie } from '../types/mflix';
import { formatRuntime, formatYear, safeUpper } from './utils';

const FALLBACK_POSTER = 'https://via.placeholder.com/200x300?text=No+Image';

export function normalizeMovie(raw: RawMovie): NormalizedMovie {
  const id = String(raw.movie_id ?? raw.id ?? '').trim();
  const title = String(raw.title ?? 'Untitled').trim() || 'Untitled';
  const poster = typeof raw.poster === 'string' && raw.poster.trim().length ? raw.poster.trim() : null;
  const year = formatYear(raw.year, '—');
  const quality = String(raw.quality_name ?? 'HD').trim() || 'HD';
  const language = safeUpper(raw.original_language ?? 'Dub', 'DUB');
  const categoryText = String(raw.category ?? '').trim();

  const isSeries =
    categoryText.toLowerCase().includes('series') ||
    categoryText.toLowerCase().includes('tv') ||
    (String((raw as Record<string, unknown>).content_type ?? '').toLowerCase() === 'series');

  const isAdult =
    raw.adult_content === true ||
    String(raw.adult_content ?? '').toLowerCase() === 'true' ||
    categoryText.toLowerCase().includes('18');

  const ratingRaw = raw.rating ?? 'N/A';
  const ratingText = String(ratingRaw).trim() || 'N/A';
  const rv = Number(ratingRaw);
  const ratingValue = Number.isFinite(rv) ? rv : null;

  return {
    id,
    title,
    poster: poster ?? FALLBACK_POSTER,
    year,
    ratingText,
    ratingValue,
    quality,
    language,
    categoryText,
    isAdult,
    isSeries,
    raw
  };
}

export function normalizePlayerData(data: RawMovie): NormalizedPlayerData {
  const isSeries =
    String((data as Record<string, unknown>).content_type ?? '').toLowerCase() === 'series' ||
    String((data as Record<string, unknown>).type ?? '').toLowerCase() === 'series' ||
    Boolean((data as Record<string, unknown>).seasons);

  const title = String(data.title ?? (data as Record<string, unknown>).original_title ?? 'Untitled').trim() || 'Untitled';
  const qualityName = String(data.quality_name ?? 'HD').trim() || 'HD';
  const year = String((data as Record<string, unknown>).release_year ?? data.year ?? '2024');

  const genreRaw = (data as Record<string, unknown>).genre;
  const genre = Array.isArray(genreRaw) ? genreRaw.map(String).join(', ') : String(genreRaw ?? 'Drama');

  const runtime = formatRuntime((data as Record<string, unknown>).runtime);

  // Movie links
  const links: { url: string; label: string; info?: string }[] = [];
  if (!isSeries) {
    let rawLinks: unknown = (data as Record<string, unknown>).download_links ?? (data as Record<string, unknown>).qualities;
    if (typeof rawLinks === 'string') {
      try {
        rawLinks = JSON.parse(rawLinks);
      } catch {
        rawLinks = null;
      }
    }
    const arr = Array.isArray(rawLinks) ? rawLinks : rawLinks && typeof rawLinks === 'object' ? Object.values(rawLinks as Record<string, unknown>) : [];
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const url = String(o.url ?? o.link ?? o.movie_link ?? '').trim();
      if (!url) continue;
      const label = String(o.quality ?? o.label ?? 'HD').trim() || 'HD';
      const info = String(o.size ?? o.info ?? '').trim() || undefined;
      links.push({ url, label, info });
    }
  }

  // Seasons / episodes
  const seasonsRaw = (data as Record<string, unknown>).seasons;
  const seasons =
    Array.isArray(seasonsRaw) ? (seasonsRaw as NormalizedPlayerData['seasons']) : [];

  return {
    isSeries,
    title,
    qualityName,
    year,
    genre,
    runtime,
    cert: String((data as Record<string, unknown>).certification ?? 'UA'),
    rating: String(data.rating ?? '0.0'),
    plot: String((data as Record<string, unknown>).description ?? (data as Record<string, unknown>).overview ?? 'No synopsis available.'),
    links,
    seasons
  };
}

