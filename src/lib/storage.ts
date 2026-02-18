export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function updateSetStorage(
  key: string,
  id: string,
  shouldAdd = true
): Set<string> {
  const current = new Set<string>(readJSON<string[]>(key, []));
  if (shouldAdd) current.add(id);
  else current.delete(id);
  writeJSON(key, Array.from(current));
  return current;
}

export function boundedPush<T extends Record<string, unknown>>(
  key: string,
  item: T,
  maxSize = 25,
  idField = "id"
): T[] {
  const list = readJSON<T[]>(key, []);
  const filtered = list.filter(
    (entry) => entry?.[idField] !== item?.[idField]
  );
  filtered.unshift(item);
  const next = filtered.slice(0, maxSize);
  writeJSON(key, next);
  return next;
}

export const STORAGE_KEYS = {
  WATCHLIST: "mflix_watchlist_v2",
  LIKED: "mflix_liked_v2",
  RECENTS: "mflix_recent_search_v2",
  HISTORY: "mflix_watch_history_v2",
  SETTINGS: "mflix_ui_settings_v2",
  PLAYBACK: "mflix_playback_state_v2",
};
