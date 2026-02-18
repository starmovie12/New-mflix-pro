export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Storage read error:", key, error);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Storage write error:", key, error);
    return false;
  }
}

export function readString(key, fallback = "") {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ?? fallback;
  } catch (error) {
    return fallback;
  }
}

export function writeString(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
    return true;
  } catch (error) {
    return false;
  }
}

export function updateSetStorage(key, id, shouldAdd = true) {
  const current = new Set(readJSON(key, []));
  if (shouldAdd) current.add(id);
  else current.delete(id);
  writeJSON(key, [...current]);
  return current;
}

export function boundedPush(key, item, maxSize = 25, idField = "id") {
  const list = readJSON(key, []);
  const filtered = list.filter((entry) => entry?.[idField] !== item?.[idField]);
  filtered.unshift(item);
  const next = filtered.slice(0, maxSize);
  writeJSON(key, next);
  return next;
}
