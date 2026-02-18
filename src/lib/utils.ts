export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait = 250) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(min, num));
}

export function asNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function toLower(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

export function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/[|,]/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [String(value)];
}

export function formatDuration(minutesValue: number): string {
  const minutes = asNumber(minutesValue, 0);
  if (!minutes) return "N/A";
  const hr = Math.floor(minutes / 60);
  const min = Math.round(minutes % 60);
  if (!hr) return `${min}m`;
  return `${hr}h ${min}m`;
}

export function parseYear(value: unknown): string {
  const raw = String(value ?? "").match(/\d{4}/);
  return raw ? raw[0] : "2024";
}

export function normalizeCategory(item: Record<string, unknown>): string {
  const category = toLower(item.category || item.content_type || item.type);
  if (category.includes("anime")) return "anime";
  if (category.includes("series") || category.includes("tv")) return "tvshow";
  if (item.adult_content === "true" || item.adult_content === true) return "adult";
  return "movies";
}

export const FALLBACK_POSTER = "https://via.placeholder.com/400x600?text=MFLIX";

export const SEARCH_FIELDS = [
  "title", "cast", "director", "genre", "industry", "keywords",
  "platform", "quality_name", "spoken_languages", "writer",
  "year", "category", "description", "overview",
];

export const TAB_CONFIG = [
  { id: "home", label: "Home" },
  { id: "movies", label: "Movies" },
  { id: "tvshow", label: "Series" },
  { id: "anime", label: "Anime" },
  { id: "adult", label: "18+" },
];
