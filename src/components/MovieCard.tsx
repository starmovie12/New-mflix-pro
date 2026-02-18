import React, { useMemo } from 'react';
import type { NormalizedMovie } from '../types/mflix';
import { isInMap, useUserStore } from '../store/userStore';
import { formatTime } from '../lib/utils';

export function MovieCard({
  movie,
  onOpen
}: {
  movie: NormalizedMovie;
  onOpen: (m: NormalizedMovie) => void;
}) {
  const { watchlist, likes, continueWatching, toggleLike, toggleWatchlist } = useUserStore();
  const inWatchlist = isInMap(watchlist, movie.id);
  const liked = isInMap(likes, movie.id);
  const cont = continueWatching[movie.id];

  const progressPct = useMemo(() => {
    if (!cont?.t || !cont.d) return null;
    if (cont.d <= 0) return null;
    return Math.max(0, Math.min(100, (cont.t / cont.d) * 100));
  }, [cont?.d, cont?.t]);

  return (
    <article className="card" role="button" tabIndex={0} aria-label={`Watch ${movie.title}`}>
      <div
        className="poster"
        onClick={() => onOpen(movie)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpen(movie);
        }}
      >
        <img
          src={movie.poster ?? undefined}
          alt={`Watch ${movie.title} (${movie.year})`}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://via.placeholder.com/200x300?text=No+Image';
          }}
        />
        <div className="badge-top">{movie.language}</div>
        {movie.isAdult ? (
          <div className="badge-top badge-adult" style={{ left: 10, right: 'auto' }}>
            18+
          </div>
        ) : null}

        {progressPct !== null ? (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4 }}>
            <div
              style={{
                height: 4,
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, var(--red), #ff6b6b)'
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="card-actions">
        <button
          className="icon-btn"
          aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(movie.id);
          }}
        >
          <i className={inWatchlist ? 'fas fa-check' : 'fas fa-plus'} />
        </button>
        <button
          className="icon-btn"
          aria-label={liked ? 'Unlike' : 'Like'}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(movie.id);
          }}
        >
          <i className={liked ? 'fas fa-heart' : 'far fa-heart'} />
        </button>
      </div>

      <div className="card-meta" onClick={() => onOpen(movie)}>
        <div className="card-title-row">
          <h3 className="card-title">{movie.title}</h3>
          <div className="card-year">{movie.year}</div>
        </div>
        <div className="card-badges">
          <span className="pill">{movie.quality}</span>
          <span className="pill pill-red">
            {movie.ratingText} <span aria-hidden="true">★</span>
          </span>
        </div>
        {cont?.t ? (
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: 12 }}>
            Continue: {formatTime(cont.t)}
          </div>
        ) : null}
      </div>
    </article>
  );
}

