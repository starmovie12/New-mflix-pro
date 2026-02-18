import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiAdjustmentsHorizontal, HiXMark, HiArrowsUpDown, HiSquares2X2, HiListBullet } from 'react-icons/hi2';
import useStore from '../store/useStore';
import { GENRES, YEARS, LANGUAGES, SORT_OPTIONS } from '../utils/constants';

const FilterBar = memo(function FilterBar() {
  const {
    sortBy, setSortBy,
    filterGenre, setFilterGenre,
    filterYear, setFilterYear,
    filterLanguage, setFilterLanguage,
    viewMode, setViewMode
  } = useStore();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const hasActiveFilters = filterGenre !== 'all' || filterYear !== 'all' || filterLanguage !== 'all' || sortBy !== 'latest';

  const resetFilters = () => {
    setFilterGenre('all');
    setFilterYear('all');
    setFilterLanguage('all');
    setSortBy('latest');
  };

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex-shrink-0 ${
            hasActiveFilters
              ? 'bg-primary/20 border-primary/50 text-primary'
              : 'bg-bg-elevated border-border text-text-secondary hover:text-white'
          }`}
        >
          <HiAdjustmentsHorizontal className="text-sm" />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </button>

        {/* Quick Genre Pills */}
        {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi'].map(genre => (
          <button
            key={genre}
            onClick={() => setFilterGenre(filterGenre === genre ? 'all' : genre)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterGenre === genre
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-bg-elevated border-border text-text-secondary hover:text-white hover:border-border-light'
            }`}
          >
            {genre}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-white'
            }`}
          >
            <HiSquares2X2 className="text-lg" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-white'
            }`}
          >
            <HiListBullet className="text-lg" />
          </button>
        </div>
      </div>

      {/* Full Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Sort */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1.5 block">Sort By</label>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        sortBy === opt.value
                          ? 'bg-primary text-white'
                          : 'bg-bg-elevated text-text-secondary hover:text-white border border-border'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1.5 block">Genre</label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => setFilterGenre(g === 'All' ? 'all' : g)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        (g === 'All' && filterGenre === 'all') || filterGenre === g
                          ? 'bg-primary text-white'
                          : 'bg-bg-elevated text-text-secondary hover:text-white border border-border'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1.5 block">Year</label>
                <div className="flex flex-wrap gap-1.5">
                  {YEARS.map(y => (
                    <button
                      key={y}
                      onClick={() => setFilterYear(y === 'All' ? 'all' : y)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        (y === 'All' && filterYear === 'all') || filterYear === y
                          ? 'bg-primary text-white'
                          : 'bg-bg-elevated text-text-secondary hover:text-white border border-border'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1.5 block">Language</label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map(l => (
                    <button
                      key={l}
                      onClick={() => setFilterLanguage(l === 'All' ? 'all' : l)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        (l === 'All' && filterLanguage === 'all') || filterLanguage === l
                          ? 'bg-primary text-white'
                          : 'bg-bg-elevated text-text-secondary hover:text-white border border-border'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-primary font-semibold"
                >
                  <HiXMark className="text-sm" /> Reset All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default FilterBar;
