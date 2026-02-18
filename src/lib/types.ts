export interface MovieItem {
  id: string;
  movieId: string;
  title: string;
  poster: string;
  rating: number;
  year: string;
  quality: string;
  tabCategory: string;
  adult: boolean;
  languageList: string[];
  genreList: string[];
  description: string;
  runtimeMinutes: number;
  director: string;
  castList: string[];
  platform: string;
  searchBlob: string;
  raw: Record<string, unknown>;
}

export interface LinkObject {
  url: string;
  label: string;
  info: string;
}

export interface Episode {
  title: string;
  url: string;
  qualityLinks: LinkObject[];
  runtimeMinutes: number;
  description: string;
}

export interface Season {
  name: string;
  episodes: Episode[];
}

export interface NormalizedPlayerData {
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
  links: LinkObject[];
  seasons: Season[];
}
