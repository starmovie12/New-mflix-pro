# MFLIX (Modern)

Modern, fast MFLIX frontend built with **React + TypeScript + Vite** (multi-page build so legacy URLs stay the same):

- `index.html` (catalog: Home / Movies / Series / Anime / 18+)
- `video-player.html` (player: movie + series episodes)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Firebase config (optional)

By default the app uses the same Firebase config values embedded in the original HTML you provided.
You can override via `.env`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_APP_ID=...
```

