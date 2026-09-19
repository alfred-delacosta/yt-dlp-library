import { serverUrl } from './axios';

export function mediaUrl(filePath) {
  if (!filePath) return '';
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  if (import.meta.env.PROD) return path;
  return `${serverUrl}${path}`;
}

export function subtitleTrackUrl(video) {
  if (!video) return '';
  return mediaUrl(`/media/subtitles/${video.id}-${video.name}-subtitle.vtt`);
}

export function hasSubtitles(video) {
  return Boolean(video?.subtitles || video?.subtitlesFile);
}

export function normalizeRecord(row, type) {
  const item = Array.isArray(row) ? row[0] : row;
  if (!item) return null;
  return { ...item, mediaType: type };
}

export function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
}

export function highlightText(text, query) {
  if (!text) return '';
  if (!query) return text;
  const hay = String(text);
  const needle = query.trim();
  if (!needle) return hay;
  const idx = hay.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return hay;
  return {
    before: hay.slice(0, idx),
    match: hay.slice(idx, idx + needle.length),
    after: hay.slice(idx + needle.length),
  };
}

const RECENT_KEY = 'yt-dlp-recent-searches';

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(term) {
  const q = term.trim();
  if (!q) return getRecentSearches();
  const next = [q, ...getRecentSearches().filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
