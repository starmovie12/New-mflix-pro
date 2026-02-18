import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchAllMovies } from '../lib/firebase';
import { normalizeMovie } from '../lib/normalize';
import type { MflixCategory, NormalizedMovie, RawMovie } from '../types/mflix';
import { debounce, getQueryParam, toSearchable } from '../lib/utils';
import { MovieCard } from '../components/MovieCard';
import { SkeletonGrid } from '../ui/SkeletonGrid';
import { Sheet } from '../ui/Sheet';
import { useUserStore } from '../store/userStore';
import '../styles/app.css';

const tabs: { label: string; id: MflixCategory; seo: string }[] = [
  { label: 'Home', id: 'home', seo: 'Watch Free HD Movies, Series & Anime Online' },
  { label: 'Movies', id: 'movies', seo: 'Browse New Bollywood & Hollywood Movies' },
  { label: 'Series', id: 'tvshow', seo: 'Watch Popular Web Series Online Free' },
  { label: 'Anime', id: 'anime', seo: 'Watch Anime Online English Sub/Dub' },
  { label: '18+', id: 'adult', seo: '18+ Content Warning' }
];

type SortBy = 'relevance' | 'latest' | 'rating';

type Filters = {
  sortBy: SortBy;
  minRating: number;
  yearFrom: string;
  yearTo: string;
  language: string;
  quality: string;
  onlyWatchlist: boolean;
  onlyLiked: boolean;
};

const defaultFilters: Filters = {
  sortBy: 'relevance',
  minRating: 0,
  yearFrom: '',
  yearTo: '',
  language: '',
  quality: '',
  onlyWatchlist: false,
  onlyLiked: false
};

export function CatalogApp() {
  const { lastTabIndex, setLastTabIndex, gridDensity, setGridDensity, watchlist, likes, history: viewHistory } =
    useUserStore();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [raw, setRaw] = useState<RawMovie[]>([]);

  const [tabIndex, setTabIndex] = useState(() => Math.min(Math.max(lastTabIndex ?? 0, 0), tabs.length - 1));
  const tab = tabs[tabIndex]!;

  const [searchText, setSearchText] = useState(() => getQueryParam('q') ?? '');
  const [searchTerm, setSearchTerm] = useState(() => toSearchable(getQueryParam('q') ?? ''));
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement | null>(null);

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [adultGateOpen, setAdultGateOpen] = useState(false);
  const [pendingTabIndex, setPendingTabIndex] = useState<number | null>(null);
  const [adultUnlocked, setAdultUnlocked] = useState(() => localStorage.getItem('mflix.adultUnlocked') === 'true');

  const [visibleCount, setVisibleCount] = useState(60);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLastTabIndex(tabIndex);
  }, [setLastTabIndex, tabIndex]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const list = await fetchAllMovies();
        setRaw(list);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load data';
        setErr(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const any = entries.some((x) => x.isIntersecting);
        if (any) setVisibleCount((c) => Math.min(c + 60, 1000));
      },
      { root: null, rootMargin: '800px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const updateSearch = useMemo(
    () =>
      debounce((value: string) => {
        startTransition(() => {
          const q = value.trim();
          setSearchTerm(toSearchable(q));
          setVisibleCount(60);
          const url = new URL(window.location.href);
          if (q) url.searchParams.set('q', q);
          else url.searchParams.delete('q');
          window.history.replaceState(null, '', url.toString());
        });
      }, 140),
    [startTransition]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setFilterOpen(false);
        setAdultGateOpen(false);
        if (searchText.length) {
          setSearchText('');
          updateSearch('');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchText.length, updateSearch]);

  const all = useMemo(() => raw.map(normalizeMovie).filter((m) => m.id), [raw]);

  const searchFields = useMemo(
    () => [
      'title',
      'cast',
      'director',
      'genre',
      'industry',
      'keywords',
      'platform',
      'quality_name',
      'spoken_languages',
      'writer',
      'year',
      'category',
      'original_language'
    ],
    []
  );

  const filtered = useMemo(() => {
    let list = all;

    // Tab category filter
    if (tab.id === 'movies') list = list.filter((m) => m.categoryText.toLowerCase().includes('movie') && !m.isSeries);
    else if (tab.id === 'tvshow') list = list.filter((m) => m.categoryText.toLowerCase().includes('series') || m.isSeries);
    else if (tab.id === 'anime') list = list.filter((m) => m.categoryText.toLowerCase().includes('anime'));
    else if (tab.id === 'adult') list = list.filter((m) => m.isAdult);

    // Watchlist / liked
    if (filters.onlyWatchlist) list = list.filter((m) => Boolean(watchlist[m.id]));
    if (filters.onlyLiked) list = list.filter((m) => Boolean(likes[m.id]));

    // Extra filters
    if (filters.language.trim()) {
      const v = filters.language.trim().toUpperCase();
      list = list.filter((m) => m.language === v);
    }
    if (filters.quality.trim()) {
      const v = filters.quality.trim().toLowerCase();
      list = list.filter((m) => m.quality.toLowerCase().includes(v));
    }
    if (filters.minRating > 0) {
      list = list.filter((m) => (m.ratingValue ?? 0) >= filters.minRating);
    }
    const yFrom = filters.yearFrom ? Number(filters.yearFrom) : null;
    const yTo = filters.yearTo ? Number(filters.yearTo) : null;
    if (yFrom || yTo) {
      list = list.filter((m) => {
        const y = Number(m.year);
        if (!Number.isFinite(y)) return false;
        if (yFrom && y < yFrom) return false;
        if (yTo && y > yTo) return false;
        return true;
      });
    }

    // Search (across multiple fields)
    if (searchTerm.length) {
      list = list.filter((m) => {
        return searchFields.some((field) => {
          const v = (m.raw as Record<string, unknown>)[field];
          return v && toSearchable(v).includes(searchTerm);
        });
      });
    }

    // Sort
    if (filters.sortBy === 'latest') {
      list = [...list].sort((a, b) => Number(b.year) - Number(a.year));
    } else if (filters.sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.ratingValue ?? -1) - (a.ratingValue ?? -1));
    } else if (filters.sortBy === 'relevance') {
      // keep stable; slight boost for rating when searching
      if (searchTerm.length) {
        list = [...list].sort((a, b) => (b.ratingValue ?? 0) - (a.ratingValue ?? 0));
      }
    }

    return list;
  }, [all, filters, likes, searchFields, searchTerm, tab.id, watchlist]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const openPlayer = (m: NormalizedMovie) => {
    const type = m.isSeries ? 'tv' : 'movie';
    // Preserve legacy URL shape, but modern page
    window.location.href = `video-player.html?id=${encodeURIComponent(m.id)}&type=${encodeURIComponent(
      type
    )}&source=firebase`;
  };

  const isOffline = typeof navigator !== 'undefined' ? navigator.onLine === false : false;
  const recent = viewHistory.slice(0, 12);

  const requestTabSwitch = (idx: number) => {
    if (idx === tabIndex) return;
    const target = tabs[idx];
    if (!target) return;
    if (target.id === 'adult' && !adultUnlocked) {
      setPendingTabIndex(idx);
      setAdultGateOpen(true);
      return;
    }
    setTabIndex(idx);
    setVisibleCount(60);
  };

  return (
    <div className="app-shell">
      <Helmet>
        <title>{`MFLIX - ${tab.label}`}</title>
        <meta
          name="description"
          content={`Watch the best ${tab.label} collection on MFLIX. High quality streaming, fast loading, daily updates.`}
        />
      </Helmet>

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark" aria-label="MFLIX">
              <span>M</span>
              <span>FLIX</span>
            </div>
            <div className="searchbox" style={{ flex: 1 }}>
              <i className="fas fa-magnifying-glass" style={{ color: 'rgba(255,255,255,0.65)' }} />
              <input
                ref={searchRef}
                value={searchText}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchText(v);
                  updateSearch(v);
                }}
                placeholder="Search actor, genre, year, language..."
                autoComplete="off"
                aria-label="Search Movies"
              />
              <div className="search-actions">
                {searchText.length ? (
                  <button
                    className="icon-btn"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearchText('');
                      updateSearch('');
                    }}
                  >
                    <i className="fas fa-xmark" />
                  </button>
                ) : null}
                <button className="btn btn-primary" onClick={() => setFilterOpen(true)}>
                  <i className="fas fa-sliders" /> Filters
                </button>
              </div>
            </div>
          </div>

          <button
            className="icon-btn"
            aria-label="Toggle grid density"
            title="Grid density"
            onClick={() => setGridDensity(gridDensity === 'compact' ? 'comfortable' : 'compact')}
          >
            <i className={gridDensity === 'compact' ? 'fas fa-border-all' : 'fas fa-grip'} />
          </button>
        </div>

        <nav className="tabs" aria-label="Content tabs">
          {tabs.map((t, idx) => (
            <button
              key={t.id}
              className={`tab ${idx === tabIndex ? 'active' : ''}`}
              onClick={() => {
                requestTabSwitch(idx);
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="page">
        {isOffline ? (
          <div className="notice" style={{ marginBottom: 12 }}>
            <strong>Offline</strong> mode: showing cached data if available.
          </div>
        ) : null}

        <div className="toolbar">
          <button
            className={`chip ${filters.sortBy === 'latest' ? 'active' : ''}`}
            onClick={() => setFilters((f) => ({ ...f, sortBy: f.sortBy === 'latest' ? 'relevance' : 'latest' }))}
          >
            <i className="fas fa-clock" /> Latest
          </button>
          <button
            className={`chip ${filters.sortBy === 'rating' ? 'active' : ''}`}
            onClick={() => setFilters((f) => ({ ...f, sortBy: f.sortBy === 'rating' ? 'relevance' : 'rating' }))}
          >
            <i className="fas fa-star" /> Top Rated
          </button>
          <button
            className={`chip ${filters.onlyWatchlist ? 'active' : ''}`}
            onClick={() => setFilters((f) => ({ ...f, onlyWatchlist: !f.onlyWatchlist }))}
          >
            <i className="fas fa-bookmark" /> My List
          </button>
          <button
            className={`chip ${filters.onlyLiked ? 'active' : ''}`}
            onClick={() => setFilters((f) => ({ ...f, onlyLiked: !f.onlyLiked }))}
          >
            <i className="fas fa-heart" /> Liked
          </button>
          <button className="chip" onClick={() => setFilters(defaultFilters)}>
            <i className="fas fa-rotate-left" /> Reset
          </button>
        </div>

        {tab.id === 'home' && !searchTerm.length && recent.length ? (
          <>
            <div className="row-title">Recently Viewed</div>
            <div className="row-scroll" aria-label="Recently viewed">
              {recent.map((h) => (
                <article
                  key={h.id}
                  className="card mini-card"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${h.title}`}
                  onClick={() => {
                    window.location.href = `video-player.html?id=${encodeURIComponent(h.id)}&type=${
                      h.isSeries ? 'tv' : 'movie'
                    }&source=firebase`;
                  }}
                >
                  <div className="poster">
                    <img src={h.poster ?? undefined} alt={h.title} loading="lazy" />
                  </div>
                  <div className="card-meta">
                    <div className="card-title-row">
                      <h3 className="card-title">{h.title}</h3>
                      <div className="card-year">{h.year}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {loading ? (
          <SkeletonGrid count={18} />
        ) : err ? (
          <div className="notice">
            <strong>Load failed.</strong> {err}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            {searchTerm.length ? (
              <div>No results for “{searchText.trim()}”. Try different keywords or clear filters.</div>
            ) : (
              <div>Nothing here yet.</div>
            )}
          </div>
        ) : (
          <>
            <section className={`grid ${gridDensity}`} aria-label="Movie grid">
              {visible.map((m) => (
                <MovieCard key={m.id} movie={m} onOpen={openPlayer} />
              ))}
            </section>
            <div ref={sentinelRef} style={{ height: 1 }} />
          </>
        )}
      </main>

      <Sheet
        open={filterOpen}
        title="Filters"
        onClose={() => {
          setFilterOpen(false);
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)' }}>Language</div>
            <input
              className="searchbox"
              style={{ padding: '10px 12px' }}
              value={filters.language}
              onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
              placeholder="e.g. HINDI, EN"
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)' }}>Quality</div>
            <input
              className="searchbox"
              style={{ padding: '10px 12px' }}
              value={filters.quality}
              onChange={(e) => setFilters((f) => ({ ...f, quality: e.target.value }))}
              placeholder="e.g. HD, 4K"
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)' }}>Year from</div>
            <input
              className="searchbox"
              style={{ padding: '10px 12px' }}
              value={filters.yearFrom}
              inputMode="numeric"
              onChange={(e) => setFilters((f) => ({ ...f, yearFrom: e.target.value.replace(/[^\d]/g, '').slice(0, 4) }))}
              placeholder="e.g. 2016"
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)' }}>Year to</div>
            <input
              className="searchbox"
              style={{ padding: '10px 12px' }}
              value={filters.yearTo}
              inputMode="numeric"
              onChange={(e) => setFilters((f) => ({ ...f, yearTo: e.target.value.replace(/[^\d]/g, '').slice(0, 4) }))}
              placeholder="e.g. 2026"
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)' }}>Minimum rating</div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={filters.minRating}
              onChange={(e) => setFilters((f) => ({ ...f, minRating: Number(e.target.value) }))}
            />
            <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}>{filters.minRating.toFixed(1)}+</div>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)' }}>Sort</div>
            <select
              className="searchbox"
              style={{ padding: '10px 12px' }}
              value={filters.sortBy}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as SortBy }))}
            >
              <option value="relevance">Relevance</option>
              <option value="latest">Latest</option>
              <option value="rating">Top Rated</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setFilters(defaultFilters)}>
            Reset
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setFilterOpen(false)}>
            Apply
          </button>
        </div>
      </Sheet>

      <Sheet
        open={adultGateOpen}
        title="18+ Content"
        onClose={() => {
          setAdultGateOpen(false);
          setPendingTabIndex(null);
        }}
      >
        <div className="notice">
          <strong>Warning:</strong> This section may contain adult content. Confirm you are 18+.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={() => {
              setAdultGateOpen(false);
              setPendingTabIndex(null);
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              localStorage.setItem('mflix.adultUnlocked', 'true');
              setAdultUnlocked(true);
              setAdultGateOpen(false);
              if (pendingTabIndex !== null) requestTabSwitch(pendingTabIndex);
              setPendingTabIndex(null);
            }}
          >
            I am 18+
          </button>
        </div>
      </Sheet>
    </div>
  );
}

