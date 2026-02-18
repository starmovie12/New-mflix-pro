# MFLIX - Next.js 14 Movie Streaming App

A modern, secure movie streaming application built with Next.js 14 (App Router), Tailwind CSS, and Lucide React.

## Features

- **Dark Mode UI**: #050505 background with #E50914 red accents
- **Tab Navigation**: Home, Movies, Series, Anime, 18+ with swipe gestures
- **Search**: Full-text search across title, actor, genre, year, and more
- **Movie Cards**: Portrait aspect ratio with quality badge and rating
- **Video Player**: Dynamic `/watch/[id]` route with Movie vs Series detection
  - **Movies**: Server/Quality dropdowns, Play button
  - **Series**: Episodes button with episode list overlay
- **Custom Controls**: Back button, Quality settings, Next Episode (no default browser controls)
- **Firebase**: Realtime Database integration for `movies_by_id` node
- **Security**: X-Frame-Options, X-Content-Type-Options headers
- **Ads**: Monetag scripts loaded via Next.js Script (lazyOnload)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   Copy `.env.local.example` to `.env.local` and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxxx:web:xxxxxxxxxxxxxx
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout, meta, ad scripts
│   ├── page.tsx        # Home page with tabs, search, movie grid
│   ├── globals.css     # Tailwind + custom styles
│   └── watch/[id]/     # Video player (movie/series)
├── components/
│   ├── MovieCard.tsx   # Movie card with poster, badges
│   ├── TabBar.tsx      # Tab navigation
│   ├── SearchHeader.tsx
│   ├── PlayerControls.tsx  # Video overlay controls
│   ├── EpisodeList.tsx     # Series episode popup
│   └── AdScripts.tsx       # Monetag ad loading
└── lib/
    └── firebase.ts     # Firebase config (env vars)
```

## Firebase Data Structure

The app expects data at `movies_by_id` in Firebase Realtime Database. Each item can have:

- **Movies**: `download_links`, `qualities`, or `url` for video sources
- **Series**: `seasons` array with `episodes` (each with `url` or `link`)

## Responsive Design

Fully mobile-responsive with:
- 3 columns on mobile, 4 on tablet, 5 on desktop
- Swipe gestures for tab navigation
- No horizontal scroll on body
