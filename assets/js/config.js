import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAFj5jrF26JDJdcteQzdojXcUypvm3UaKc",
  authDomain: "bhaag-df531.firebaseapp.com",
  databaseURL: "https://bhaag-df531-default-rtdb.firebaseio.com",
  projectId: "bhaag-df531",
  storageBucket: "bhaag-df531.firebasestorage.app",
  appId: "1:421542632463:web:xxxxxxxxxxxxxx"
};

const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);

export const FALLBACK_POSTER = "https://via.placeholder.com/400x600?text=MFLIX";

export const TAB_CONFIG = [
  { id: "home", label: "Home", hint: "Everything" },
  { id: "movies", label: "Movies", hint: "Films" },
  { id: "tvshow", label: "Series", hint: "TV & Web" },
  { id: "anime", label: "Anime", hint: "Animation" },
  { id: "adult", label: "18+", hint: "Restricted" }
];

export const SEARCH_FIELDS = [
  "title",
  "cast",
  "director",
  "genre",
  "industry",
  "keywords",
  "platform",
  "quality_name",
  "spoken_languages",
  "writer",
  "year",
  "category",
  "description",
  "overview"
];

export const ACCENT_OPTIONS = [
  { name: "Crimson", value: "#e50914" },
  { name: "Royal Blue", value: "#2b59ff" },
  { name: "Purple", value: "#7c4dff" },
  { name: "Emerald", value: "#00b894" },
  { name: "Amber", value: "#ff9f1a" }
];

export const STORAGE_KEYS = {
  WATCHLIST: "mflix_watchlist_v2",
  LIKED: "mflix_liked_v2",
  RECENTS: "mflix_recent_search_v2",
  HISTORY: "mflix_watch_history_v2",
  SETTINGS: "mflix_ui_settings_v2",
  PLAYBACK: "mflix_playback_state_v2",
  AGE_GATE: "mflix_age_gate_passed_v2"
};
