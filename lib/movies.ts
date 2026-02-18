import { SEARCH_FIELDS } from "@/lib/constants";

export type MflixMovie = Record<string, unknown> & {
  movie_id?: string;
  title?: string;
  poster?: string;
  year?: string | number;
  rating?: string | number;
  quality_name?: string;
  original_language?: string;
  category?: string;
  adult_content?: string | boolean;
};

export function inferContentType(item: MflixMovie): "movie" | "series" {
  const category = String(item.category || "").toLowerCase();
  if (category.includes("series") || category.includes("tv")) return "series";
  return "movie";
}

export function filterByTab(all: MflixMovie[], tabId: string): MflixMovie[] {
  if (tabId === "home") return all;
  if (tabId === "movies") return all.filter((m) => String(m.category || "").toLowerCase().includes("movie"));
  if (tabId === "tvshow") return all.filter((m) => String(m.category || "").toLowerCase().includes("series"));
  if (tabId === "anime") return all.filter((m) => String(m.category || "").toLowerCase().includes("anime"));
  if (tabId === "adult")
    return all.filter((m) => String(m.adult_content).toLowerCase() === "true" || m.adult_content === true);
  return all;
}

export function searchFilter(all: MflixMovie[], term: string): MflixMovie[] {
  const q = term.trim().toLowerCase();
  if (!q) return all;
  return all.filter((item) =>
    SEARCH_FIELDS.some((field) => {
      const value = item[field];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(q);
    })
  );
}

