import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchAllMovies, fetchMovieById } from '../lib/firebase';
import { normalizeMovie, normalizePlayerData } from '../lib/normalize';
import type { NormalizedMovie, RawMovie } from '../types/mflix';
import { copyToClipboard, formatTime, getQueryParam } from '../lib/utils';
import { SkeletonGrid } from '../ui/SkeletonGrid';
import { Toast } from '../ui/Toast';
import { useUserStore } from '../store/userStore';
import '../styles/app.css';

export function PlayerApp() {
  const id = useMemo(() => (getQueryParam('id') ?? '').trim(), []);
  const [raw, setRaw] = useState<RawMovie | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fit, setFit] = useState<'contain' | 'cover'>('contain');
  const [toast, setToast] = useState<string | null>(null);

  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [dlMenuOpen, setDlMenuOpen] = useState(false);
  const [qMenuOpen, setQMenuOpen] = useState(false);
  const [epOpen, setEpOpen] = useState(false);

  const { pushHistory, setContinue, continueWatching, watchlist, likes, toggleWatchlist, toggleLike } =
    useUserStore();

  useEffect(() => {
    const run = async () => {
      if (!id) {
        setErr('No ID provided');
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchMovieById(id);
        if (!data) {
          setErr('Content not found');
          setRaw(null);
        } else {
          setRaw(data);
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const player = useMemo(() => (raw ? normalizePlayerData(raw) : null), [raw]);
  const normalizedMovie = useMemo(() => (raw ? normalizeMovie(raw) : null), [raw]);

  const cont = continueWatching[id];
  const inWatchlist = Boolean(watchlist[id]);
  const liked = Boolean(likes[id]);

  const links = player?.links ?? [];

  const playVideo = (url: string | null | undefined) => {
    if (!url) return;
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.src = url;
    v.load();
    v.play().catch(() => {
      // autoplay blocked
    });
  };

  // Auto-play: movie first link, series first episode
  useEffect(() => {
    if (!player) return;
    if (!videoRef.current) return;

    if (!player.isSeries) {
      if (links[0]?.url) playVideo(links[0].url);
      return;
    }
    const first = player.seasons?.[0]?.episodes?.[0];
    const url = first?.url ?? first?.link;
    if (url) playVideo(url);
  }, [links, player]);

  // History tracking
  useEffect(() => {
    if (!normalizedMovie) return;
    pushHistory({
      id: normalizedMovie.id,
      title: normalizedMovie.title,
      poster: normalizedMovie.poster,
      year: normalizedMovie.year,
      isSeries: normalizedMovie.isSeries
    });
  }, [normalizedMovie, pushHistory]);

  // Continue watching (throttled)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !id) return;
    let lastTs = 0;
    const onTime = () => {
      const now = Date.now();
      if (now - lastTs < 1500) return;
      lastTs = now;
      if (v.currentTime > 3) {
        setContinue(id, { t: v.currentTime, d: Number.isFinite(v.duration) ? v.duration : undefined });
      }
    };
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [id, setContinue]);

  // Close menus on outside click
  useEffect(() => {
    const onClick = () => {
      setPlayMenuOpen(false);
      setDlMenuOpen(false);
      setQMenuOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const related = useRelated(normalizedMovie);

  if (loading) {
    return (
      <div className="player-page">
        <div className="player-wrap" />
        <div className="player-content">
          <div className="notice">
            <strong>Loading…</strong>
          </div>
          <div style={{ height: 14 }} />
          <SkeletonGrid count={12} />
        </div>
      </div>
    );
  }

  if (err || !player || !normalizedMovie) {
    return (
      <div className="player-page">
        <div className="player-wrap" />
        <div className="player-content">
          <div className="notice">
            <strong>Player error.</strong> {err ?? 'Unknown error'}
          </div>
          <div style={{ height: 14 }} />
          <button className="btn btn-primary" onClick={() => (window.location.href = 'index.html')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const share = async () => {
    const url = window.location.href;
    const title = player.title;
    // Prefer native share
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav: any = navigator;
    if (nav.share) {
      try {
        await nav.share({ title, url });
        setToast('Shared');
        return;
      } catch {
        // ignore
      }
    }
    const ok = await copyToClipboard(url);
    setToast(ok ? 'Link copied' : 'Copy failed');
  };

  const resume = () => {
    const v = videoRef.current;
    if (!v || !cont?.t) return;
    v.currentTime = cont.t;
    v.play().catch(() => {});
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  return (
    <div className="player-page">
      <Helmet>
        <title>{player.title} - MFLIX Player</title>
        <meta name="description" content={`Watch ${player.title} on MFLIX in HD. Fast streaming and easy quality selection.`} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': normalizedMovie.isSeries ? 'TVSeries' : 'Movie',
            name: player.title,
            datePublished: player.year,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: player.rating,
              ratingCount: 1
            }
          })}
        </script>
      </Helmet>

      <div className="player-wrap">
        <video
          ref={videoRef}
          className="player-video"
          controls
          playsInline
          autoPlay
          style={{ objectFit: fit }}
          poster={normalizedMovie.poster ?? undefined}
        />

        <div className="overlay">
          <button className="icon-btn" aria-label="Back" onClick={() => history.back()}>
            <i className="fas fa-arrow-left" />
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!player.isSeries ? (
              <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                <button
                  className="icon-btn"
                  aria-label="Quality"
                  onClick={() => setQMenuOpen((s) => !s)}
                >
                  <i className="fas fa-cog" />
                </button>
                <div className={`menu ${qMenuOpen ? 'open' : ''}`}>
                  {links.length ? (
                    links.map((l) => (
                      <button
                        key={l.url}
                        onClick={() => {
                          playVideo(l.url);
                          setQMenuOpen(false);
                        }}
                      >
                        Play {l.label} {l.info ? `• ${l.info}` : ''}
                      </button>
                    ))
                  ) : (
                    <button onClick={() => setQMenuOpen(false)}>No sources</button>
                  )}
                </div>
              </div>
            ) : null}

            <button className="icon-btn" aria-label="Fit" onClick={() => setFit((f) => (f === 'contain' ? 'cover' : 'contain'))}>
              <i className="fas fa-expand" />
            </button>
          </div>
        </div>
      </div>

      <div className="player-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 className="title-xl">{player.title}</h1>
          <span className="pill pill-red" style={{ fontSize: 12 }}>
            {player.qualityName}
          </span>
        </div>

        <div className="meta-row">
          <span className="meta-pill">{player.cert}</span>
          <span className="meta-pill">
            <i className="fas fa-star" style={{ color: 'var(--gold)' }} /> {player.rating}
          </span>
          <span className="meta-pill">
            <i className="fas fa-calendar-alt" /> {player.year}
          </span>
          <span className="meta-pill">
            <i className="fas fa-film" /> {player.genre}
          </span>
          <span className="meta-pill">
            <i className="fas fa-clock" /> {player.runtime}
          </span>
        </div>

        <div className="divider" />

        <div className={`actions ${player.isSeries ? 'series' : ''}`}>
          {!player.isSeries ? (
            <>
              <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-primary" style={{ height: 48, width: '100%' }} onClick={() => setPlayMenuOpen((s) => !s)}>
                  <i className="fas fa-play" /> Play
                </button>
                <div className={`menu ${playMenuOpen ? 'open' : ''}`}>
                  {links.length ? (
                    links.map((l) => (
                      <button
                        key={l.url}
                        onClick={() => {
                          playVideo(l.url);
                          setPlayMenuOpen(false);
                        }}
                      >
                        Play {l.label}
                      </button>
                    ))
                  ) : (
                    <button onClick={() => setPlayMenuOpen(false)}>No sources</button>
                  )}
                </div>
              </div>

              <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="btn" style={{ width: 48, height: 48 }} aria-label="Download" onClick={() => setDlMenuOpen((s) => !s)}>
                  <i className="fas fa-download" />
                </button>
                <div className={`menu ${dlMenuOpen ? 'open' : ''}`}>
                  {links.length ? (
                    links.map((l) => (
                      <button
                        key={l.url}
                        onClick={() => {
                          window.open(l.url, '_blank', 'noopener,noreferrer');
                          setDlMenuOpen(false);
                        }}
                      >
                        {l.label} {l.info ? `• ${l.info}` : ''}
                      </button>
                    ))
                  ) : (
                    <button onClick={() => setDlMenuOpen(false)}>No downloads</button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <button
              className="btn"
              style={{
                height: 48,
                width: '100%',
                background: 'linear-gradient(180deg, #2962ff, #1b46c7)',
                borderColor: 'rgba(41,98,255,0.4)',
                fontWeight: 900
              }}
              onClick={() => setEpOpen(true)}
            >
              <i className="fas fa-layer-group" /> View Episodes
            </button>
          )}
        </div>

        {cont?.t ? (
          <div className="notice" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <strong>Continue watching</strong> at {formatTime(cont.t)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={restart}>
                Restart
              </button>
              <button className="btn btn-primary" onClick={resume}>
                Resume
              </button>
            </div>
          </div>
        ) : null}

        <div className="divider" />

        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0' }}>
          <button className="btn btn-ghost" onClick={share}>
            <i className="fas fa-share-alt" /> Share
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              toggleWatchlist(id);
              setToast(inWatchlist ? 'Removed from My List' : 'Saved to My List');
            }}
          >
            <i className={inWatchlist ? 'fas fa-check' : 'fas fa-plus'} /> My List
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              toggleLike(id);
              setToast(liked ? 'Unliked' : 'Liked');
            }}
          >
            <i className={liked ? 'fas fa-heart' : 'far fa-heart'} /> Like
          </button>
          <button className="btn btn-ghost" onClick={() => setToast('Reported')}>
            <i className="far fa-flag" /> Report
          </button>
        </div>

        <div className="divider" />

        <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, fontWeight: 600 }}>{player.plot}</div>

        <div className="divider" />

        <h3 style={{ margin: '0 0 12px', fontWeight: 900 }}>More Like This</h3>
        {related === null ? (
          <SkeletonGrid count={12} />
        ) : related.length === 0 ? (
          <div className="empty">No related items yet.</div>
        ) : (
          <section className="grid compact" aria-label="Related grid">
            {related.map((m) => (
              <RelatedCard key={m.id} movie={m} />
            ))}
          </section>
        )}
      </div>

      <EpisodesOverlay
        open={epOpen}
        title={player.title}
        seasons={player.seasons}
        onClose={() => setEpOpen(false)}
        onPlay={(url) => {
          playVideo(url);
          setEpOpen(false);
        }}
      />

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function RelatedCard({ movie }: { movie: NormalizedMovie }) {
  return (
    <article
      className="card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${movie.title}`}
      onClick={() => {
        window.location.href = `video-player.html?id=${encodeURIComponent(movie.id)}&type=${
          movie.isSeries ? 'tv' : 'movie'
        }&source=firebase`;
      }}
    >
      <div className="poster">
        <img src={movie.poster ?? undefined} alt={movie.title} loading="lazy" />
        <div className="badge-top">{movie.language}</div>
      </div>
      <div className="card-meta">
        <div className="card-title-row">
          <h3 className="card-title">{movie.title}</h3>
          <div className="card-year">{movie.year}</div>
        </div>
      </div>
    </article>
  );
}

function EpisodesOverlay({
  open,
  title,
  seasons,
  onClose,
  onPlay
}: {
  open: boolean;
  title: string;
  seasons: { name?: string; episodes?: { title?: string; url?: string; link?: string }[] }[];
  onClose: () => void;
  onPlay: (url: string) => void;
}) {
  return (
    <div className={`episodes-overlay ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Episodes">
      <div className="ep-header">
        <div style={{ fontWeight: 900 }}>{title} • Episodes</div>
        <button className="icon-btn" onClick={onClose} aria-label="Close episodes">
          <i className="fas fa-times" />
        </button>
      </div>
      <div className="ep-body">
        {!seasons?.length ? (
          <div className="empty">No episodes found.</div>
        ) : (
          seasons.map((s, sIdx) => (
            <div key={sIdx}>
              <div className="season-title">{s.name ?? `Season ${sIdx + 1}`}</div>
              {(s.episodes ?? []).map((ep, eIdx) => {
                const url = (ep.url ?? ep.link ?? '').trim();
                if (!url) return null;
                return (
                  <div key={eIdx} className="episode-item" onClick={() => onPlay(url)} role="button" tabIndex={0}>
                    <div className="ep-num">{eIdx + 1}</div>
                    <div className="ep-name">{ep.title ?? `Episode ${eIdx + 1}`}</div>
                    <i className="fas fa-play-circle" style={{ color: 'var(--red)' }} />
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function useRelated(seed: NormalizedMovie | null) {
  const [list, setList] = useState<NormalizedMovie[] | null>(null);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!seed) return;
      try {
        const all = (await fetchAllMovies()).map(normalizeMovie).filter((m) => m.id && m.id !== seed.id);
        const cat = seed.categoryText.toLowerCase();
        const bucket = all.filter((m) => (cat && m.categoryText.toLowerCase().includes(cat)) || m.isSeries === seed.isSeries);
        const pool = bucket.length >= 12 ? bucket : all;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        if (alive) setList(shuffled.slice(0, 12));
      } catch {
        if (alive) setList([]);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [seed?.categoryText, seed?.id, seed?.isSeries]);

  return list;
}

