export type MflixCategory = 'home' | 'movies' | 'tvshow' | 'anime' | 'adult';

export type RawMovie = Record<string, unknown> & {
  movie_id?: string;
  id?: string;
  title?: string;
  poster?: string;
  year?: string | number;
  rating?: string | number;
  quality_name?: string;
  original_language?: string;
  category?: string;
  adult_content?: string | boolean;
};

export type NormalizedMovie = {
  id: string;
  title: string;
  poster: string | null;
  year: string;
  ratingText: string;
  ratingValue: number | null;
  quality: string;
  language: string;
  categoryText: string;
  isAdult: boolean;
  isSeries: boolean;
  raw: RawMovie;
};

export type NormalizedPlayerData = {
  isSeries: boolean;
  title: string;
  qualityName: string;
  year: string;
  genre: string;
  runtime: string;
  cert: string;
  rating: string;
  plot: string;
  links: { url: string; label: string; info?: string }[];
  seasons: { name?: string; episodes?: { title?: string; url?: string; link?: string }[] }[];
};

