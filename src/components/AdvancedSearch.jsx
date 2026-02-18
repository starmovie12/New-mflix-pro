import { useState, useMemo } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from './MovieCard';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'year', label: 'Year (Newest)' },
  { id: 'title', label: 'Title A-Z' },
];

function AdvancedSearch({ movies, searchTerm, onSearch, onClose, isOpen }) {
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const genres = useMemo(() => {
    const set = new Set();
    movies.forEach(m => {
      const g = m.genre;
      if (g) (Array.isArray(g) ? g : [g]).forEach(x => set.add(String(x).trim()));
    });
    return [...set].filter(Boolean).sort();
  }, [movies]);

  const years = useMemo(() => {
    const set = new Set();
    movies.forEach(m => {
      const y = m.year || m.release_year;
      if (y) set.add(String(y));
    });
    return [...set].sort((a, b) => Number(b) - Number(a));
  }, [movies]);

  const qualities = useMemo(() => {
    const set = new Set();
    movies.forEach(m => {
      const q = m.quality_name;
      if (q) set.add(q);
    });
    return [...set].sort();
  }, [movies]);

  const filteredAndSorted = useMemo(() => {
    let result = movies;
    const term = searchTerm.toLowerCase();
    if (term) {
      const fields = ['title', 'cast', 'director', 'genre', 'keywords'];
      result = result.filter(m =>
        fields.some(f => m[f] && String(m[f]).toLowerCase().includes(term))
      );
    }
    if (genreFilter) {
      result = result.filter(m => {
        const g = m.genre;
        return g && (Array.isArray(g) ? g : [g]).some(x => String(x).toLowerCase().includes(genreFilter.toLowerCase()));
      });
    }
    if (yearFilter) result = result.filter(m => String(m.year || m.release_year) === yearFilter);
    if (qualityFilter) result = result.filter(m => m.quality_name === qualityFilter);

    if (sortBy === 'newest') result = [...result].sort((a, b) => (b.year || 0) - (a.year || 0));
    else if (sortBy === 'rating') result = [...result].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    else if (sortBy === 'year') result = [...result].sort((a, b) => (b.year || 0) - (a.year || 0));
    else if (sortBy === 'title') result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    return result.slice(0, 100);
  }, [movies, searchTerm, genreFilter, yearFilter, qualityFilter, sortBy]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/98 overflow-y-auto"
    >
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Search movies, actors, genres..."
            value={searchTerm}
            onChange={(e) => onSearch?.(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-mflix-red"
            autoFocus
          />
          <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-lg ${showFilters ? 'bg-mflix-red' : 'bg-white/10'}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-3 rounded-lg bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 overflow-hidden">
              <div className="flex flex-wrap gap-2">
                <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className="bg-white/10 rounded px-3 py-2 text-sm">
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-white/10 rounded px-3 py-2 text-sm">
                  <option value="">All Years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)} className="bg-white/10 rounded px-3 py-2 text-sm">
                  <option value="">All Quality</option>
                  {qualities.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white/10 rounded px-3 py-2 text-sm">
                  {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <button onClick={() => { setGenreFilter(''); setYearFilter(''); setQualityFilter(''); }} className="px-3 py-2 text-sm text-gray-400 hover:text-white">
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-gray-400 mb-4">{filteredAndSorted.length} results</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {filteredAndSorted.map((item, i) => (
            <MovieCard key={item.movie_id} item={item} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default AdvancedSearch;
