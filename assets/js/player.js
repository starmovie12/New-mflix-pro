import { get, limitToLast, query, ref } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { FALLBACK_POSTER, STORAGE_KEYS, db } from "./config.js";
import { boundedPush, readJSON, updateSetStorage, writeJSON } from "./storage.js";
import {
  asNumber,
  clamp,
  createToastManager,
  debounce,
  escapeHtml,
  formatDuration,
  parseYear,
  toArray,
  toLower
} from "./utils.js";

const els = {
  video: document.getElementById("vdo"),
  source: document.getElementById("videoSource"),
  backBtn: document.getElementById("backBtn"),
  networkMini: document.getElementById("networkMini"),
  overlayTitle: document.getElementById("overlayTitle"),
  watchProgressFill: document.getElementById("watchProgressFill"),
  skipIntroBtn: document.getElementById("skipIntroBtn"),
  nextEpisodeBtn: document.getElementById("nextEpisodeBtn"),
  shareQuickBtn: document.getElementById("shareQuickBtn"),
  qualityBtn: document.getElementById("qualityBtn"),
  qualityMenu: document.getElementById("qualityMenu"),
  speedBtn: document.getElementById("speedBtn"),
  speedMenu: document.getElementById("speedMenu"),
  fitBtn: document.getElementById("fitBtn"),
  pipBtn: document.getElementById("pipBtn"),
  fullBtn: document.getElementById("fullBtn"),

  skeletonPane: document.getElementById("skeletonPane"),
  realContent: document.getElementById("realContent"),
  title: document.getElementById("movieTitle"),
  qualityBadge: document.getElementById("qualityBadge"),
  cert: document.getElementById("cert"),
  rating: document.getElementById("rating"),
  year: document.getElementById("year"),
  genre: document.getElementById("genre"),
  runtime: document.getElementById("runtime"),
  language: document.getElementById("language"),
  director: document.getElementById("director"),
  cast: document.getElementById("cast"),
  platform: document.getElementById("platform"),
  plot: document.getElementById("plot"),
  resumeBar: document.getElementById("resumeBar"),
  resumeText: document.getElementById("resumeText"),
  resumeBtn: document.getElementById("resumeBtn"),

  actionContainer: document.getElementById("actionContainer"),
  movieBtnsWrapper: document.getElementById("movieBtnsWrapper"),
  playMainBtn: document.getElementById("playMainBtn"),
  playMenu: document.getElementById("playMenu"),
  downloadBtn: document.getElementById("downloadBtn"),
  downloadMenu: document.getElementById("downloadMenu"),
  episodesBtn: document.getElementById("episodesBtn"),
  trailerBtn: document.getElementById("trailerBtn"),

  myListBtn: document.getElementById("myListBtn"),
  likeBtn: document.getElementById("likeBtn"),
  shareBtn: document.getElementById("shareBtn"),
  reportBtn: document.getElementById("reportBtn"),

  relatedGrid: document.getElementById("relatedGrid"),

  episodesOverlay: document.getElementById("episodesOverlay"),
  closeEpBtn: document.getElementById("closeEpBtn"),
  epSearchInput: document.getElementById("epSearchInput"),
  seasonSelect: document.getElementById("seasonSelect"),
  episodesList: document.getElementById("episodesList"),
  epCountPill: document.getElementById("epCountPill"),

  reportModal: document.getElementById("reportModal"),
  reportText: document.getElementById("reportText"),
  closeReportBtn: document.getElementById("closeReportBtn"),
  submitReportBtn: document.getElementById("submitReportBtn")
};

const notify = createToastManager();
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const params = new URLSearchParams(window.location.search);
const initialId = params.get("id");

const watchlistSeed = readJSON(STORAGE_KEYS.WATCHLIST, []);
const likedSeed = readJSON(STORAGE_KEYS.LIKED, []);
const historySeed = readJSON(STORAGE_KEYS.HISTORY, []);
const playbackSeed = readJSON(STORAGE_KEYS.PLAYBACK, {});

const state = {
  id: initialId || "",
  sourceParamType: params.get("type") || "movie",
  raw: null,
  normalized: null,
  isSeries: false,
  links: [],
  seasons: [],
  currentLinkIndex: 0,
  currentEpisode: { seasonIndex: 0, episodeIndex: 0 },
  watchlist: new Set((Array.isArray(watchlistSeed) ? watchlistSeed : []).map(String)),
  liked: new Set((Array.isArray(likedSeed) ? likedSeed : []).map(String)),
  history: Array.isArray(historySeed) ? historySeed : [],
  playbackState: playbackSeed && typeof playbackSeed === "object" ? playbackSeed : {},
  fitMode: "contain",
  speed: 1,
  pendingNextEpisode: null,
  progressWriteTick: 0
};

function setOnlineState() {
  els.networkMini.classList.toggle("show", !navigator.onLine);
}

function parseLinkObjects(input) {
  if (!input) return [];
  let data = input;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = /^https?:\/\//i.test(data.trim()) ? [data.trim()] : [];
    }
  }

  const entries = Array.isArray(data) ? data : Object.values(data || {});
  const output = [];
  entries.forEach((entry) => {
    if (!entry) return;
    if (typeof entry === "string") {
      output.push({
        url: entry,
        label: "HD",
        info: ""
      });
      return;
    }
    const url = entry.url || entry.link || entry.movie_link || entry.file || entry.video_url;
    if (!url) return;
    output.push({
      url,
      label: String(entry.quality || entry.label || "HD"),
      info: String(entry.size || entry.info || "")
    });
  });
  return output;
}

function normalizeSeasons(raw) {
  let seasonSource = raw.seasons || raw.season_list || [];
  if ((!seasonSource || (Array.isArray(seasonSource) && seasonSource.length === 0)) && raw.episodes) {
    seasonSource = [{ name: "Season 1", episodes: raw.episodes }];
  }
  if (!Array.isArray(seasonSource)) seasonSource = Object.values(seasonSource || {});

  const seasons = seasonSource
    .map((season, sIndex) => {
      const episodeSource = season?.episodes || season?.list || [];
      const episodesArray = Array.isArray(episodeSource) ? episodeSource : Object.values(episodeSource || {});
      const episodes = episodesArray
        .map((ep, eIndex) => {
          if (!ep) return null;
          const qualityLinks = parseLinkObjects(ep.download_links || ep.qualities || ep.links);
          const fallbackUrl =
            ep.url || ep.link || ep.movie_link || ep.video_url || ep.stream || qualityLinks[0]?.url || "";
          if (!fallbackUrl) return null;
          return {
            title: ep.title || ep.name || ep.episode_title || `Episode ${eIndex + 1}`,
            url: fallbackUrl,
            qualityLinks,
            runtimeMinutes: asNumber(ep.runtime || ep.duration, 0),
            description: ep.description || ""
          };
        })
        .filter(Boolean);

      if (episodes.length === 0) return null;
      return {
        name: season?.name || season?.title || `Season ${sIndex + 1}`,
        episodes
      };
    })
    .filter(Boolean);

  return seasons;
}

function normalizeData(raw, keyId) {
  const seasons = normalizeSeasons(raw);
  const typeHint = toLower(raw.content_type || raw.type || raw.category || "");
  const isSeries = seasons.length > 0 || typeHint.includes("series") || typeHint.includes("tv");

  const links = parseLinkObjects(raw.download_links || raw.qualities || raw.links || raw.sources);
  const directUrl = raw.url || raw.link || raw.movie_link || raw.video_url;
  if (directUrl) {
    links.unshift({
      url: directUrl,
      label: raw.quality_name || "HD",
      info: ""
    });
  }

  const uniqueLinks = [];
  const seen = new Set();
  links.forEach((link) => {
    if (!link?.url || seen.has(link.url)) return;
    seen.add(link.url);
    uniqueLinks.push(link);
  });

  return {
    id: keyId,
    title: raw.title || raw.original_title || "Untitled",
    qualityName: raw.quality_name || "HD",
    year: parseYear(raw.year || raw.release_year || "2024"),
    genre: toArray(raw.genre || "Drama").join(", "),
    runtime: formatDuration(asNumber(raw.runtime || raw.duration, 0)),
    cert: raw.certification || "UA",
    rating: String(raw.rating || "0.0"),
    plot: raw.description || raw.overview || "No synopsis available.",
    language: toArray(raw.spoken_languages || raw.original_language || "Dub").join(", "),
    director: raw.director || "Unknown",
    cast: toArray(raw.cast || "N/A").join(", "),
    platform: raw.platform || "MFLIX",
    poster: raw.poster || FALLBACK_POSTER,
    isSeries,
    links: uniqueLinks,
    seasons
  };
}

function closeAllMenus() {
  [els.playMenu, els.downloadMenu, els.qualityMenu, els.speedMenu].forEach((menu) => menu.classList.remove("show"));
}

function toggleMenu(menu, force) {
  const willOpen = force ?? !menu.classList.contains("show");
  closeAllMenus();
  menu.classList.toggle("show", Boolean(willOpen));
}

function buildMenuButton(label, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
    closeAllMenus();
  });
  return btn;
}

function updateLikeButtons() {
  const inWatchlist = state.watchlist.has(state.id);
  const liked = state.liked.has(state.id);
  els.myListBtn.innerHTML = inWatchlist
    ? '<i class="fa-solid fa-circle-check"></i> Added'
    : '<i class="fa-solid fa-plus"></i> My List';
  els.likeBtn.innerHTML = liked
    ? '<i class="fa-solid fa-thumbs-up"></i> Liked'
    : '<i class="fa-regular fa-thumbs-up"></i> Like';
}

function shareCurrent() {
  const shareTitle = state.normalized?.title || "MFLIX";
  const shareUrl = window.location.href;
  if (navigator.share) {
    navigator
      .share({
        title: shareTitle,
        text: `Watch ${shareTitle} on MFLIX`,
        url: shareUrl
      })
      .catch(() => undefined);
    return;
  }
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => notify("Link copied to clipboard", "success"))
    .catch(() => notify("Could not copy link automatically", "warn"));
}

function findNextEpisodeIndex() {
  if (!state.isSeries) return null;
  const { seasonIndex, episodeIndex } = state.currentEpisode;
  const season = state.seasons[seasonIndex];
  if (!season) return null;

  if (episodeIndex + 1 < season.episodes.length) {
    return { seasonIndex, episodeIndex: episodeIndex + 1 };
  }
  if (seasonIndex + 1 < state.seasons.length && state.seasons[seasonIndex + 1].episodes.length > 0) {
    return { seasonIndex: seasonIndex + 1, episodeIndex: 0 };
  }
  return null;
}

function updateNextEpisodeState() {
  const next = findNextEpisodeIndex();
  state.pendingNextEpisode = next;
  els.nextEpisodeBtn.classList.toggle("hidden", !next);
}

function updateOverlayTitle(extra = "") {
  const base = state.normalized?.title || "MFLIX";
  els.overlayTitle.textContent = extra ? `${base} • ${extra}` : base;
}

function savePlaybackProgress() {
  if (!state.normalized) return;
  const duration = asNumber(els.video.duration, 0);
  const currentTime = asNumber(els.video.currentTime, 0);
  if (duration <= 0 || currentTime < 0) return;

  const progress = clamp((currentTime / duration) * 100, 0, 100);
  els.watchProgressFill.style.width = `${progress}%`;

  state.progressWriteTick += 1;
  if (state.progressWriteTick % 3 !== 0) return;

  state.playbackState[state.id] = {
    id: state.id,
    title: state.normalized.title,
    poster: state.normalized.poster,
    time: currentTime,
    duration,
    progress,
    updatedAt: Date.now(),
    seasonIndex: state.currentEpisode.seasonIndex,
    episodeIndex: state.currentEpisode.episodeIndex
  };
  writeJSON(STORAGE_KEYS.PLAYBACK, state.playbackState);

  const historyEntry = {
    id: state.id,
    title: state.normalized.title,
    poster: state.normalized.poster,
    progress,
    duration,
    lastTime: currentTime,
    updatedAt: Date.now(),
    type: state.isSeries ? "series" : "movie"
  };
  state.history = boundedPush(STORAGE_KEYS.HISTORY, historyEntry, 60, "id");
}

function showResumeIfAvailable() {
  const record = state.playbackState[state.id];
  if (!record) return;
  const time = asNumber(record.time, 0);
  const duration = asNumber(record.duration, 0);
  if (time < 20) return;
  if (duration > 0 && time >= duration - 20) return;
  els.resumeBar.classList.add("show");
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  els.resumeText.textContent = `Resume from ${mins}:${secs}`;
  els.resumeBtn.dataset.time = String(time);
}

function playVideo(url, { autoPlay = true, title = "" } = {}) {
  if (!url) {
    notify("Video source is missing", "error");
    return;
  }
  closeAllMenus();
  els.source.src = url;
  els.video.load();
  if (autoPlay) {
    els.video.play().catch(() => undefined);
  }
  updateOverlayTitle(title);
}

function renderMovieMenus() {
  els.playMenu.innerHTML = "";
  els.downloadMenu.innerHTML = "";
  els.qualityMenu.innerHTML = "";

  if (!state.links.length) {
    els.playMenu.appendChild(buildMenuButton("No playable source", () => undefined));
    return;
  }

  state.links.forEach((link, index) => {
    const playText = `Play ${link.label || "HD"}`;
    els.playMenu.appendChild(
      buildMenuButton(playText, () => {
        state.currentLinkIndex = index;
        playVideo(link.url, {
          autoPlay: true,
          title: link.label || "HD"
        });
        els.qualityBadge.textContent = link.label || state.normalized.qualityName;
      })
    );

    els.downloadMenu.appendChild(
      buildMenuButton(`${link.label || "HD"} ${link.info || ""}`.trim(), () => {
        window.open(link.url, "_blank", "noopener");
      })
    );

    els.qualityMenu.appendChild(
      buildMenuButton(`Switch to ${link.label || "HD"}`, () => {
        state.currentLinkIndex = index;
        playVideo(link.url, {
          autoPlay: true,
          title: link.label || "HD"
        });
        els.qualityBadge.textContent = link.label || state.normalized.qualityName;
      })
    );
  });
}

function renderSpeedMenu() {
  els.speedMenu.innerHTML = "";
  SPEED_OPTIONS.forEach((speed) => {
    els.speedMenu.appendChild(
      buildMenuButton(`${speed}x ${speed === state.speed ? "✓" : ""}`.trim(), () => {
        state.speed = speed;
        els.video.playbackRate = speed;
        notify(`Playback speed ${speed}x`, "success", 1000);
      })
    );
  });
}

function applySeriesModeUI() {
  els.movieBtnsWrapper.style.display = "none";
  els.episodesBtn.classList.remove("hidden");
  els.actionContainer.classList.add("series-mode");
}

function applyMovieModeUI() {
  els.movieBtnsWrapper.style.display = "contents";
  els.episodesBtn.classList.add("hidden");
  els.actionContainer.classList.remove("series-mode");
}

function getCurrentEpisode() {
  if (!state.isSeries) return null;
  const season = state.seasons[state.currentEpisode.seasonIndex];
  if (!season) return null;
  return season.episodes[state.currentEpisode.episodeIndex] || null;
}

function playEpisode(seasonIndex, episodeIndex, autoPlay = true) {
  const season = state.seasons[seasonIndex];
  const episode = season?.episodes?.[episodeIndex];
  if (!episode) return;

  state.currentEpisode = { seasonIndex, episodeIndex };
  const epTitle = `${season.name} • ${episode.title}`;
  playVideo(episode.url, { autoPlay, title: epTitle });
  els.qualityBadge.textContent = episode.qualityLinks?.[0]?.label || state.normalized.qualityName;

  if (episode.qualityLinks?.length) {
    els.qualityMenu.innerHTML = "";
    episode.qualityLinks.forEach((link) => {
      els.qualityMenu.appendChild(
        buildMenuButton(`Switch to ${link.label}`, () => {
          playVideo(link.url, { autoPlay: true, title: epTitle });
          els.qualityBadge.textContent = link.label;
        })
      );
    });
  } else {
    els.qualityMenu.innerHTML = "";
    els.qualityMenu.appendChild(buildMenuButton("Auto quality", () => undefined));
  }

  els.downloadMenu.innerHTML = "";
  els.downloadMenu.appendChild(
    buildMenuButton(`Download ${episode.title}`, () => {
      window.open(episode.url, "_blank", "noopener");
    })
  );

  renderEpisodeList();
  updateNextEpisodeState();
}

function playNextEpisode() {
  const next = findNextEpisodeIndex();
  if (!next) return;
  playEpisode(next.seasonIndex, next.episodeIndex, true);
  notify("Playing next episode", "success");
}

function renderEpisodeList() {
  if (!state.isSeries) {
    els.epCountPill.textContent = "0 episodes";
    els.episodesList.innerHTML = '<p style="color:#9ca3b8">No episodes available.</p>';
    return;
  }

  const search = toLower(els.epSearchInput.value || "");
  const selectedSeason = els.seasonSelect.value;
  let total = 0;
  const blocks = [];

  state.seasons.forEach((season, sIndex) => {
    const seasonKey = `s-${sIndex}`;
    if (selectedSeason !== "all" && selectedSeason !== seasonKey) return;
    const rows = season.episodes
      .map((episode, eIndex) => ({ episode, eIndex }))
      .filter(({ episode }) => {
        if (!search) return true;
        return toLower(episode.title).includes(search);
      });
    if (!rows.length) return;
    total += rows.length;
    const rowHtml = rows
      .map(({ episode, eIndex }) => {
        const active =
          state.currentEpisode.seasonIndex === sIndex && state.currentEpisode.episodeIndex === eIndex;
        return `
          <button class="ep-card ${active ? "ep-active" : ""}" data-season="${sIndex}" data-episode="${eIndex}">
            <span class="ep-num">E${eIndex + 1}</span>
            <span class="ep-name">${escapeHtml(episode.title)}</span>
            <i class="fa-solid fa-play"></i>
          </button>
        `;
      })
      .join("");

    blocks.push(`
      <section class="ep-group">
        <h4>${escapeHtml(season.name)}</h4>
        ${rowHtml}
      </section>
    `);
  });

  els.epCountPill.textContent = `${total} episodes`;
  els.episodesList.innerHTML =
    blocks.join("") || '<p style="color:#9ca3b8; text-align:center;">No episodes matched your search.</p>';
}

function renderRelated(items) {
  if (!items.length) {
    els.relatedGrid.innerHTML = '<p style="grid-column:1/-1;color:#9ca3b8">No related titles found.</p>';
    return;
  }

  els.relatedGrid.innerHTML = items
    .map(
      (item) => `
      <button class="related-item" data-related-id="${escapeHtml(item.id)}" aria-label="Open ${escapeHtml(item.title)}">
        <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)}" data-fallback="poster" loading="lazy" />
        <p>${escapeHtml(item.title)}</p>
      </button>
    `
    )
    .join("");
}

async function loadRelated() {
  try {
    const snap = await get(query(ref(db, "movies_by_id"), limitToLast(48)));
    if (!snap.exists()) {
      renderRelated([]);
      return;
    }
    const raw = snap.val();
    const entries = Array.isArray(raw) ? raw.map((value, i) => [String(i), value]) : Object.entries(raw);
    const source = entries
      .filter(([, value]) => value && typeof value === "object")
      .map(([id, value]) => ({
        id,
        title: value.title || value.original_title || "Untitled",
        poster: value.poster || FALLBACK_POSTER,
        genre: toArray(value.genre).join(", ").toLowerCase()
      }))
      .filter((item) => item.id !== state.id);

    const currentGenre = toLower(state.normalized?.genre || "");
    const related = source
      .map((item) => {
        const score = currentGenre && item.genre.includes(currentGenre.split(",")[0]) ? 1 : 0;
        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    renderRelated(related);
  } catch (error) {
    console.error(error);
    renderRelated([]);
  }
}

function bindVideoEvents() {
  els.video.addEventListener("loadedmetadata", () => {
    showResumeIfAvailable();
  });

  els.video.addEventListener("timeupdate", () => {
    const currentTime = asNumber(els.video.currentTime, 0);
    const duration = asNumber(els.video.duration, 0);
    const progress = duration > 0 ? clamp((currentTime / duration) * 100, 0, 100) : 0;
    els.watchProgressFill.style.width = `${progress}%`;
    els.skipIntroBtn.classList.toggle("show", currentTime > 4 && currentTime < 95);

    if (state.isSeries && state.pendingNextEpisode && duration > 0 && duration - currentTime < 20) {
      els.nextEpisodeBtn.classList.remove("hidden");
    }
    savePlaybackProgress();
  });

  els.video.addEventListener("ended", () => {
    if (state.isSeries && state.pendingNextEpisode) {
      notify("Up next episode in 4s...", "warn");
      window.setTimeout(() => {
        playNextEpisode();
      }, 4000);
    }
  });
}

function buildSeriesControls() {
  els.seasonSelect.innerHTML = '<option value="all">All Seasons</option>';
  state.seasons.forEach((season, index) => {
    const option = document.createElement("option");
    option.value = `s-${index}`;
    option.textContent = season.name;
    els.seasonSelect.appendChild(option);
  });
}

function openEpisodesOverlay() {
  els.episodesOverlay.classList.add("show");
}

function closeEpisodesOverlay() {
  els.episodesOverlay.classList.remove("show");
}

function updateDocumentMeta(data) {
  document.title = `${data.title} | MFLIX Player`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) {
    desc.setAttribute(
      "content",
      `${data.title} (${data.year}) streaming on MFLIX. Genre: ${data.genre}. Watch in high quality with episode navigator and smart playback controls.`
    );
  }
}

function renderInfo(data) {
  state.normalized = data;
  state.isSeries = data.isSeries;
  state.links = data.links;
  state.seasons = data.seasons;

  updateDocumentMeta(data);

  els.title.textContent = data.title;
  els.qualityBadge.textContent = data.qualityName;
  els.cert.textContent = data.cert;
  els.rating.textContent = data.rating;
  els.year.textContent = data.year;
  els.genre.textContent = data.genre || "N/A";
  els.runtime.textContent = data.runtime;
  els.language.textContent = data.language || "N/A";
  els.director.textContent = data.director || "N/A";
  els.cast.textContent = data.cast || "N/A";
  els.platform.textContent = data.platform || "N/A";
  els.plot.textContent = data.plot;
  els.overlayTitle.textContent = data.title;
  els.video.poster = data.poster || FALLBACK_POSTER;

  updateLikeButtons();
  renderSpeedMenu();

  if (data.isSeries) {
    applySeriesModeUI();
    buildSeriesControls();
    renderEpisodeList();
    const defaultEpisode =
      state.playbackState[state.id] && asNumber(state.playbackState[state.id].episodeIndex, -1) >= 0
        ? {
            seasonIndex: asNumber(state.playbackState[state.id].seasonIndex, 0),
            episodeIndex: asNumber(state.playbackState[state.id].episodeIndex, 0)
          }
        : { seasonIndex: 0, episodeIndex: 0 };
    const seasonIndex = clamp(defaultEpisode.seasonIndex, 0, Math.max(0, state.seasons.length - 1));
    const episodeMax = Math.max(0, (state.seasons[seasonIndex]?.episodes?.length || 1) - 1);
    const episodeIndex = clamp(defaultEpisode.episodeIndex, 0, episodeMax);
    playEpisode(seasonIndex, episodeIndex, true);
  } else {
    applyMovieModeUI();
    renderMovieMenus();
    if (data.links.length > 0) {
      playVideo(data.links[0].url, { autoPlay: true, title: data.links[0].label || data.qualityName });
    } else {
      notify("No playable links available for this title", "error");
    }
  }

  els.skeletonPane.classList.add("hidden");
  els.realContent.classList.remove("hidden");
  showResumeIfAvailable();
}

async function findItemById(id) {
  if (!id) return null;
  const directSnap = await get(ref(db, `movies_by_id/${id}`));
  if (directSnap.exists()) return { key: id, value: directSnap.val() };

  const fullSnap = await get(ref(db, "movies_by_id"));
  if (!fullSnap.exists()) return null;

  const entries = Array.isArray(fullSnap.val())
    ? fullSnap.val().map((value, index) => [String(index), value])
    : Object.entries(fullSnap.val());
  const found = entries.find(([, value]) => String(value?.movie_id || value?.id || "") === String(id));
  if (!found) return null;
  return { key: found[0], value: found[1] };
}

async function loadContent() {
  if (!state.id) {
    notify("No ID provided in URL", "error");
    window.setTimeout(() => {
      window.location.href = "/index.html";
    }, 1200);
    return;
  }

  try {
    const match = await findItemById(state.id);
    if (!match) {
      notify("Content not found", "error");
      return;
    }
    state.id = String(match.key);
    state.raw = match.value;
    const data = normalizeData(match.value, state.id);
    renderInfo(data);
    await loadRelated();
  } catch (error) {
    console.error(error);
    notify("Unable to load player content", "error");
  }
}

function mountActions() {
  window.addEventListener("online", setOnlineState);
  window.addEventListener("offline", setOnlineState);
  setOnlineState();

  els.backBtn.addEventListener("click", () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/index.html";
  });

  els.playMainBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu(els.playMenu);
  });
  els.downloadBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu(els.downloadMenu);
  });
  els.qualityBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu(els.qualityMenu);
  });
  els.speedBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu(els.speedMenu);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu-popup") && !event.target.closest(".icon-circle") && !event.target.closest(".btn-main")) {
      closeAllMenus();
    }
  });

  els.fitBtn.addEventListener("click", () => {
    state.fitMode = state.fitMode === "contain" ? "cover" : "contain";
    els.video.style.objectFit = state.fitMode;
    notify(`Fit mode: ${state.fitMode}`, "success", 900);
  });

  els.pipBtn.addEventListener("click", async () => {
    if (!document.pictureInPictureEnabled) {
      notify("Picture in Picture not supported", "warn");
      return;
    }
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await els.video.requestPictureInPicture();
    } catch {
      notify("Could not open PiP", "error");
    }
  });

  els.fullBtn.addEventListener("click", async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  });

  els.shareQuickBtn.addEventListener("click", shareCurrent);
  els.shareBtn.addEventListener("click", shareCurrent);

  els.skipIntroBtn.addEventListener("click", () => {
    els.video.currentTime = clamp(asNumber(els.video.currentTime) + 90, 0, asNumber(els.video.duration, 0));
  });
  els.nextEpisodeBtn.addEventListener("click", playNextEpisode);

  els.resumeBtn.addEventListener("click", () => {
    const seek = asNumber(els.resumeBtn.dataset.time, 0);
    if (seek > 0) {
      els.video.currentTime = seek;
      els.video.play().catch(() => undefined);
      els.resumeBar.classList.remove("show");
    }
  });

  els.myListBtn.addEventListener("click", () => {
    const nextState = !state.watchlist.has(state.id);
    state.watchlist = new Set([...updateSetStorage(STORAGE_KEYS.WATCHLIST, state.id, nextState)].map(String));
    updateLikeButtons();
    notify(nextState ? "Added to My List" : "Removed from My List", "success");
  });
  els.likeBtn.addEventListener("click", () => {
    const nextState = !state.liked.has(state.id);
    state.liked = new Set([...updateSetStorage(STORAGE_KEYS.LIKED, state.id, nextState)].map(String));
    updateLikeButtons();
    notify(nextState ? "Liked" : "Like removed", "success");
  });

  els.reportBtn.addEventListener("click", () => els.reportModal.classList.add("open"));
  els.closeReportBtn.addEventListener("click", () => els.reportModal.classList.remove("open"));
  els.submitReportBtn.addEventListener("click", () => {
    const message = (els.reportText.value || "").trim();
    if (!message) {
      notify("Please write issue details", "warn");
      return;
    }
    const existing = readJSON("mflix_reports_v1", []);
    existing.unshift({
      id: state.id,
      title: state.normalized?.title || "Unknown",
      message,
      createdAt: Date.now()
    });
    writeJSON("mflix_reports_v1", existing.slice(0, 100));
    els.reportText.value = "";
    els.reportModal.classList.remove("open");
    notify("Thanks, report submitted", "success");
  });

  els.trailerBtn.addEventListener("click", () => {
    const query = encodeURIComponent(`${state.normalized?.title || "movie"} trailer`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank", "noopener");
  });

  els.episodesBtn.addEventListener("click", openEpisodesOverlay);
  els.closeEpBtn.addEventListener("click", closeEpisodesOverlay);
  els.seasonSelect.addEventListener("change", renderEpisodeList);
  els.epSearchInput.addEventListener("input", debounce(renderEpisodeList, 120));
  els.episodesList.addEventListener("click", (event) => {
    const card = event.target.closest(".ep-card");
    if (!card) return;
    const seasonIndex = asNumber(card.dataset.season, 0);
    const episodeIndex = asNumber(card.dataset.episode, 0);
    playEpisode(seasonIndex, episodeIndex, true);
    closeEpisodesOverlay();
  });

  els.relatedGrid.addEventListener("click", (event) => {
    const node = event.target.closest("[data-related-id]");
    if (!node) return;
    const id = node.dataset.relatedId;
    if (!id) return;
    window.location.href = `/video-player.html?id=${encodeURIComponent(id)}&source=firebase`;
  });

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

  document.addEventListener("keydown", (event) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")) return;
    const key = event.key.toLowerCase();
    if (key === " ") {
      event.preventDefault();
      if (els.video.paused) els.video.play().catch(() => undefined);
      else els.video.pause();
    } else if (key === "arrowright") {
      els.video.currentTime = clamp(asNumber(els.video.currentTime) + 10, 0, asNumber(els.video.duration, 0));
    } else if (key === "arrowleft") {
      els.video.currentTime = clamp(asNumber(els.video.currentTime) - 10, 0, asNumber(els.video.duration, 0));
    } else if (key === "f") {
      els.fullBtn.click();
    } else if (key === "m") {
      els.video.muted = !els.video.muted;
    } else if (key === "p") {
      els.pipBtn.click();
    } else if (key === "c") {
      els.fitBtn.click();
    } else if (key === "[") {
      state.speed = SPEED_OPTIONS[Math.max(0, SPEED_OPTIONS.indexOf(state.speed) - 1)] || 0.5;
      els.video.playbackRate = state.speed;
      renderSpeedMenu();
    } else if (key === "]") {
      state.speed = SPEED_OPTIONS[Math.min(SPEED_OPTIONS.length - 1, SPEED_OPTIONS.indexOf(state.speed) + 1)] || 1;
      els.video.playbackRate = state.speed;
      renderSpeedMenu();
    } else if (key === "n" && state.isSeries) {
      playNextEpisode();
    } else if (key === "e" && state.isSeries) {
      openEpisodesOverlay();
    } else if (key === "escape") {
      closeEpisodesOverlay();
      els.reportModal.classList.remove("open");
      closeAllMenus();
    }
  });
}

async function boot() {
  mountActions();
  bindVideoEvents();
  await loadContent();
}

boot();
