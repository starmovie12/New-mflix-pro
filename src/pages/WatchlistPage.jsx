import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiBookmark, HiTrash, HiFilm } from 'react-icons/hi2';
import useStore from '../store/useStore';
import MovieCard from '../components/MovieCard';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useStore();

  return (
    <>
      <Helmet>
        <title>My Watchlist - MFLIX</title>
      </Helmet>

      <div className="pt-[108px] pb-20 min-h-screen px-3">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <HiBookmark className="text-primary" /> My Watchlist
          </h1>
          {watchlist.length > 0 && (
            <span className="text-xs text-text-muted bg-bg-elevated px-2.5 py-1 rounded-full">
              {watchlist.length} items
            </span>
          )}
        </div>

        {watchlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
              <HiBookmark className="text-3xl text-text-muted" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Your watchlist is empty</h2>
            <p className="text-sm text-text-muted max-w-xs">
              Add movies and shows to your watchlist to keep track of what you want to watch.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
            {watchlist.map((movie, idx) => (
              <MovieCard key={movie.movie_id || idx} item={movie} index={idx} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
