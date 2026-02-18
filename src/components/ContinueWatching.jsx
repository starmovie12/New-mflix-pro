import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlay, HiXMark } from 'react-icons/hi2';
import useStore from '../store/useStore';
import { FALLBACK_POSTER } from '../utils/constants';
import { getContentType } from '../utils/helpers';

const ContinueWatching = memo(function ContinueWatching() {
  const navigate = useNavigate();
  const { continueWatching, removeFromContinueWatching } = useStore();

  if (continueWatching.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="flex items-center gap-2 px-3 mb-3 text-base sm:text-lg font-bold text-white">
        <HiPlay className="text-primary" />
        Continue Watching
      </h2>
      <div className="flex gap-3 px-3 overflow-x-auto hide-scrollbar">
        {continueWatching.slice(0, 15).map((item, index) => (
          <motion.div
            key={item.movie_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-[160px] sm:w-[180px] group relative cursor-pointer"
            onClick={() => navigate(`/watch/${item.movie_id}?type=${getContentType(item)}`)}
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-bg-elevated">
              <img
                src={item.backdrop || item.poster || FALLBACK_POSTER}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                  <HiPlay className="text-white text-lg ml-0.5" />
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFromContinueWatching(item.movie_id); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <HiXMark className="text-sm" />
              </button>
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-primary rounded-r-full"
                  style={{ width: `${(item.progress || 0) * 100}%` }}
                />
              </div>
            </div>
            <p className="mt-1.5 text-xs font-medium text-white truncate">{item.title}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
});

export default ContinueWatching;
