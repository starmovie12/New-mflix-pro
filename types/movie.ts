export type TabId = "home" | "movies" | "tvshow" | "anime" | "adult";

export type MediaLink = {
  url: string;
  label: string;
  info?: string;
  server?: string;
};

export type Episode = {
  title: string;
  url: string;
  links: MediaLink[];
};

export type Season = {
  name: string;
  episodes: Episode[];
};

export type MovieItem = {
  id: string;
  sourceId: string;
  title: string;
  poster: string;
  rating: string;
  qualityName: string;
  year: string;
  language: string;
  category: string;
  genre: string;
  runtime: string;
  cert: string;
  description: string;
  adult: boolean;
  isSeries: boolean;
  links: MediaLink[];
  seasons: Season[];
  searchBlob: string;
  raw: Record<string, unknown>;
};
