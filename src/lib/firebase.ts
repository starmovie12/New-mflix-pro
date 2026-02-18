import { initializeApp, getApps } from 'firebase/app';
import { get, getDatabase, ref } from 'firebase/database';
import type { RawMovie } from '../types/mflix';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAFj5jrF26JDJdcteQzdojXcUypvm3UaKc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'bhaag-df531.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://bhaag-df531-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'bhaag-df531',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'bhaag-df531.firebasestorage.app',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:421542632463:web:xxxxxxxxxxxxxx'
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
export const db = getDatabase(app);

type CacheEnvelope<T> = { v: 1; ts: number; ttlMs: number; data: T };

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || parsed.v !== 1) return null;
    if (Date.now() - parsed.ts > parsed.ttlMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T, ttlMs: number) {
  try {
    const env: CacheEnvelope<T> = { v: 1, ts: Date.now(), ttlMs, data };
    localStorage.setItem(key, JSON.stringify(env));
  } catch {
    // ignore
  }
}

const ALL_MOVIES_CACHE_KEY = 'mflix.cache.allMovies.v1';
const ALL_MOVIES_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchAllMovies(): Promise<RawMovie[]> {
  const cached = readCache<RawMovie[]>(ALL_MOVIES_CACHE_KEY);
  if (cached?.length) return cached;

  const snap = await get(ref(db, 'movies_by_id'));
  if (!snap.exists()) return [];
  const val = snap.val() as Record<string, RawMovie>;
  const list = Object.values(val ?? {});
  writeCache(ALL_MOVIES_CACHE_KEY, list, ALL_MOVIES_TTL);
  return list;
}

export async function fetchMovieById(id: string): Promise<RawMovie | null> {
  if (!id) return null;
  const snap = await get(ref(db, `movies_by_id/${id}`));
  if (!snap.exists()) return null;
  return snap.val() as RawMovie;
}

