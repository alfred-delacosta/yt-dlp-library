const KEY = 'yt-dlp-theme';

export function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(current) {
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
