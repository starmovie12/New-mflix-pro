export interface MovieItem {
  movie_id?: string;
  id?: string;
  title?: string;
  original_title?: string;
  poster?: string;
  rating?: string;
  quality_name?: string;
  year?: string;
  release_year?: string;
  original_language?: string;
  category?: string;
  content_type?: string;
  type?: string;
  genre?: string | string[];
  cast?: string | string[];
  director?: string;
  writer?: string;
  industry?: string;
  keywords?: string;
  platform?: string;
  spoken_languages?: string | string[];
  description?: string;
  overview?: string;
  runtime?: number | string;
  duration?: number | string;
  certification?: string;
  adult_content?: string | boolean;
  url?: string;
  link?: string;
  movie_link?: string;
  video_url?: string;
  download_links?: LinkInput;
  qualities?: LinkInput;
  links?: LinkInput;
  sources?: LinkInput;
  seasons?: SeasonInput[];
  season_list?: SeasonInput[];
  episodes?: EpisodeInput[];
  [key: string]: unknown;
}

export interface LinkObject {
  url: string;
  label: string;
  info: string;
}

export type LinkInput =
  | string
  | LinkEntryInput[]
  | Record<string, LinkEntryInput>;

export interface LinkEntryInput {
  url?: string;
  link?: string;
  movie_link?: string;
  file?: string;
  video_url?: string;
  quality?: string;
  label?: string;
  size?: string;
  info?: string;
}

export interface SeasonInput {
  name?: string;
  title?: string;
  episodes?: EpisodeInput[] | Record<string, EpisodeInput>;
  list?: EpisodeInput[] | Record<string, EpisodeInput>;
}

export interface EpisodeInput {
  title?: string;
  name?: string;
  episode_title?: string;
  url?: string;
  link?: string;
  movie_link?: string;
  video_url?: string;
  stream?: string;
  download_links?: LinkInput;
  qualities?: LinkInput;
  links?: LinkInput;
  runtime?: number | string;
  duration?: number | string;
  description?: string;
}

export interface NormalizedEpisode {
  title: string;
  url: string;
  qualityLinks: LinkObject[];
  runtimeMinutes: number;
  description: string;
}

export interface NormalizedSeason {
  name: string;
  episodes: NormalizedEpisode[];
}

export interface NormalizedData {
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
  seasons: NormalizedSeason[];
}
