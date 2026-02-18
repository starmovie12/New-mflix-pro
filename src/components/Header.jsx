import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiX, HiMicrophone, HiClock, HiArrowLeft, HiBell, HiUser, HiCog } from 'react-icons/hi';
import { HiFilm, HiTv, HiSparkles, HiShieldCheck, HiHome } from 'react-icons/hi2';
import useStore from '../store/useStore';
import { TABS } from '../utils/constants';
import { debounce } from '../utils/helpers';

const tabIcons = { HiHome, HiFilm, HiTv, HiSparkles, HiShieldCheck };

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentTab, setCurrentTab, searchQuery, setSearchQuery,
    searchHistory, addToSearchHistory, clearSearchHistory,
    hasNewContent, markNotificationsRead
  } = useStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isVisible, setIsVisible] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const inputRef = useRef(null);
  const lastScrollY = useRef(0);

  const isPlayerPage = location.pathname.startsWith('/watch');

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      if (value.trim()) addToSearchHistory(value.trim());
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    debouncedSearch(value);
  };

  const handleSearchClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      addToSearchHistory(localQuery.trim());
      setSearchQuery(localQuery.trim());
    }
    inputRef.current?.blur();
    setIsSearchFocused(false);
  };

  const handleHistoryClick = (term) => {
    setLocalQuery(term);
    setSearchQuery(term);
    setIsSearchFocused(false);
  };

  const handleTabClick = (index) => {
    setCurrentTab(index);
    setSearchQuery('');
    setLocalQuery('');
    if (location.pathname !== '/') navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100 && scrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isPlayerPage) return null;

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        animate={{ y: isVisible ? 0 : -140 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="glass border-b border-border">
          <div className="px-3 py-2.5">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <div
                className="flex-shrink-0 font-black text-xl tracking-tighter cursor-pointer select-none"
                onClick={() => { handleTabClick(0); }}
              >
                <span className="text-white">M</span>
                <span className="text-primary">FLIX</span>
              </div>

              <div className="relative flex-1 flex items-center bg-bg-elevated rounded-xl px-3 py-2 border border-border focus-within:border-primary/50 transition-colors">
                <HiSearch className="text-text-muted text-lg flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={localQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search movies, actors, genres..."
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm ml-2 placeholder:text-text-muted"
                  autoComplete="off"
                  aria-label="Search movies"
                />
                <AnimatePresence>
                  {localQuery && (
                    <motion.button
                      type="button"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      onClick={handleSearchClear}
                      className="text-text-secondary hover:text-white ml-1"
                    >
                      <HiX className="text-lg" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative w-9 h-9 flex items-center justify-center rounded-full bg-bg-elevated text-text-secondary hover:text-white transition-colors"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (hasNewContent) markNotificationsRead();
                  }}
                >
                  <HiBell className="text-lg" />
                  {hasNewContent && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchHistory.length > 0 && !localQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-3 right-3 top-full mt-1 bg-bg-elevated rounded-xl border border-border shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Recent Searches</span>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-primary font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                {searchHistory.slice(0, 8).map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleHistoryClick(term)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-bg-hover transition-colors text-left"
                  >
                    <HiClock className="text-text-muted text-sm flex-shrink-0" />
                    <span className="text-sm text-text-primary truncate">{term}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Bar */}
          <nav className="border-t border-border/50">
            <div className="flex overflow-x-auto hide-scrollbar">
              {TABS.map((tab, index) => {
                const Icon = tabIcons[tab.icon];
                const isActive = currentTab === index;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(index)}
                    className={`relative flex-shrink-0 flex items-center gap-1.5 px-5 h-11 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {Icon && <Icon className="text-base" />}
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 right-3 z-50 w-80 max-h-96 bg-bg-elevated rounded-xl border border-border shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-bold">Notifications</h3>
              </div>
              <div className="p-4 text-center text-text-muted text-sm">
                <HiBell className="text-3xl mx-auto mb-2 opacity-30" />
                <p>No new notifications</p>
                <p className="text-xs mt-1">Check back later for updates!</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
