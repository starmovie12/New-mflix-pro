import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ContinueState = {
  t: number;
  d?: number;
  updatedAt: number;
};

type HistoryItem = {
  id: string;
  title: string;
  poster: string | null;
  year: string;
  isSeries: boolean;
  ts: number;
};

type UserState = {
  watchlist: Record<string, true>;
  likes: Record<string, true>;
  history: HistoryItem[];
  continueWatching: Record<string, ContinueState>;
  lastTabIndex: number;
  gridDensity: 'comfortable' | 'compact';

  toggleWatchlist: (id: string) => void;
  toggleLike: (id: string) => void;
  pushHistory: (item: Omit<HistoryItem, 'ts'>) => void;
  setContinue: (id: string, state: Omit<ContinueState, 'updatedAt'>) => void;
  setLastTabIndex: (idx: number) => void;
  setGridDensity: (v: UserState['gridDensity']) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      watchlist: {},
      likes: {},
      history: [],
      continueWatching: {},
      lastTabIndex: 0,
      gridDensity: 'comfortable',

      toggleWatchlist: (id) =>
        set((s) => {
          const next = { ...s.watchlist };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { watchlist: next };
        }),

      toggleLike: (id) =>
        set((s) => {
          const next = { ...s.likes };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { likes: next };
        }),

      pushHistory: (item) =>
        set((s) => {
          const nextItem: HistoryItem = { ...item, ts: Date.now() };
          const deduped = [nextItem, ...s.history.filter((h) => h.id !== item.id)];
          return { history: deduped.slice(0, 60) };
        }),

      setContinue: (id, state) =>
        set((s) => ({
          continueWatching: {
            ...s.continueWatching,
            [id]: { ...state, updatedAt: Date.now() }
          }
        })),

      setLastTabIndex: (idx) => set({ lastTabIndex: idx }),

      setGridDensity: (v) => set({ gridDensity: v })
    }),
    {
      name: 'mflix.user.v1',
      version: 1,
      partialize: (s) => ({
        watchlist: s.watchlist,
        likes: s.likes,
        history: s.history,
        continueWatching: s.continueWatching,
        lastTabIndex: s.lastTabIndex,
        gridDensity: s.gridDensity
      })
    }
  )
);

export function isInMap(map: Record<string, true>, id: string) {
  return Boolean(map[id]);
}

