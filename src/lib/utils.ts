export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function formatYear(value: unknown, fallback = '—') {
  if (value === null || value === undefined) return fallback;
  const y = String(value).trim();
  return y.length ? y : fallback;
}

export function safeUpper(value: unknown, fallback = 'DUB') {
  const s = String(value ?? '').trim();
  return (s || fallback).toUpperCase();
}

export function formatRuntime(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return `${Math.round(value)}m`;
  const s = String(value ?? '').trim();
  if (!s) return 'N/A';
  if (/^\d+$/.test(s)) return `${s}m`;
  return s;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, waitMs: number) {
  let t: number | undefined;
  return (...args: TArgs) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), waitMs);
  };
}

export function toSearchable(value: unknown) {
  return String(value ?? '').toLowerCase();
}

export function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

