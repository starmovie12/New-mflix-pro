import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlay, HiStar, HiPlus, HiCheck } from 'react-icons/hi2';
import useStore from '../store/useStore';
import { FALLBACK_POSTER } from '../utils/constants';
import { getContentType, formatDuration } from '../utils/helpers';

const MovieListItem = memo(function MovieListItem({ item, index = 0 }) {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useStore();
  const [imgLoaded, setImgLoaded] = useState(false);

  const title = item.title || 'Untitled';
  const poster = item.poster || FALLBACK_POSTER;
  const rating = item.rating || 'N/A';
  const quality = item.quality_name || 'HD';
  const year = item.year || '2024';
  const genre = typeof item.genre === 'string' ? item.genre : Array.isArray(item.genre) ? item.genre.join(', ') : '';
  const type = getContentType(item);
  const inWatchlist = isInWatchlist(item.movie_id);
  const runtime = item.runtime ? formatDuration(parseInt(item.runtime)) : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      className="flex gap-3 p-2 rounded-xl hover:bg-bg-hover transition-colors cursor-pointer group"
      onClick={() => navigate(`/watch/${item.movie_id}?type=${type}`)}
    >
      <div className="relative flex-shrink-0 w-20 aspect-[2/3] rounded-lg overflow-hidden bg-bg-elevated">
        {!imgLoaded && <div className="absolute inset-0 animate-shimmer" />}
        <img
          src={poster}
          alt={title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <HiPlay className="text-white text-2xl" />
        </div>
      </div>

      <div className="flex-1 min-w-0 py-1">
        <h3 className="text-sm font-bold text-white truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">{quality}</span>
          <span className="text-xs text-text-secondary">{year}</span>
          {runtime && <span className="text-xs text-text-muted">{runtime}</span>}
        </div>
        {genre && <p className="text-[11px] text-text-muted mt-1 truncate">{genre}</p>}
        <div className="flex items-center gap-1 mt-1.5">
          <HiStar className="text-accent-gold text-xs" />
          <span className="text-xs font-semibold text-text-secondary">{rating}</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          inWatchlist ? removeFromWatchlist(item.movie_id) : addToWatchlist(item);
        }}
        className="self-center w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
      >
        {inWatchlist ? <HiCheck className="text-green-400" /> : <HiPlus />}
      </button>
    </motion.div>
  );
});

export default MovieListItem;
