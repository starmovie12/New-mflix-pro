import { useNavigate } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMovies } from '../context/MovieContext';

function FavoritesSection() {
  const { favorites, toggleFavorite } = useMovies();
  const navigate = useNavigate();

  if (favorites.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-white mb-4 px-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-mflix-red fill-mflix-red" /> My Favorites
      </h2>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
        {favorites.slice(0, 15).map((item, i) => {
          const type = (item.category && item.category.toLowerCase().includes('series')) ? 'tv' : 'movie';
          return (
            <motion.div
              key={item.movie_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex-shrink-0 w-24 cursor-pointer group"
              onClick={() => navigate(`/watch/${item.movie_id}?type=${type}`)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-mflix-card">
                <img src={item.poster || 'https://via.placeholder.com/200x300'} alt={item.title} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/80"
                >
                  <Heart className="w-4 h-4 text-mflix-red fill-mflix-red" />
                </button>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-mflix-red flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-white mt-1 truncate">{item.title}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default FavoritesSection;
