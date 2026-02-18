import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';

const MovieContext = createContext(null);

export function MovieProvider({ children }) {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mflix_watch_history') || '[]');
    } catch { return []; }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mflix_favorites') || '[]');
    } catch { return []; }
  });
  const [continueWatching, setContinueWatching] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mflix_continue') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    const dbRef = ref(database, 'movies_by_id');
    const unsub = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAllMovies(Object.entries(data).map(([id, m]) => ({ ...m, movie_id: id })));
      } else {
        setAllMovies([]);
      }
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('mflix_watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('mflix_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('mflix_continue', JSON.stringify(continueWatching));
  }, [continueWatching]);

  const addToHistory = useCallback((movie) => {
    setWatchHistory(prev => {
      const filtered = prev.filter(m => m.movie_id !== movie.movie_id);
      return [{ ...movie, watchedAt: Date.now() }, ...filtered].slice(0, 50);
    });
  }, []);

  const addToContinue = useCallback((movie, progress = 0) => {
    setContinueWatching(prev => {
      const filtered = prev.filter(m => m.movie_id !== movie.movie_id);
      return [{ ...movie, progress, updatedAt: Date.now() }, ...filtered].slice(0, 20);
    });
  }, []);

  const updateProgress = useCallback((movieId, progress) => {
    setContinueWatching(prev => prev.map(m =>
      m.movie_id === movieId ? { ...m, progress, updatedAt: Date.now() } : m
    ));
  }, []);

  const toggleFavorite = useCallback((movie) => {
    setFavorites(prev => {
      const exists = prev.some(m => m.movie_id === movie.movie_id);
      if (exists) return prev.filter(m => m.movie_id !== movie.movie_id);
      return [...prev, movie].slice(0, 100);
    });
  }, []);

  const isFavorite = useCallback((movieId) => 
    favorites.some(m => m.movie_id === movieId), [favorites]);

  const getMovieById = useCallback((id) => 
    allMovies.find(m => m.movie_id === id), [allMovies]);

  return (
    <MovieContext.Provider value={{
      allMovies,
      loading,
      error,
      watchHistory,
      favorites,
      continueWatching,
      addToHistory,
      addToContinue,
      updateProgress,
      toggleFavorite,
      isFavorite,
      getMovieById,
    }}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies() {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error('useMovies must be used within MovieProvider');
  return ctx;
}
