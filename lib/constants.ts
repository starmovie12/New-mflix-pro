export const FALLBACK_POSTER = "https://via.placeholder.com/400x600?text=MFLIX";

export const TAB_CONFIG = [
  { id: "home", label: "Home" },
  { id: "movies", label: "Movies" },
  { id: "tvshow", label: "Series" },
  { id: "anime", label: "Anime" },
  { id: "adult", label: "18+" }
] as const;

export const SEARCH_FIELDS = [
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
  "category",
  "description",
  "overview"
] as const;

