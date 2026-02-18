import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlay, HiStar, HiPlus, HiCheck } from 'react-icons/hi2';
import useStore from '../store/useStore';
import { FALLBACK_POSTER } from '../utils/constants';
import { getContentType } from '../utils/helpers';

const MovieCard = memo(function MovieCard({ item, index = 0, showRank = false }) {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = item.title || 'Untitled';
  const poster = imageError ? FALLBACK_POSTER : (item.poster || FALLBACK_POSTER);
  const rating = item.rating || 'N/A';
  const quality = item.quality_name || 'HD';
  const year = item.year || '2024';
  const lang = (item.original_language || 'Dub').toUpperCase();
  const type = getContentType(item);
  const inWatchlist = isInWatchlist(item.movie_id);

  const handleClick = () => {
    navigate(`/watch/${item.movie_id}?type=${type}`);
  };

  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(item.movie_id);
    } else {
      addToWatchlist(item);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      className="group relative cursor-pointer"
      onClick={handleClick}
      role="button"
      aria-label={`Watch ${title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Poster Image */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-bg-elevated shadow-lg">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-shimmer rounded-lg" />
        )}
        <img
          src={poster}
          alt={`${title} (${year}) poster`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } group-hover:scale-105`}
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-xl backdrop-blur-sm">
            <HiPlay className="text-white text-xl ml-0.5" />
          </div>
        </div>

        {/* Language Badge */}
        <div className="absolute top-0 right-0 bg-primary/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wide">
          {lang}
        </div>

        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistToggle}
          className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/80 z-10"
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inWatchlist ? <HiCheck className="text-sm" /> : <HiPlus className="text-sm" />}
        </button>

        {/* Rank Number */}
        {showRank && (
          <div className="absolute bottom-1 left-1 font-black text-4xl text-white/20 leading-none select-none">
            {index + 1}
          </div>
        )}
      </div>

      {/* Title & Year */}
      <div className="flex items-center justify-between mt-1.5 px-0.5 gap-1">
        <h3 className="text-[11px] font-semibold text-white truncate flex-1">{title}</h3>
        <span className="text-[10px] text-text-secondary flex-shrink-0">{year}</span>
      </div>

      {/* Quality & Rating */}
      <div className="flex items-center justify-between mt-0.5 px-0.5">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black border border-border-light text-white uppercase">
          {quality}
        </span>
        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
          {rating} <HiStar className="text-[8px]" />
        </span>
      </div>
    </motion.article>
  );
});

export default MovieCard;
