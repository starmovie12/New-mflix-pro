# MFLIX - Modern Streaming Platform

A professional, Netflix-style movie streaming platform built with **React 19**, **Vite 7**, **Tailwind CSS**, and **Firebase**. Features 50+ premium capabilities for an engaging user experience.

## Tech Stack

- **React 19** - Modern UI library
- **Vite 7** - Fast build tool & dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS 3** - Utility-first styling
- **Firebase Realtime Database** - Backend data
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

## Features (50+)

### Core
- Home, Movies, Series, Anime, 18+ tabs
- Firebase-powered movie catalog
- Responsive grid (3-6 columns by breakpoint)
- Lazy-loaded images
- SEO meta tags & schema.org

### Search & Discovery
- Full-screen advanced search (Ctrl+K / Cmd+K)
- Filter by genre, year, quality
- Sort by newest, rating, title
- Debounced search (300ms)
- Multi-field search (title, cast, director, genre, etc.)

### Personalization
- Continue Watching (progress saved)
- Favorites / Watchlist
- Watch history (last 50)
- LocalStorage persistence

### Video Player
- Quality selector dropdown
- Multiple source support
- Series episodes popup
- Download links
- Fullscreen mode
- Share (Web Share API / clipboard)
- Progress tracking

### UX
- Back to top button
- Skeleton loaders
- Smooth animations
- Hide header on scroll down
- Mobile-optimized tabs
- Keyboard shortcuts (Esc to close search)

### Deployment
- PWA manifest
- Netlify/Vercel SPA redirects
- Production build optimized

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output in `dist/`. Deploy the `dist` folder to any static host.

## Deployment

- **Vercel**: `vercel.json` included for SPA routing
- **Netlify**: `public/_redirects` for client-side routes
- **Any static host**: Serve `dist/` with fallback to `index.html` for `/watch/*` routes

## Firebase Config

Update `src/lib/firebase.js` with your Firebase project credentials.
