import { useMemo } from 'react';
import MovieCard from './MovieCard';

const SEARCH_FIELDS = ['title', 'cast', 'director', 'genre', 'industry', 'keywords', 'platform', 'quality_name', 'spoken_languages', 'writer', 'year', 'category'];

function filterMovies(movies, tabId, searchTerm) {
  let filtered = movies;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = movies.filter(item =>
      SEARCH_FIELDS.some(field =>
        item[field] && String(item[field]).toLowerCase().includes(term)
      )
    );
  } else {
    if (tabId === 'home') filtered = movies;
    else if (tabId === 'movies') filtered = movies.filter(m => m.category?.toLowerCase().includes('movie'));
    else if (tabId === 'tvshow') filtered = movies.filter(m => m.category?.toLowerCase().includes('series'));
    else if (tabId === 'anime') filtered = movies.filter(m => m.category?.toLowerCase().includes('anime'));
    else if (tabId === 'adult') filtered = movies.filter(m => m.adult_content === 'true');
  }
  return filtered;
}

function MovieGrid({ movies, tabId, searchTerm, loading }) {
  const filtered = useMemo(() => filterMovies(movies, tabId, searchTerm), [movies, tabId, searchTerm]);
  const displayItems = filtered.slice(0, 100);

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-lg bg-mflix-card" />
            <div className="mt-2 h-3 bg-mflix-card rounded w-3/4" />
            <div className="mt-1 h-2 bg-mflix-card rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-gray-500 text-lg">
          {searchTerm ? `No results for "${searchTerm}"` : 'Nothing here yet'}
        </p>
        <p className="text-gray-600 text-sm mt-2">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-4">
      {displayItems.map((item, i) => (
        <MovieCard key={item.movie_id} item={item} index={i} />
      ))}
    </div>
  );
}

export default MovieGrid;
