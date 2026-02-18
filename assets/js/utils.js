export function debounce(fn, wait = 250) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, wait = 200) {
  let isWaiting = false;
  return (...args) => {
    if (isWaiting) return;
    isWaiting = true;
    fn(...args);
    window.setTimeout(() => {
      isWaiting = false;
    }, wait);
  };
}

export function safeString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

export function toLower(value) {
  return safeString(value).toLowerCase();
}

export function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/[|,]/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [value];
}

export function randomPick(items) {
  if (!items?.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

export function asNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function escapeHtml(input = "") {
  return input.replace(/[&<>"']/g, (ch) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[ch] ?? ch;
  });
}

export function formatDuration(minutesValue) {
  const minutes = asNumber(minutesValue, 0);
  if (!minutes) return "N/A";
  const hr = Math.floor(minutes / 60);
  const min = Math.round(minutes % 60);
  if (!hr) return `${min}m`;
  return `${hr}h ${min}m`;
}

export function parseYear(value) {
  const raw = String(value ?? "").match(/\d{4}/);
  return raw ? raw[0] : "2024";
}

export function normalizeCategory(item) {
  const category = toLower(item.category || item.content_type || item.type);
  if (category.includes("anime")) return "anime";
  if (category.includes("series") || category.includes("tv")) return "tvshow";
  if (item.adult_content === "true" || item.adult_content === true) return "adult";
  return "movies";
}

export function createToastManager() {
  const stack = document.getElementById("toastStack");
  return function notify(message, type = "success", timeout = 2500) {
    if (!stack) return;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    stack.appendChild(el);
    window.setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      window.setTimeout(() => el.remove(), 180);
    }, timeout);
  };
}

export function formatCompactNumber(value) {
  const num = asNumber(value, 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(Math.round(num));
}

export function updateQueryParams(nextParams) {
  const url = new URL(window.location.href);
  Object.entries(nextParams).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined || value === false) url.searchParams.delete(key);
    else url.searchParams.set(key, String(value));
  });
  window.history.replaceState({}, "", url);
}

export function byRatingDesc(a, b) {
  const ra = asNumber(a.rating, 0);
  const rb = asNumber(b.rating, 0);
  return rb - ra;
}
