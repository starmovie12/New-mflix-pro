export const FALLBACK_POSTER = 'https://via.placeholder.com/400x600/1a1a1a/666?text=No+Image';
export const FALLBACK_BACKDROP = 'https://via.placeholder.com/1280x720/1a1a1a/666?text=MFLIX';

export const TABS = [
  { id: 'home', label: 'Home', icon: 'HiHome' },
  { id: 'movies', label: 'Movies', icon: 'HiFilm' },
  { id: 'series', label: 'Series', icon: 'HiTv' },
  { id: 'anime', label: 'Anime', icon: 'HiSparkles' },
  { id: 'adult', label: '18+', icon: 'HiShieldCheck' },
];

export const GENRES = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'War', 'Western', 'Biography', 'Musical', 'Sport'
];

export const YEARS = [
  'All', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018',
  '2017', '2016', '2015', '2010-2014', '2000-2009', 'Before 2000'
];

export const LANGUAGES = [
  'All', 'Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada',
  'Bengali', 'Marathi', 'Punjabi', 'Korean', 'Japanese', 'Spanish', 'French'
];

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'rating_high', label: 'Rating: High to Low' },
  { value: 'rating_low', label: 'Rating: Low to High' },
  { value: 'name_az', label: 'Name: A-Z' },
  { value: 'name_za', label: 'Name: Z-A' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
];

export const TAB_META = {
  home: {
    title: 'MFLIX - Watch Free HD Movies, Series & Anime Online',
    description: 'Stream the latest HD Movies, Web Series, and Anime for free on MFLIX.'
  },
  movies: {
    title: 'MFLIX - Browse Bollywood & Hollywood Movies Online',
    description: 'Watch the best Bollywood, Hollywood & Regional movies in HD quality on MFLIX.'
  },
  series: {
    title: 'MFLIX - Watch Popular Web Series Online Free',
    description: 'Stream trending web series from Netflix, Prime, Hotstar and more on MFLIX.'
  },
  anime: {
    title: 'MFLIX - Watch Anime Online English Sub/Dub',
    description: 'Watch the latest anime in English sub and dub on MFLIX.'
  },
  adult: {
    title: 'MFLIX - 18+ Content',
    description: 'Adult content section. Viewer discretion advised.'
  },
};
