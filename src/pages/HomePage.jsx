import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiFire, HiSparkles, HiClock, HiStar, HiFilm, HiTv, HiGlobeAlt, HiHeart } from 'react-icons/hi2';
import useStore from '../store/useStore';
import { TABS, TAB_META } from '../utils/constants';
import { filterMovies, sortMovies, shuffleArray } from '../utils/helpers';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import MovieListItem from '../components/MovieListItem';
import MovieRow from '../components/MovieRow';
import ContinueWatching from '../components/ContinueWatching';
import FilterBar from '../components/FilterBar';
import { MovieGridSkeleton, HeroBannerSkeleton, RowSkeleton } from '../components/Skeleton';

const ITEMS_PER_PAGE = 30;

export default function HomePage() {
  const {
    allMovies, isLoading, fetchAllMovies,
    currentTab, searchQuery,
    sortBy, filterGenre, filterYear, filterLanguage,
    viewMode, watchHistory
  } = useStore();

  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (allMovies.length === 0) fetchAllMovies();
  }, []);

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [currentTab, searchQuery, filterGenre, filterYear, filterLanguage, sortBy]);

  const tabId = TABS[currentTab]?.id || 'home';
  const meta = TAB_META[tabId] || TAB_META.home;

  const filteredMovies = useMemo(() => {
    const filtered = filterMovies(allMovies, tabId, searchQuery, {
      genre: filterGenre,
      year: filterYear,
      language: filterLanguage,
    });
    return sortMovies(filtered, sortBy);
  }, [allMovies, tabId, searchQuery, filterGenre, filterYear, filterLanguage, sortBy]);

  const displayMovies = filteredMovies.slice(0, displayCount);
  const hasMore = displayCount < filteredMovies.length;

  const trendingMovies = useMemo(() =>
    [...allMovies].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0)).slice(0, 20),
    [allMovies]
  );

  const newReleases = useMemo(() =>
    [...allMovies].sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0)).slice(0, 20),
    [allMovies]
  );

  const topRated = useMemo(() =>
    [...allMovies].filter(m => parseFloat(m.rating) >= 7).slice(0, 20),
    [allMovies]
  );

  const bollywood = useMemo(() =>
    allMovies.filter(m => {
      const ind = String(m.industry || '').toLowerCase();
      const lang = String(m.original_language || m.spoken_languages || '').toLowerCase();
      return ind.includes('bollywood') || lang.includes('hindi');
    }).slice(0, 20),
    [allMovies]
  );

  const hollywood = useMemo(() =>
    allMovies.filter(m => {
      const ind = String(m.industry || '').toLowerCase();
      const lang = String(m.original_language || m.spoken_languages || '').toLowerCase();
      return ind.includes('hollywood') || lang.includes('english');
    }).slice(0, 20),
    [allMovies]
  );

  const animeList = useMemo(() =>
    allMovies.filter(m => m.category?.toLowerCase().includes('anime')).slice(0, 20),
    [allMovies]
  );

  const seriesList = useMemo(() =>
    allMovies.filter(m => m.category?.toLowerCase().includes('series')).slice(0, 20),
    [allMovies]
  );

  const recommended = useMemo(() => {
    if (watchHistory.length === 0) return shuffleArray(allMovies).slice(0, 20);
    const watchedGenres = new Set();
    watchHistory.forEach(m => {
      const genre = String(m.genre || '');
      genre.split(',').forEach(g => watchedGenres.add(g.trim().toLowerCase()));
    });
    const watchedIds = new Set(watchHistory.map(m => m.movie_id));
    return allMovies
      .filter(m => !watchedIds.has(m.movie_id))
      .filter(m => {
        const genre = String(m.genre || '').toLowerCase();
        return [...watchedGenres].some(g => genre.includes(g));
      })
      .slice(0, 20);
  }, [allMovies, watchHistory]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + ITEMS_PER_PAGE);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, displayCount]);

  const isHomeTab = tabId === 'home' && !searchQuery;

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <div className="pt-[108px] pb-20 min-h-screen">
        {isLoading && allMovies.length === 0 ? (
          <div className="space-y-6 mt-2">
            <HeroBannerSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <MovieGridSkeleton count={12} />
          </div>
        ) : isHomeTab ? (
          /* ========= HOME TAB: Rich Sections ========= */
          <div className="space-y-2">
            {/* Hero Banner */}
            <div className="px-3 mb-4">
              <HeroBanner movies={trendingMovies} />
            </div>

            {/* Continue Watching */}
            <ContinueWatching />

            {/* Trending Now */}
            <MovieRow title="Trending Now" movies={trendingMovies} icon={HiFire} showRank />

            {/* New Releases */}
            <MovieRow title="New Releases" movies={newReleases} icon={HiSparkles} />

            {/* Recommended For You */}
            {recommended.length > 0 && (
              <MovieRow title="Recommended For You" movies={recommended} icon={HiHeart} />
            )}

            {/* Top Rated */}
            <MovieRow title="Top Rated" movies={topRated} icon={HiStar} />

            {/* Bollywood */}
            {bollywood.length > 0 && (
              <MovieRow title="Bollywood" movies={bollywood} icon={HiFilm} />
            )}

            {/* Hollywood */}
            {hollywood.length > 0 && (
              <MovieRow title="Hollywood" movies={hollywood} icon={HiGlobeAlt} />
            )}

            {/* Web Series */}
            {seriesList.length > 0 && (
              <MovieRow title="Web Series" movies={seriesList} icon={HiTv} />
            )}

            {/* Anime */}
            {animeList.length > 0 && (
              <MovieRow title="Anime" movies={animeList} icon={HiSparkles} />
            )}

            {/* Recently Watched */}
            {watchHistory.length > 0 && (
              <MovieRow title="Recently Watched" movies={watchHistory.slice(0, 20)} icon={HiClock} />
            )}

            {/* All Content Grid */}
            <div className="px-3 pt-4">
              <h2 className="text-base sm:text-lg font-bold text-white mb-3">Explore All</h2>
            </div>
            <FilterBar />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 px-3 mt-2">
              {displayMovies.map((movie, idx) => (
                <MovieCard key={movie.movie_id || idx} item={movie} index={idx} />
              ))}
            </div>
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          /* ========= CATEGORY TAB / SEARCH ========= */
          <div>
            <FilterBar />

            {searchQuery && (
              <div className="px-3 pt-2 pb-1">
                <p className="text-sm text-text-secondary">
                  {filteredMovies.length > 0
                    ? <><span className="text-white font-semibold">{filteredMovies.length}</span> results for "<span className="text-primary font-semibold">{searchQuery}</span>"</>
                    : <>No results found for "<span className="text-primary font-semibold">{searchQuery}</span>"</>
                  }
                </p>
              </div>
            )}

            {filteredMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
                  <HiFilm className="text-3xl text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Nothing Found</h3>
                <p className="text-sm text-text-muted max-w-xs">
                  {searchQuery
                    ? 'Try different keywords or check the spelling'
                    : 'No content available in this category yet'}
                </p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="px-2 mt-2 space-y-1">
                {displayMovies.map((movie, idx) => (
                  <MovieListItem key={movie.movie_id || idx} item={movie} index={idx} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 px-3 mt-2">
                {displayMovies.map((movie, idx) => (
                  <MovieCard key={movie.movie_id || idx} item={movie} index={idx} />
                ))}
              </div>
            )}

            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
