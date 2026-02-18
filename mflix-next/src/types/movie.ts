export interface MovieItem {
  movie_id?: string;
  id?: string;
  title?: string;
  original_title?: string;
  poster?: string;
  image?: string;
  rating?: string | number;
  quality_name?: string;
  quality?: string;
  year?: string | number;
  release_year?: string;
  category?: string;
  genre?: string | string[];
  cast?: string | string[];
  director?: string;
  description?: string;
  overview?: string;
  runtime?: number;
  duration?: number;
  spoken_languages?: string | string[];
  original_language?: string;
  platform?: string;
  industry?: string;
  keywords?: string | string[];
  writer?: string | string[];
  adult_content?: string | boolean;
  download_links?: LinkObject[] | string;
  qualities?: LinkObject[];
  links?: LinkObject[];
  sources?: LinkObject[];
  url?: string;
  link?: string;
  movie_link?: string;
  video_url?: string;
  seasons?: Season[];
  season_list?: Season[];
  episodes?: Episode[];
  content_type?: string;
  type?: string;
}

export interface LinkObject {
  url?: string;
  link?: string;
  quality?: string;
  label?: string;
  size?: string;
  info?: string;
}

export interface Season {
  name?: string;
  title?: string;
  episodes?: Episode[];
  list?: Episode[];
}

export interface Episode {
  title?: string;
  name?: string;
  episode_title?: string;
  url?: string;
  link?: string;
  movie_link?: string;
  video_url?: string;
  stream?: string;
  download_links?: LinkObject[];
  qualities?: LinkObject[];
  links?: LinkObject[];
  runtime?: number;
  duration?: number;
  description?: string;
}
