import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlay, HiPlus, HiInformationCircle, HiCheck, HiStar } from 'react-icons/hi2';
import useStore from '../store/useStore';
import { FALLBACK_BACKDROP } from '../utils/constants';
import { getContentType } from '../utils/helpers';

const HeroBanner = memo(function HeroBanner({ movies = [] }) {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const featured = movies.slice(0, 8);
  const current = featured[currentIndex];

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  }, [featured.length]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(goToNext, 6000);
    return () => clearInterval(timer);
  }, [goToNext, featured.length]);

  if (!current) return null;

  const inWatchlist = isInWatchlist(current.movie_id);
  const backdrop = current.backdrop || current.poster || FALLBACK_BACKDROP;

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="relative w-full aspect-[16/9] max-h-[500px] overflow-hidden rounded-xl mx-auto">
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={backdrop}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {current.quality_name && (
                <span className="px-2 py-0.5 bg-primary/90 text-white text-[10px] font-bold rounded uppercase">
                  {current.quality_name}
                </span>
              )}
              {current.rating && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-[10px] font-bold rounded">
                  <HiStar className="text-xs" /> {current.rating}
                </span>
              )}
              {current.year && (
                <span className="px-2 py-0.5 bg-white/10 text-white/80 text-[10px] font-bold rounded">
                  {current.year}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-2 line-clamp-2 drop-shadow-lg">
              {current.title}
            </h2>

            {current.genre && (
              <p className="text-xs sm:text-sm text-text-secondary mb-3 line-clamp-1">
                {typeof current.genre === 'string' ? current.genre : Array.isArray(current.genre) ? current.genre.join(' • ') : ''}
              </p>
            )}

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate(`/watch/${current.movie_id}?type=${getContentType(current)}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-95"
              >
                <HiPlay className="text-lg" /> Play Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (inWatchlist) removeFromWatchlist(current.movie_id);
                  else addToWatchlist(current);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all backdrop-blur-sm active:scale-95"
              >
                {inWatchlist ? <HiCheck className="text-lg text-green-400" /> : <HiPlus className="text-lg" />}
                {inWatchlist ? 'Added' : 'My List'}
              </button>
              <button
                onClick={() => navigate(`/watch/${current.movie_id}?type=${getContentType(current)}`)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm active:scale-95"
              >
                <HiInformationCircle className="text-xl" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? 'w-6 h-1.5 bg-primary'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

export default HeroBanner;
