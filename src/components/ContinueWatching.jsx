import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMovies } from '../context/MovieContext';

function ContinueWatching() {
  const { continueWatching } = useMovies();
  const navigate = useNavigate();

  if (continueWatching.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-white mb-4 px-4">Continue Watching</h2>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
        {continueWatching.slice(0, 10).map((item, i) => {
          const type = (item.category && item.category.toLowerCase().includes('series')) ? 'tv' : 'movie';
          return (
            <motion.div
              key={item.movie_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 w-28 cursor-pointer group"
              onClick={() => navigate(`/watch/${item.movie_id}?type=${type}`)}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-mflix-card">
                <img
                  src={item.poster || 'https://via.placeholder.com/200x300'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-mflix-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                {item.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div
                      className="h-full bg-mflix-red"
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-white mt-1 truncate">{item.title}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default ContinueWatching;
