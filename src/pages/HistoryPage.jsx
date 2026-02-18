import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClock, HiTrash, HiFilm } from 'react-icons/hi2';
import useStore from '../store/useStore';
import MovieCard from '../components/MovieCard';
import { timeAgo } from '../utils/helpers';

export default function HistoryPage() {
  const { watchHistory } = useStore();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Watch History - MFLIX</title>
      </Helmet>

      <div className="pt-[108px] pb-20 min-h-screen px-3">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <HiClock className="text-primary" /> Watch History
          </h1>
          {watchHistory.length > 0 && (
            <span className="text-xs text-text-muted bg-bg-elevated px-2.5 py-1 rounded-full">
              {watchHistory.length} watched
            </span>
          )}
        </div>

        {watchHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
              <HiClock className="text-3xl text-text-muted" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No watch history</h2>
            <p className="text-sm text-text-muted max-w-xs">
              Movies and shows you watch will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
            {watchHistory.map((movie, idx) => (
              <div key={movie.movie_id || idx} className="relative">
                <MovieCard item={movie} index={idx} />
                {movie.watchedAt && (
                  <p className="text-[9px] text-text-muted mt-0.5 px-0.5 truncate">
                    {timeAgo(movie.watchedAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
