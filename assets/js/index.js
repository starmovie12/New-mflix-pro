import { get, ref } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import {
  ACCENT_OPTIONS,
  FALLBACK_POSTER,
  SEARCH_FIELDS,
  STORAGE_KEYS,
  TAB_CONFIG,
  db
} from "./config.js";
import { readJSON, updateSetStorage, writeJSON } from "./storage.js";
import {
  asNumber,
  byRatingDesc,
  clamp,
  createToastManager,
  debounce,
  escapeHtml,
  formatCompactNumber,
  formatDuration,
  normalizeCategory,
  parseYear,
  randomPick,
  throttle,
  toArray,
  toLower,
  updateQueryParams
} from "./utils.js";

const TAB_IDS = TAB_CONFIG.map((tab) => tab.id);
const PAGE_SIZE = 24;
const MIN_SEARCH_CHARS = 1;
const TODAY_YEAR = new Date().getFullYear();

const els = {
  networkBanner: document.getElementById("networkBanner"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  voiceSearchBtn: document.getElementById("voiceSearchBtn"),
  searchGoBtn: document.getElementById("searchGoBtn"),
  suggestionBox: document.getElementById("suggestionBox"),
  sortSelect: document.getElementById("sortSelect"),
  tabRail: document.getElementById("tabRail"),
  quickChips: [...document.querySelectorAll(".quick-chip")],
  openFilterBtn: document.getElementById("openFilterBtn"),
  filterDrawer: document.getElementById("filterDrawer"),
  backdropMask: document.getElementById("backdropMask"),
  applyFiltersBtn: document.getElementById("applyFiltersBtn"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  genreFilters: document.getElementById("genreFilters"),
  languageFilters: document.getElementById("languageFilters"),
  qualityFilters: document.getElementById("qualityFilters"),
  accentFilters: document.getElementById("accentFilters"),
  yearMinInput: document.getElementById("yearMinInput"),
  yearMaxInput: document.getElementById("yearMaxInput"),
  ratingMinInput: document.getElementById("ratingMinInput"),
  hdOnlyToggle: document.getElementById("hdOnlyToggle"),
  hideWatchedToggle: document.getElementById("hideWatchedToggle"),
  heroBanner: document.getElementById("heroBanner"),
  heroTypeChip: document.getElementById("heroTypeChip"),
  heroTitle: document.getElementById("heroTitle"),
  heroMeta: document.getElementById("heroMeta"),
  heroDescription: document.getElementById("heroDescription"),
  heroPlayBtn: document.getElementById("heroPlayBtn"),
  heroWatchlistBtn: document.getElementById("heroWatchlistBtn"),
  heroStats: document.getElementById("heroStats"),
  kpiTotal: document.getElementById("kpiTotal"),
  kpiMovies: document.getElementById("kpiMovies"),
  kpiSeries: document.getElementById("kpiSeries"),
  kpiRating: document.getElementById("kpiRating"),
  continueSection: document.getElementById("continueSection"),
  continueRail: document.getElementById("continueRail"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  watchlistRail: document.getElementById("watchlistRail"),
  watchlistCount: document.getElementById("watchlistCount"),
  randomPlayBtn: document.getElementById("randomPlayBtn"),
  backToTopBtn: document.getElementById("backToTopBtn"),
  installBtnTop: document.getElementById("installBtnTop"),
  installBtnBottom: document.getElementById("installBtnBottom"),
  shortcutsBtn: document.getElementById("shortcutsBtn"),
  shortcutsModal: document.getElementById("shortcutsModal"),
  closeShortcutsBtn: document.getElementById("closeShortcutsBtn"),
  ageGateModal: document.getElementById("ageGateModal"),
  ageNoBtn: document.getElementById("ageNoBtn"),
  ageYesBtn: document.getElementById("ageYesBtn"),
  accentBtn: document.getElementById("accentBtn"),
  refreshBtns: [...document.querySelectorAll("[data-refresh]")]
};

const notify = createToastManager();
const watchlistSeed = readJSON(STORAGE_KEYS.WATCHLIST, []);
const likedSeed = readJSON(STORAGE_KEYS.LIKED, []);
const recentsSeed = readJSON(STORAGE_KEYS.RECENTS, []);
const historySeed = readJSON(STORAGE_KEYS.HISTORY, []);

const state = {
  allItems: [],
  byId: new Map(),
  currentTab: "home",
  searchTerm: "",
  sortBy: "smart",
  quickPreset: "all",
  dynamicYearMin: 1980,
  dynamicYearMax: TODAY_YEAR,
  visibleByTab: Object.fromEntries(TAB_IDS.map((id) => [id, PAGE_SIZE])),
  filteredCache: Object.fromEntries(TAB_IDS.map((id) => [id, []])),
  filters: {
    genres: new Set(),
    languages: new Set(),
    qualities: new Set(),
    yearMin: 1980,
    yearMax: TODAY_YEAR,
    ratingMin: 0,
    hdOnly: false,
    hideWatched: false
  },
  watchlist: new Set((Array.isArray(watchlistSeed) ? watchlistSeed : []).map(String)),
  liked: new Set((Array.isArray(likedSeed) ? likedSeed : []).map(String)),
  recents: Array.isArray(recentsSeed) ? recentsSeed : [],
  history: Array.isArray(historySeed) ? historySeed : [],
  ageGatePassed: Boolean(readJSON(STORAGE_KEYS.AGE_GATE, false)),
  settings: readJSON(STORAGE_KEYS.SETTINGS, {
    accent: ACCENT_OPTIONS[0].value
  }),
  suggestionIndex: -1,
  deferredPrompt: null,
  pendingAdultSwitch: false
};

const domCache = {
  panels: Object.fromEntries(TAB_IDS.map((id) => [id, document.getElementById(`panel-${id}`)])),
  grids: Object.fromEntries(TAB_IDS.map((id) => [id, document.getElementById(`grid-${id}`)])),
  empty: Object.fromEntries(TAB_IDS.map((id) => [id, document.getElementById(`empty-${id}`)])),
  loading: Object.fromEntries(TAB_IDS.map((id) => [id, document.getElementById(`loading-${id}`)])),
  info: Object.fromEntries(TAB_IDS.map((id) => [id, document.getElementById(`gridInfo-${id}`)]))
};

function normalizeItem(raw, key) {
  const fallbackId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `mflix-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const databaseKey = String(key || raw.movie_id || raw.id || fallbackId);
  const sourceId = String(raw.movie_id || raw.id || databaseKey);
  const title = String(raw.title || raw.original_title || "Untitled");
  const poster = String(raw.poster || raw.image || FALLBACK_POSTER);
  const rating = asNumber(raw.rating, 0);
  const year = parseYear(raw.year || raw.release_year || raw.released || TODAY_YEAR);
  const quality = String(raw.quality_name || raw.quality || "HD");
  const tabCategory = normalizeCategory(raw);
  const adult = raw.adult_content === true || raw.adult_content === "true";
  const languageList = toArray(raw.spoken_languages || raw.original_language || raw.language || "Dub")
    .map((lang) => lang.trim())
    .filter(Boolean);
  const genreList = toArray(raw.genre || raw.genres || raw.tags || "Drama")
    .map((genre) => genre.trim())
    .filter(Boolean);
  const castList = toArray(raw.cast)
    .map((member) => member.trim())
    .filter(Boolean);
  const director = String(raw.director || "Unknown");
  const runtimeMinutes = asNumber(raw.runtime || raw.duration || raw.movie_runtime, 0);
  const description = String(raw.description || raw.overview || "No synopsis available.");
  const platform = String(raw.platform || raw.stream_platform || "MFLIX");
  const popularity = asNumber(raw.views || raw.popularity || raw.vote_count, 0);
  const country = String(raw.country || raw.industry || "");

  const searchBlob = SEARCH_FIELDS.map((field) => String(raw[field] ?? ""))
    .concat([title, ...genreList, ...castList, ...languageList, director, platform, country])
    .join(" ")
    .toLowerCase();

  return {
    id: databaseKey,
    sourceId,
    databaseKey,
    movieId: databaseKey,
    title,
    poster,
    rating,
    year,
    quality,
    tabCategory,
    adult,
    languageList,
    genreList,
    castList,
    director,
    runtimeMinutes,
    description,
    platform,
    popularity,
    country,
    raw,
    searchBlob
  };
}

function setOnlineState() {
  const online = navigator.onLine;
  els.networkBanner.classList.toggle("show", !online);
  els.statusDot.classList.toggle("offline", !online);
  els.statusText.textContent = online ? "Online" : "Offline";
}

function applyAccent(value) {
  document.documentElement.style.setProperty("--accent", value);
  state.settings.accent = value;
  writeJSON(STORAGE_KEYS.SETTINGS, state.settings);
  els.accentFilters.querySelectorAll("[data-accent]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.accent === value);
  });
}

function cycleAccent() {
  const idx = ACCENT_OPTIONS.findIndex((entry) => entry.value === state.settings.accent);
  const next = ACCENT_OPTIONS[(idx + 1) % ACCENT_OPTIONS.length];
  applyAccent(next.value);
  notify(`Accent switched to ${next.name}`, "success");
}

function getHistoryMap() {
  return new Map(state.history.map((item) => [String(item.id), item]));
}

function tabItems(tabId) {
  if (tabId === "home") {
    if (state.ageGatePassed) return state.allItems;
    return state.allItems.filter((item) => !item.adult);
  }
  if (tabId === "movies") return state.allItems.filter((item) => item.tabCategory === "movies" && !item.adult);
  if (tabId === "tvshow") return state.allItems.filter((item) => item.tabCategory === "tvshow");
  if (tabId === "anime") return state.allItems.filter((item) => item.tabCategory === "anime");
  if (tabId === "adult") return state.allItems.filter((item) => item.adult || item.tabCategory === "adult");
  return state.allItems;
}

function applyQuickPreset(items) {
  const preset = state.quickPreset;
  const historyMap = getHistoryMap();
  if (preset === "all") return [...items];
  if (preset === "top-rated") return items.filter((item) => item.rating >= 7.5).sort(byRatingDesc);
  if (preset === "latest") return items.filter((item) => asNumber(item.year) >= TODAY_YEAR - 1);
  if (preset === "hindi") return items.filter((item) => item.languageList.some((lang) => toLower(lang).includes("hindi")));
  if (preset === "dubbed") return items.filter((item) => item.searchBlob.includes("dub"));
  if (preset === "uhd") return items.filter((item) => /4k|uhd|2160/.test(toLower(item.quality)));
  if (preset === "watchlist") return items.filter((item) => state.watchlist.has(item.id));
  if (preset === "continue") {
    return items.filter((item) => {
      const record = historyMap.get(item.id);
      if (!record) return false;
      return asNumber(record.progress) > 2 && asNumber(record.progress) < 98;
    });
  }
  return [...items];
}

function applyAdvancedFilters(items) {
  const f = state.filters;
  const historyMap = getHistoryMap();
  return items.filter((item) => {
    const y = asNumber(item.year, TODAY_YEAR);
    if (y < f.yearMin || y > f.yearMax) return false;
    if (item.rating < f.ratingMin) return false;
    if (f.hdOnly && !/hd|4k|uhd|1080|2160/.test(toLower(item.quality))) return false;
    if (f.genres.size > 0 && !item.genreList.some((genre) => f.genres.has(genre.toLowerCase()))) return false;
    if (f.languages.size > 0 && !item.languageList.some((lang) => f.languages.has(lang.toLowerCase()))) return false;
    if (f.qualities.size > 0 && !f.qualities.has(item.quality.toLowerCase())) return false;
    if (f.hideWatched) {
      const record = historyMap.get(item.id);
      if (record && asNumber(record.progress) >= 95) return false;
    }
    return true;
  });
}

function applySearch(items) {
  if (!state.searchTerm || state.searchTerm.length < MIN_SEARCH_CHARS) return items;
  const query = state.searchTerm;
  return items.filter((item) => item.searchBlob.includes(query));
}

function sortItems(items) {
  const sort = state.sortBy;
  const copy = [...items];
  if (sort === "rating") return copy.sort(byRatingDesc);
  if (sort === "newest") return copy.sort((a, b) => asNumber(b.year) - asNumber(a.year));
  if (sort === "oldest") return copy.sort((a, b) => asNumber(a.year) - asNumber(b.year));
  if (sort === "az") return copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy.sort((a, b) => {
    const scoreA = a.rating * 3 + asNumber(a.popularity, 0) * 0.001 + asNumber(a.year, 2000) * 0.3;
    const scoreB = b.rating * 3 + asNumber(b.popularity, 0) * 0.001 + asNumber(b.year, 2000) * 0.3;
    return scoreB - scoreA;
  });
}

function getFilteredByTab(tabId) {
  const base = tabItems(tabId);
  const preset = applyQuickPreset(base);
  const searched = applySearch(preset);
  const filtered = applyAdvancedFilters(searched);
  return sortItems(filtered);
}

function saveRecentSearch(term) {
  const clean = term.trim();
  if (!clean) return;
  const updated = state.recents.filter((entry) => entry !== clean);
  updated.unshift(clean);
  state.recents = updated.slice(0, 12);
  writeJSON(STORAGE_KEYS.RECENTS, state.recents);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSuggestionMarkup(query) {
  const q = query.trim().toLowerCase();
  let rows = [];
  if (!q) {
    rows = state.recents.map((term) => ({ label: term, meta: "Recent search", id: "" }));
  } else {
    const matcher = new RegExp(escapeRegex(q), "i");
    rows = state.allItems
      .filter((item) => matcher.test(item.title) || item.searchBlob.includes(q))
      .slice(0, 8)
      .map((item) => ({
        label: item.title,
        meta: `${item.year} • ${item.quality} • ${item.languageList[0] || "NA"}`,
        id: item.id
      }));
  }

  if (rows.length === 0) {
    els.suggestionBox.innerHTML = `<div class="suggestion-row"><span>No suggestions</span></div>`;
    return;
  }

  els.suggestionBox.innerHTML = rows
    .map(
      (row, idx) => `
      <button class="suggestion-row ${idx === state.suggestionIndex ? "active" : ""}" data-value="${escapeHtml(
        row.label
      )}" data-id="${escapeHtml(row.id || "")}">
        <span>${escapeHtml(row.label)}</span>
        <span class="suggestion-meta">${escapeHtml(row.meta)}</span>
      </button>
    `
    )
    .join("");
}

function setSuggestionVisible(visible) {
  els.suggestionBox.classList.toggle("show", visible);
  if (!visible) state.suggestionIndex = -1;
}

function openPlayer(item) {
  if (!item) return;
  const type = item.tabCategory === "tvshow" ? "tv" : "movie";
  const id = item.databaseKey || item.movieId || item.id;
  window.location.href = `/video-player.html?id=${encodeURIComponent(id)}&type=${type}&source=firebase`;
}

function heroMetaPills(item) {
  const lang = item.languageList[0] || "Dub";
  return [
    `<span class="chip"><i class="fa-solid fa-star" aria-hidden="true"></i> ${item.rating.toFixed(1)}</span>`,
    `<span class="chip"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i> ${item.year}</span>`,
    `<span class="chip"><i class="fa-solid fa-video" aria-hidden="true"></i> ${escapeHtml(item.quality)}</span>`,
    `<span class="chip"><i class="fa-solid fa-language" aria-hidden="true"></i> ${escapeHtml(lang)}</span>`
  ].join("");
}

function updateHero(filteredItems) {
  const source = filteredItems.length > 0 ? filteredItems : state.allItems;
  const spotlight = source[0] || null;
  if (!spotlight) {
    els.heroTitle.textContent = "No spotlight content available";
    return;
  }

  els.heroBanner.style.setProperty("--hero-bg", `url('${spotlight.poster}')`);
  els.heroTypeChip.textContent =
    spotlight.tabCategory === "tvshow"
      ? "Featured Series"
      : spotlight.tabCategory === "anime"
        ? "Featured Anime"
        : "Featured Movie";
  els.heroTitle.textContent = spotlight.title;
  els.heroMeta.innerHTML = heroMetaPills(spotlight);
  els.heroDescription.textContent = spotlight.description;
  els.heroPlayBtn.dataset.id = spotlight.id;
  els.heroWatchlistBtn.dataset.id = spotlight.id;
  els.heroWatchlistBtn.innerHTML = state.watchlist.has(spotlight.id)
    ? '<i class="fa-solid fa-circle-check"></i> Added to My List'
    : '<i class="fa-solid fa-bookmark"></i> Save to My List';

  const totalWatchlisted = state.watchlist.size;
  const watchedCount = state.history.filter((entry) => asNumber(entry.progress) >= 95).length;
  const currentCount = filteredItems.length;
  els.heroStats.innerHTML = `
    <span class="status-pill">${formatCompactNumber(currentCount)} in this view</span>
    <span class="status-pill">${totalWatchlisted} in My List</span>
    <span class="status-pill">${watchedCount} completed</span>
  `;
}

function getHistoryProgress(itemId) {
  const historyMap = getHistoryMap();
  const record = historyMap.get(String(itemId));
  return record ? clamp(asNumber(record.progress), 0, 100) : 0;
}

function movieCardTemplate(item) {
  const progress = getHistoryProgress(item.id);
  const lang = item.languageList[0] || "DUB";
  const bookmarked = state.watchlist.has(item.id);
  const liked = state.liked.has(item.id);

  return `
    <article class="movie-card" data-id="${escapeHtml(item.id)}" role="button" aria-label="Watch ${escapeHtml(item.title)}">
      <div class="poster-wrap">
        <img
          src="${escapeHtml(item.poster)}"
          loading="lazy"
          decoding="async"
          alt="Watch ${escapeHtml(item.title)} (${escapeHtml(String(item.year))})"
          data-fallback="poster"
        />
        <div class="card-top-row">
          <span class="tag tag-red">${escapeHtml(lang.toUpperCase().slice(0, 8))}</span>
          <span class="tag tag-dark">${escapeHtml(item.quality)}</span>
        </div>
        <div class="card-grad"></div>
        <div class="card-actions">
          <button aria-label="Toggle watchlist" data-action="watchlist" data-id="${escapeHtml(item.id)}">
            <i class="${bookmarked ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
          </button>
          <button aria-label="Like title" data-action="like" data-id="${escapeHtml(item.id)}">
            <i class="${liked ? "fa-solid" : "fa-regular"} fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="card-title-row">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <span class="card-year">${escapeHtml(String(item.year))}</span>
        </div>
        <div class="card-meta">
          <span><i class="fa-solid fa-star" style="color:#ffcc42"></i> ${item.rating.toFixed(1)}</span>
          <span>${escapeHtml(formatDuration(item.runtimeMinutes))}</span>
        </div>
        <div class="progress-row ${progress > 1 ? "" : "hidden"}">
          <span style="width:${progress}%"></span>
        </div>
      </div>
    </article>
  `;
}

function railCardTemplate(item, progress = 0) {
  return `
    <button class="rail-card" data-rail-id="${escapeHtml(item.id)}" aria-label="Open ${escapeHtml(item.title)}">
      <img src="${escapeHtml(item.poster)}" loading="lazy" alt="${escapeHtml(item.title)}" data-fallback="poster" />
      <div class="rail-card-caption">
        <strong>${escapeHtml(item.title)}</strong>
        <div>${escapeHtml(String(item.year))} • ${escapeHtml(item.quality)}</div>
        ${
          progress > 1
            ? `<div class="progress-row" style="margin-top:6px"><span style="width:${progress}%"></span></div>`
            : ""
        }
      </div>
    </button>
  `;
}

function renderTab(tabId, { preserveCache = false } = {}) {
  if (!preserveCache) {
    state.filteredCache[tabId] = getFilteredByTab(tabId);
  }
  const filtered = state.filteredCache[tabId];
  const visible = state.visibleByTab[tabId];
  const grid = domCache.grids[tabId];
  const empty = domCache.empty[tabId];
  const loading = domCache.loading[tabId];
  const info = domCache.info[tabId];
  if (!grid || !empty || !loading || !info) return;

  info.textContent = `${filtered.length.toLocaleString()} results`;
  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    loading.classList.remove("show");
    return;
  }

  empty.classList.add("hidden");
  const shown = filtered.slice(0, visible);
  grid.innerHTML = shown.map(movieCardTemplate).join("");
  loading.classList.toggle("show", shown.length < filtered.length);

  if (tabId === state.currentTab) updateHero(filtered);
}

function updateMeta() {
  const tabLabel = TAB_CONFIG.find((tab) => tab.id === state.currentTab)?.label || "Home";
  const baseTitle = `MFLIX - ${tabLabel} Streaming`;
  const searchSuffix = state.searchTerm ? ` | Search: ${state.searchTerm}` : "";
  document.title = `${baseTitle}${searchSuffix}`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    const desc = state.searchTerm
      ? `Watch ${tabLabel} results for "${state.searchTerm}" on MFLIX in HD quality.`
      : `Discover latest ${tabLabel} content on MFLIX with smart filters, watchlist and fast playback.`;
    metaDesc.setAttribute("content", desc);
  }
}

function renderContinueRail() {
  const historyMap = getHistoryMap();
  const list = state.history
    .map((record) => {
      const item = state.byId.get(String(record.id));
      if (!item) return null;
      return { item, record };
    })
    .filter(Boolean)
    .slice(0, 18);

  if (list.length === 0) {
    els.continueRail.innerHTML =
      '<div class="empty-state" style="margin:0;width:100%">Start watching something to build Continue Watching.</div>';
    return;
  }

  els.continueRail.innerHTML = list
    .map(({ item, record }) => railCardTemplate(item, clamp(asNumber(record.progress), 0, 100)))
    .join("");
  els.continueSection.classList.toggle("hidden", false);
}

function renderWatchlistRail() {
  const list = [...state.watchlist]
    .map((id) => state.byId.get(String(id)))
    .filter(Boolean)
    .slice(0, 20);
  els.watchlistCount.textContent = `${list.length} saved`;

  if (list.length === 0) {
    els.watchlistRail.innerHTML = '<div class="empty-state" style="margin:0;width:100%">Nothing saved yet.</div>';
    return;
  }
  els.watchlistRail.innerHTML = list.map((item) => railCardTemplate(item, getHistoryProgress(item.id))).join("");
}

function renderKPIs() {
  const total = state.allItems.length;
  const movieCount = state.allItems.filter((item) => item.tabCategory === "movies" && !item.adult).length;
  const seriesCount = state.allItems.filter((item) => item.tabCategory === "tvshow").length;
  const avgRating = total
    ? (state.allItems.reduce((sum, item) => sum + asNumber(item.rating), 0) / total).toFixed(1)
    : "0.0";
  els.kpiTotal.textContent = total.toLocaleString();
  els.kpiMovies.textContent = movieCount.toLocaleString();
  els.kpiSeries.textContent = seriesCount.toLocaleString();
  els.kpiRating.textContent = avgRating;
}

function renderCurrentTab(force = true) {
  renderTab(state.currentTab, { preserveCache: !force });
  updateMeta();
}

function switchTab(nextTab, fromKeyboard = false) {
  if (!TAB_IDS.includes(nextTab)) return;
  if (nextTab === "adult" && !state.ageGatePassed) {
    state.pendingAdultSwitch = true;
    els.ageGateModal.classList.add("open");
    return;
  }

  state.currentTab = nextTab;
  TAB_IDS.forEach((tabId) => {
    domCache.panels[tabId]?.classList.toggle("active", tabId === nextTab);
  });
  els.tabRail.querySelectorAll("[data-tab]").forEach((btn) => {
    const active = btn.dataset.tab === nextTab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
    if (active && !fromKeyboard) btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  });
  renderCurrentTab();
  updateQueryParams({
    tab: nextTab !== "home" ? nextTab : "",
    q: state.searchTerm || "",
    sort: state.sortBy !== "smart" ? state.sortBy : "",
    preset: state.quickPreset !== "all" ? state.quickPreset : ""
  });
}

function highlightPreset(preset) {
  els.quickChips.forEach((btn) => {
    const active = btn.dataset.preset === preset;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function applyPreset(preset) {
  if (preset === "random") {
    const source = getFilteredByTab(state.currentTab);
    const pick = randomPick(source);
    if (pick) openPlayer(pick);
    return;
  }
  state.quickPreset = preset;
  highlightPreset(preset);
  state.visibleByTab[state.currentTab] = PAGE_SIZE;
  renderCurrentTab(true);
  updateQueryParams({
    preset: state.quickPreset !== "all" ? state.quickPreset : ""
  });
}

function renderSkeleton() {
  TAB_IDS.forEach((tabId) => {
    const grid = domCache.grids[tabId];
    if (!grid) return;
    const placeholder = Array.from({ length: 12 }, () => {
      return `
      <article class="movie-card">
        <div class="poster-wrap skeleton"></div>
        <div class="card-content">
          <div class="skeleton" style="height:12px;border-radius:7px"></div>
          <div class="skeleton" style="height:10px;border-radius:7px;margin-top:7px"></div>
        </div>
      </article>`;
    }).join("");
    grid.innerHTML = placeholder;
  });
}

function parseFilterInputs() {
  const selected = (selector) =>
    new Set(
      [...els.filterDrawer.querySelectorAll(selector)]
        .filter((node) => node.classList.contains("active"))
        .map((node) => node.dataset.value.toLowerCase())
    );

  state.filters.genres = selected('[data-group="genre"]');
  state.filters.languages = selected('[data-group="language"]');
  state.filters.qualities = selected('[data-group="quality"]');
  state.filters.yearMin = clamp(asNumber(els.yearMinInput.value, state.dynamicYearMin), 1900, 2100);
  state.filters.yearMax = clamp(asNumber(els.yearMaxInput.value, state.dynamicYearMax), 1900, 2100);
  if (state.filters.yearMin > state.filters.yearMax) {
    [state.filters.yearMin, state.filters.yearMax] = [state.filters.yearMax, state.filters.yearMin];
  }
  state.filters.ratingMin = clamp(asNumber(els.ratingMinInput.value, 0), 0, 10);
  state.filters.hdOnly = Boolean(els.hdOnlyToggle.checked);
  state.filters.hideWatched = Boolean(els.hideWatchedToggle.checked);
}

function resetFilters() {
  state.filters = {
    genres: new Set(),
    languages: new Set(),
    qualities: new Set(),
    yearMin: state.dynamicYearMin,
    yearMax: state.dynamicYearMax,
    ratingMin: 0,
    hdOnly: false,
    hideWatched: false
  };

  els.filterDrawer.querySelectorAll(".filter-chip").forEach((btn) => btn.classList.remove("active"));
  els.yearMinInput.value = String(state.dynamicYearMin);
  els.yearMaxInput.value = String(state.dynamicYearMax);
  els.ratingMinInput.value = "0";
  els.hdOnlyToggle.checked = false;
  els.hideWatchedToggle.checked = false;
}

function openFilterDrawer() {
  els.filterDrawer.classList.add("open");
  els.backdropMask.classList.add("open");
}

function closeFilterDrawer() {
  els.filterDrawer.classList.remove("open");
  els.backdropMask.classList.remove("open");
}

function populateFilterOptions() {
  const genreMap = new Map();
  const languageMap = new Map();
  const qualityMap = new Map();

  state.allItems.forEach((item) => {
    item.genreList.forEach((genre) => {
      const key = genre.trim();
      if (!key) return;
      genreMap.set(key, (genreMap.get(key) || 0) + 1);
    });
    item.languageList.forEach((lang) => {
      const key = lang.trim();
      if (!key) return;
      languageMap.set(key, (languageMap.get(key) || 0) + 1);
    });
    qualityMap.set(item.quality, (qualityMap.get(item.quality) || 0) + 1);
  });

  const topGenre = [...genreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([name]) => name);
  const topLang = [...languageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name]) => name);
  const topQuality = [...qualityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const renderChips = (items, groupName) =>
    items
      .map(
        (name) =>
          `<button class="chip filter-chip" data-group="${groupName}" data-value="${escapeHtml(name)}">${escapeHtml(
            name
          )}</button>`
      )
      .join("");

  els.genreFilters.innerHTML = renderChips(topGenre, "genre");
  els.languageFilters.innerHTML = renderChips(topLang, "language");
  els.qualityFilters.innerHTML = renderChips(topQuality, "quality");

  els.accentFilters.innerHTML = ACCENT_OPTIONS.map(
    (item) =>
      `<button class="chip ${item.value === state.settings.accent ? "active" : ""}" data-accent="${
        item.value
      }"><i class="fa-solid fa-circle" style="color:${item.value}"></i> ${item.name}</button>`
  ).join("");

  const years = state.allItems.map((item) => asNumber(item.year, TODAY_YEAR)).filter(Boolean);
  state.dynamicYearMin = years.length ? Math.max(1900, Math.min(...years)) : 1980;
  state.dynamicYearMax = years.length ? Math.min(2100, Math.max(...years)) : TODAY_YEAR;
  resetFilters();
}

function refreshRails() {
  renderContinueRail();
  renderWatchlistRail();
}

function handleCardAction(action, id) {
  if (!id) return;
  if (action === "watchlist") {
    const nextState = !state.watchlist.has(id);
    state.watchlist = new Set([...updateSetStorage(STORAGE_KEYS.WATCHLIST, id, nextState)].map(String));
    notify(nextState ? "Added to watchlist" : "Removed from watchlist", "success");
    renderCurrentTab(true);
    refreshRails();
    return;
  }
  if (action === "like") {
    const nextState = !state.liked.has(id);
    state.liked = new Set([...updateSetStorage(STORAGE_KEYS.LIKED, id, nextState)].map(String));
    notify(nextState ? "Marked as liked" : "Like removed", "success");
    renderCurrentTab(true);
  }
}

function loadMoreIfNeeded() {
  const currentFiltered = state.filteredCache[state.currentTab] || [];
  const currentVisible = state.visibleByTab[state.currentTab];
  const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 720;
  if (nearBottom && currentVisible < currentFiltered.length) {
    state.visibleByTab[state.currentTab] += PAGE_SIZE;
    renderTab(state.currentTab, { preserveCache: true });
  }
}

function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && TAB_IDS.includes(tab)) {
    if (tab === "adult" && !state.ageGatePassed) state.currentTab = "home";
    else state.currentTab = tab;
  }

  const q = params.get("q");
  if (q) state.searchTerm = q.trim().toLowerCase();

  const sort = params.get("sort");
  if (sort && ["smart", "rating", "newest", "oldest", "az"].includes(sort)) {
    state.sortBy = sort;
  }
  const preset = params.get("preset");
  if (preset && ["all", "top-rated", "latest", "hindi", "dubbed", "uhd", "watchlist", "continue"].includes(preset)) {
    state.quickPreset = preset;
  }
}

function mountInstallHandlers() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    els.installBtnTop.classList.remove("hidden");
    els.installBtnBottom.classList.remove("hidden");
  });

  const handleInstall = async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    els.installBtnTop.classList.add("hidden");
    els.installBtnBottom.classList.add("hidden");
  };

  els.installBtnTop.addEventListener("click", handleInstall);
  els.installBtnBottom.addEventListener("click", handleInstall);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
  });
}

function syncSearchFromInput() {
  state.searchTerm = els.searchInput.value.trim().toLowerCase();
  state.visibleByTab[state.currentTab] = PAGE_SIZE;
  renderCurrentTab(true);
  updateQueryParams({
    q: state.searchTerm || ""
  });
}

const debouncedSearch = debounce(syncSearchFromInput, 220);

function mountEvents() {
  window.addEventListener("online", setOnlineState);
  window.addEventListener("offline", setOnlineState);
  setOnlineState();

  els.searchInput.addEventListener("focus", () => {
    state.suggestionIndex = -1;
    buildSuggestionMarkup(els.searchInput.value);
    setSuggestionVisible(true);
  });

  els.searchInput.addEventListener("input", () => {
    state.suggestionIndex = -1;
    buildSuggestionMarkup(els.searchInput.value);
    setSuggestionVisible(true);
    debouncedSearch();
  });

  els.searchInput.addEventListener("keydown", (event) => {
    const rows = [...els.suggestionBox.querySelectorAll(".suggestion-row")];
    if (event.key === "ArrowDown") {
      event.preventDefault();
      state.suggestionIndex = clamp(state.suggestionIndex + 1, 0, rows.length - 1);
      buildSuggestionMarkup(els.searchInput.value);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      state.suggestionIndex = clamp(state.suggestionIndex - 1, 0, rows.length - 1);
      buildSuggestionMarkup(els.searchInput.value);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (state.suggestionIndex >= 0 && rows[state.suggestionIndex]) {
        rows[state.suggestionIndex].click();
        return;
      }
      saveRecentSearch(els.searchInput.value);
      syncSearchFromInput();
      setSuggestionVisible(false);
    }
    if (event.key === "Escape") {
      setSuggestionVisible(false);
    }
  });

  els.searchGoBtn.addEventListener("click", () => {
    saveRecentSearch(els.searchInput.value);
    syncSearchFromInput();
    setSuggestionVisible(false);
  });

  els.clearSearchBtn.addEventListener("click", () => {
    els.searchInput.value = "";
    state.searchTerm = "";
    setSuggestionVisible(false);
    renderCurrentTab(true);
    updateQueryParams({ q: "" });
  });

  els.voiceSearchBtn.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify("Voice search not supported on this browser", "warn");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    els.voiceSearchBtn.innerHTML = '<i class="fa-solid fa-wave-square"></i>';
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      els.searchInput.value = text;
      syncSearchFromInput();
      saveRecentSearch(text);
    };
    recognition.onerror = () => notify("Voice search failed, try again", "error");
    recognition.onend = () => {
      els.voiceSearchBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    };
  });

  document.addEventListener("click", (event) => {
    const suggestionBtn = event.target.closest(".suggestion-row");
    if (suggestionBtn) {
      const value = suggestionBtn.dataset.value || "";
      const id = suggestionBtn.dataset.id || "";
      els.searchInput.value = value;
      saveRecentSearch(value);
      syncSearchFromInput();
      setSuggestionVisible(false);
      if (id) {
        const item = state.byId.get(id);
        if (item && state.searchTerm === "") openPlayer(item);
      }
      return;
    }

    const tabBtn = event.target.closest("[data-tab]");
    if (tabBtn) {
      switchTab(tabBtn.dataset.tab);
      return;
    }

    const quickChip = event.target.closest(".quick-chip");
    if (quickChip) {
      applyPreset(quickChip.dataset.preset);
      return;
    }

    const cardAction = event.target.closest("[data-action]");
    if (cardAction) {
      event.stopPropagation();
      handleCardAction(cardAction.dataset.action, cardAction.dataset.id);
      return;
    }

    const card = event.target.closest(".movie-card");
    if (card) {
      const item = state.byId.get(card.dataset.id);
      openPlayer(item);
      return;
    }

    const rail = event.target.closest("[data-rail-id]");
    if (rail) {
      const item = state.byId.get(rail.dataset.railId);
      openPlayer(item);
      return;
    }

    const filterChip = event.target.closest(".filter-chip");
    if (filterChip) {
      filterChip.classList.toggle("active");
      return;
    }

    const accentChip = event.target.closest("[data-accent]");
    if (accentChip) {
      applyAccent(accentChip.dataset.accent);
      return;
    }

    if (!event.target.closest(".search-wrap")) {
      setSuggestionVisible(false);
    }
  });

  els.sortSelect.addEventListener("change", () => {
    state.sortBy = els.sortSelect.value;
    renderCurrentTab(true);
    updateQueryParams({ sort: state.sortBy !== "smart" ? state.sortBy : "" });
  });

  els.openFilterBtn.addEventListener("click", openFilterDrawer);
  els.backdropMask.addEventListener("click", closeFilterDrawer);
  els.applyFiltersBtn.addEventListener("click", () => {
    parseFilterInputs();
    closeFilterDrawer();
    state.visibleByTab[state.currentTab] = PAGE_SIZE;
    renderCurrentTab(true);
    notify("Filters applied", "success");
  });
  els.resetFiltersBtn.addEventListener("click", () => {
    resetFilters();
    renderCurrentTab(true);
  });

  els.heroPlayBtn.addEventListener("click", () => {
    const item = state.byId.get(els.heroPlayBtn.dataset.id || "");
    openPlayer(item);
  });
  els.heroWatchlistBtn.addEventListener("click", () => {
    const id = els.heroWatchlistBtn.dataset.id || "";
    handleCardAction("watchlist", id);
  });

  els.clearHistoryBtn.addEventListener("click", () => {
    state.history = [];
    writeJSON(STORAGE_KEYS.HISTORY, state.history);
    renderContinueRail();
    renderCurrentTab(true);
    notify("Watch history cleared", "warn");
  });

  els.randomPlayBtn.addEventListener("click", () => {
    const source = state.filteredCache[state.currentTab] || [];
    const item = randomPick(source);
    if (item) openPlayer(item);
  });

  els.backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  els.shortcutsBtn.addEventListener("click", () => els.shortcutsModal.classList.add("open"));
  els.closeShortcutsBtn.addEventListener("click", () => els.shortcutsModal.classList.remove("open"));

  els.ageNoBtn.addEventListener("click", () => {
    state.pendingAdultSwitch = false;
    els.ageGateModal.classList.remove("open");
  });
  els.ageYesBtn.addEventListener("click", () => {
    state.ageGatePassed = true;
    writeJSON(STORAGE_KEYS.AGE_GATE, true);
    els.ageGateModal.classList.remove("open");
    if (state.pendingAdultSwitch) {
      state.pendingAdultSwitch = false;
      switchTab("adult");
    }
  });

  els.accentBtn.addEventListener("click", cycleAccent);

  els.refreshBtns.forEach((button) =>
    button.addEventListener("click", () => {
      const tab = button.dataset.refresh;
      if (!tab) return;
      renderTab(tab);
      notify(`Refreshed ${tab}`, "success", 1200);
    })
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "/") {
      event.preventDefault();
      els.searchInput.focus();
      return;
    }
    if (event.key === "Escape") {
      closeFilterDrawer();
      els.shortcutsModal.classList.remove("open");
      els.ageGateModal.classList.remove("open");
      setSuggestionVisible(false);
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openFilterDrawer();
      return;
    }
    if (event.shiftKey && event.key.toLowerCase() === "r") {
      event.preventDefault();
      const source = state.filteredCache[state.currentTab] || [];
      const item = randomPick(source);
      if (item) openPlayer(item);
      return;
    }
    if (["1", "2", "3", "4", "5"].includes(event.key)) {
      const idx = Number(event.key) - 1;
      const tab = TAB_IDS[idx];
      if (tab) switchTab(tab, true);
    }
  });

  window.addEventListener(
    "scroll",
    throttle(() => {
      els.backToTopBtn.classList.toggle("hidden", window.scrollY < 560);
      loadMoreIfNeeded();
    }, 140),
    { passive: true }
  );

  document.addEventListener(
    "error",
    (event) => {
      const img = event.target;
      if (img instanceof HTMLImageElement && img.dataset.fallback === "poster") {
        img.src = FALLBACK_POSTER;
      }
    },
    true
  );
}

async function fetchCatalog() {
  renderSkeleton();
  try {
    const snap = await get(ref(db, "movies_by_id"));
    if (!snap.exists()) {
      state.allItems = [];
      notify("No data found in Firebase", "warn");
      return;
    }

    const raw = snap.val();
    const entries = Array.isArray(raw)
      ? raw.map((value, index) => [String(index), value])
      : Object.entries(raw);

    const normalized = entries
      .filter(([, value]) => value && typeof value === "object")
      .map(([key, value]) => normalizeItem(value, key));

    state.allItems = normalized;
    state.byId = new Map(normalized.map((item) => [item.id, item]));
  } catch (error) {
    console.error(error);
    notify("Could not load catalog data", "error");
    state.allItems = [];
  }
}

function hydrateInitialState() {
  parseQueryParams();
  els.searchInput.value = state.searchTerm;
  els.sortSelect.value = state.sortBy;
  highlightPreset(state.quickPreset);
  applyAccent(state.settings.accent || ACCENT_OPTIONS[0].value);
}

function renderEverything() {
  TAB_IDS.forEach((tab) => renderTab(tab));
  renderKPIs();
  refreshRails();
  switchTab(state.currentTab);
}

async function boot() {
  hydrateInitialState();
  mountEvents();
  mountInstallHandlers();
  registerServiceWorker();

  await fetchCatalog();
  populateFilterOptions();
  renderEverything();

  if (state.searchTerm) saveRecentSearch(state.searchTerm);
  notify("MFLIX upgraded interface loaded", "success", 2000);
}

boot();
