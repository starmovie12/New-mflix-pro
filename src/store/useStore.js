import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { database, ref, get } from '../firebase';

const useStore = create(
  persist(
    (set, getState) => ({
      allMovies: [],
      isLoading: false,
      error: null,
      currentTab: 0,
      searchQuery: '',
      searchHistory: [],
      watchlist: [],
      watchHistory: [],
      continueWatching: [],
      likedMovies: [],
      userPreferences: {
        defaultQuality: 'HD',
        autoplay: true,
        language: 'all',
      },
      viewMode: 'grid',
      sortBy: 'latest',
      filterGenre: 'all',
      filterYear: 'all',
      filterLanguage: 'all',
      notifications: [],
      hasNewContent: false,

      fetchAllMovies: async () => {
        set({ isLoading: true, error: null });
        try {
          const snapshot = await get(ref(database, 'movies_by_id'));
          if (snapshot.exists()) {
            const data = Object.values(snapshot.val());
            set({ allMovies: data, isLoading: false });
          } else {
            set({ allMovies: [], isLoading: false });
          }
        } catch (error) {
          console.error('Firebase fetch error:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchMovieById: async (id) => {
        try {
          const snapshot = await get(ref(database, `movies_by_id/${id}`));
          if (snapshot.exists()) return snapshot.val();
          return null;
        } catch (error) {
          console.error('Fetch movie error:', error);
          return null;
        }
      },

      setCurrentTab: (tab) => set({ currentTab: tab }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterGenre: (genre) => set({ filterGenre: genre }),
      setFilterYear: (year) => set({ filterYear: year }),
      setFilterLanguage: (lang) => set({ filterLanguage: lang }),
      setViewMode: (mode) => set({ viewMode: mode }),

      addToSearchHistory: (term) => {
        const { searchHistory } = getState();
        const updated = [term, ...searchHistory.filter(t => t !== term)].slice(0, 20);
        set({ searchHistory: updated });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),

      addToWatchlist: (movie) => {
        const { watchlist } = getState();
        if (!watchlist.find(m => m.movie_id === movie.movie_id)) {
          set({ watchlist: [movie, ...watchlist] });
        }
      },
      removeFromWatchlist: (movieId) => {
        const { watchlist } = getState();
        set({ watchlist: watchlist.filter(m => m.movie_id !== movieId) });
      },
      isInWatchlist: (movieId) => {
        return getState().watchlist.some(m => m.movie_id === movieId);
      },

      addToWatchHistory: (movie) => {
        const { watchHistory } = getState();
        const updated = [
          { ...movie, watchedAt: Date.now() },
          ...watchHistory.filter(m => m.movie_id !== movie.movie_id)
        ].slice(0, 100);
        set({ watchHistory: updated });
      },

      updateContinueWatching: (movie, progress, duration) => {
        const { continueWatching } = getState();
        const existing = continueWatching.filter(m => m.movie_id !== movie.movie_id);
        if (progress > 0.02 && progress < 0.95) {
          set({
            continueWatching: [
              { ...movie, progress, duration, updatedAt: Date.now() },
              ...existing
            ].slice(0, 30)
          });
        } else if (progress >= 0.95) {
          set({ continueWatching: existing });
        }
      },
      removeFromContinueWatching: (movieId) => {
        const { continueWatching } = getState();
        set({ continueWatching: continueWatching.filter(m => m.movie_id !== movieId) });
      },

      toggleLike: (movieId) => {
        const { likedMovies } = getState();
        if (likedMovies.includes(movieId)) {
          set({ likedMovies: likedMovies.filter(id => id !== movieId) });
        } else {
          set({ likedMovies: [...likedMovies, movieId] });
        }
      },
      isLiked: (movieId) => getState().likedMovies.includes(movieId),

      updatePreferences: (prefs) => {
        const { userPreferences } = getState();
        set({ userPreferences: { ...userPreferences, ...prefs } });
      },

      addNotification: (notification) => {
        const { notifications } = getState();
        set({
          notifications: [{ ...notification, id: Date.now(), read: false }, ...notifications].slice(0, 50),
          hasNewContent: true
        });
      },
      markNotificationsRead: () => {
        const { notifications } = getState();
        set({
          notifications: notifications.map(n => ({ ...n, read: true })),
          hasNewContent: false
        });
      },
    }),
    {
      name: 'mflix-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        watchHistory: state.watchHistory,
        continueWatching: state.continueWatching,
        likedMovies: state.likedMovies,
        searchHistory: state.searchHistory,
        userPreferences: state.userPreferences,
        notifications: state.notifications,
      }),
    }
  )
);

export default useStore;
