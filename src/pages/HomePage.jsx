import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Header from '../components/Header';
import MovieGrid from '../components/MovieGrid';
import ContinueWatching from '../components/ContinueWatching';
import FavoritesSection from '../components/FavoritesSection';
import AdvancedSearch from '../components/AdvancedSearch';
import BackToTop from '../components/BackToTop';
import { useMovies } from '../context/MovieContext';

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'movies', label: 'Movies' },
  { id: 'series', label: 'Series' },
  { id: 'anime', label: 'Anime' },
  { id: 'adult', label: '18+' },
];

const TAB_IDS = ['home', 'movies', 'tvshow', 'anime', 'adult'];

const PAGE_TITLES = {
  'Home': 'MFLIX - Watch Free HD Movies, Series & Anime Online',
  'Movies': 'MFLIX - Browse New Bollywood & Hollywood Movies',
  'Series': 'MFLIX - Watch Popular Web Series Online Free',
  'Anime': 'MFLIX - Watch Anime Online English Sub/Dub',
  '18+': 'MFLIX - 18+ Content Warning',
};

function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const scrollRef = useRef(null);
  const { allMovies, loading } = useMovies();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowAdvancedSearch(true);
      }
      if (e.key === 'Escape') setShowAdvancedSearch(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useDocumentTitle(PAGE_TITLES[TABS[activeTab].label] || 'MFLIX');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleScroll = useCallback((e) => {
    setIsScrolled(e.target.scrollTop > 50);
  }, []);

  return (
    <div className="min-h-screen bg-mflix-darker">
      <Header
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isScrolled={isScrolled}
        onSearchFocus={() => setShowAdvancedSearch(true)}
      />
      <main
        ref={scrollRef}
        className="pt-24 sm:pt-28 pb-20 overflow-y-auto h-screen"
        onScroll={handleScroll}
      >
        {activeTab === 0 && !debouncedSearch && (
          <>
            <ContinueWatching />
            <FavoritesSection />
          </>
        )}
        <MovieGrid
          movies={allMovies}
          tabId={TAB_IDS[activeTab]}
          searchTerm={debouncedSearch}
          loading={loading}
        />
      </main>
      <BackToTop scrollRef={scrollRef} />
      <AnimatePresence>
        {showAdvancedSearch && (
          <AdvancedSearch
            key="advanced-search"
            movies={allMovies}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onClose={() => { setShowAdvancedSearch(false); setSearchTerm(''); }}
            isOpen={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;
