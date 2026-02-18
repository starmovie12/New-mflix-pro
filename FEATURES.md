# MFLIX Modern Features (Implemented)

This project modernizes the original `index.html` + `video-player.html` into a fast, modular app while keeping the same core behavior (tabs, search, Firebase catalog, player with movie/series logic).

## Catalog (index.html)

- Multi-tab catalog: **Home / Movies / Series / Anime / 18+**
- Sticky top bar with blur + modern layout
- Fast **debounced** search
- Search across multiple fields (title, cast, director, genre, keywords, year, language, category, etc.)
- URL sync for search (`?q=`) via `history.replaceState`
- Clear search button
- Keyboard shortcut: `/` focuses search
- Keyboard shortcut: `Esc` closes sheets + clears search
- Infinite scroll loading (IntersectionObserver sentinel)
- Grid density toggle: **comfortable / compact**
- Responsive grid breakpoints for mobile/tablet/desktop
- Movie cards with semantic `<article>` and accessible roles
- Poster lazy-loading
- Poster fallback on image error
- Language badge (top-right)
- Adult badge for 18+ items
- Quality badge
- Rating badge
- Continue-watching progress bar on cards (if available)
- Hover/focus action overlay (desktop): **Add to My List / Like**
- Watchlist (My List) persistence in localStorage
- Likes persistence in localStorage
- Quick chips: Latest / Top Rated / My List / Liked / Reset
- Advanced Filters sheet
- Filter: Language
- Filter: Quality
- Filter: Year from/to
- Filter: Minimum rating slider
- Sort: Relevance / Latest / Top Rated
- Offline awareness banner (shows cached data when available)
- Adult gate: 18+ tab requires confirmation (stored once)
- Recently Viewed row on Home (persisted)
- SEO meta updates per tab (title + description)

## Player (video-player.html)

- Loads content by `?id=` from Firebase
- Skeleton loading state
- Movie vs Series auto-detection
- Movie mode: supports multiple sources (qualities/download_links)
- Auto-plays first movie source (when available)
- Quality/source menu (play a specific quality)
- Download menu (open source in new tab)
- Series mode: episodes overlay with seasons + episodes
- Auto-plays first episode (when available)
- Fit toggle (contain/cover)
- Playback speed menu (0.75x → 2x)
- Continue Watching tracking (timeupdate throttled)
- Resume / Restart banner when progress exists
- Share button: Web Share API, fallback to clipboard copy
- Related grid (12 items) from cached catalog
- Player SEO (title/description/canonical + JSON-LD Movie/TVSeries)
- Accessible dialogs (episodes overlay)

## Performance + Architecture

- React 18 + TypeScript
- Vite multi-page build (keeps `index.html` and `video-player.html` URLs)
- Modular Firebase SDK (v10) with localStorage caching (6-hour TTL)
- Minimal re-renders via `useMemo` + transitions
- No server routing required (static hosting friendly)

## PWA

- Service worker generated (auto update)
- Web app manifest included

