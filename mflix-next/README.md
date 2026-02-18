# MFLIX - Next.js 14 Movie Streaming App

A modern, secure movie streaming application built with Next.js 14 (App Router), Tailwind CSS, and Lucide React.

## Features

- **Dark Mode Theme**: #050505 background with #E50914 red accents
- **Tab Navigation**: Home, Movies, Series, Anime, 18+ with swipe gestures
- **Firebase Realtime Database**: Fetches movies from `movies_by_id` node
- **Search**: Full-text search across title, cast, genre, year, and more
- **Video Player**: Dynamic `/watch/[id]` route with:
  - Movie: Server/Quality dropdowns and Play button
  - Series: Episodes button and Episode List overlay
  - Custom controls: Back, Quality, Speed, Fullscreen, PiP, Next Episode

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase credentials from the [Firebase Console](https://console.firebase.google.com/)

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxxx:web:xxxxx
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with metadata, fonts, ad scripts
│   ├── page.tsx        # Home page with tabs and movie grid
│   └── watch/[id]/
│       └── page.tsx    # Video player (movie/series)
├── components/
│   ├── MovieCard.tsx
│   ├── MovieGrid.tsx
│   ├── SearchHeader.tsx
│   ├── TabBar.tsx
│   ├── SwipeContainer.tsx
│   ├── MonetagScripts.tsx
│   └── player/
│       ├── PlayerControls.tsx
│       └── EpisodeList.tsx
├── hooks/
│   └── useMovies.ts
├── lib/
│   ├── firebase.ts
│   └── player-utils.ts
└── types/
    └── movie.ts
```

## Security

- **X-Frame-Options: DENY** - Prevents clickjacking
- **X-Content-Type-Options: nosniff** - Prevents MIME sniffing
- **Environment Variables** - Firebase keys in `.env.local` (never committed)

## Ads

Monetag ad scripts are loaded via Next.js `<Script>` component with `strategy="lazyOnload"` in `MonetagScripts.tsx`.
