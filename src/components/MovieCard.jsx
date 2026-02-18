import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMovies } from '../context/MovieContext';

const FALLBACK_POSTER = 'https://via.placeholder.com/200x300?text=No+Image';

function MovieCard({ item, index }) {
  const navigate = useNavigate();
  const { addToHistory, toggleFavorite, isFavorite } = useMovies();
  
  const fullTitle = item.title || 'Untitled';
  const posterUrl = item.poster || FALLBACK_POSTER;
  const rating = item.rating || 'N/A';
  const quality = item.quality_name || 'HD';
  const year = item.year || item.release_year || '2024';
  const langText = (item.original_language || 'Dub').toUpperCase();
  const type = (item.category && item.category.toLowerCase().includes('series')) ? 'tv' : 'movie';
  const isFav = isFavorite(item.movie_id);

  const handleClick = () => {
    addToHistory(item);
    navigate(`/watch/${item.movie_id}?type=${type}`);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(item);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="group cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Watch ${fullTitle}`}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-mflix-card shadow-lg">
        <img
          src={posterUrl}
          alt={`Watch ${fullTitle} (${year}) Full Movie Online Free`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-0 right-0 bg-mflix-red text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
          {langText}
        </div>
        <button
          onClick={handleFavorite}
          className="absolute top-2 left-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-mflix-red text-mflix-red' : 'text-white'}`} />
        </button>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-mflix-red/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <div className="flex justify-between items-center gap-1">
          <h3 className="text-xs font-semibold text-white truncate flex-1">{fullTitle}</h3>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{year}</span>
        </div>
        <div className="flex justify-between items-center mt-1 gap-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black text-white border border-white/40">
            {quality}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-mflix-red text-white flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-current" /> {rating}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(MovieCard);
