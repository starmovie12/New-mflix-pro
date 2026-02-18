import { useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiArrowRight } from 'react-icons/hi2';
import MovieCard from './MovieCard';

const MovieRow = memo(function MovieRow({ title, movies = [], showRank = false, icon: Icon }) {
  const scrollRef = useRef(null);

  if (!movies || movies.length === 0) return null;

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-3 mb-3">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-white">
          {Icon && <Icon className="text-primary text-lg" />}
          {title}
        </h2>
        <button className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-light transition-colors">
          See All <HiArrowRight className="text-sm" />
        </button>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-black/60 backdrop-blur-sm text-white rounded-r-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          aria-label="Scroll left"
        >
          <HiChevronLeft className="text-xl" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 px-3 overflow-x-auto hide-scrollbar scroll-smooth"
        >
          {movies.map((movie, index) => (
            <div key={movie.movie_id || index} className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px]">
              <MovieCard item={movie} index={index} showRank={showRank} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-black/60 backdrop-blur-sm text-white rounded-l-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          aria-label="Scroll right"
        >
          <HiChevronRight className="text-xl" />
        </button>
      </div>
    </section>
  );
});

export default MovieRow;
