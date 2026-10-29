export function readChartTheme() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name) => styles.getPropertyValue(name).trim();
  return {
    text: read('--text') || '#18181b',
    muted: read('--muted') || '#71717a',
    border: read('--border') || '#e4e4e7',
    accent: read('--accent') || '#2563eb',
    accentSoft: read('--accent-soft') || 'rgba(37, 99, 235, 0.12)',
    success: read('--success') || '#16a34a',
    warning: read('--warning') || '#ca8a04',
    danger: read('--danger') || '#dc2626',
    surface: read('--surface') || '#ffffff',
    surface2: read('--surface-2') || '#ececee',
    font: read('--font') || 'Segoe UI, system-ui, sans-serif',
  };
}

export const OPTION_LABELS = {
  mp4: 'MP4',
  mp3: 'MP3',
  x: 'X / Twitter',
  regular: 'Best',
  unknown: 'Unknown',
};

export const OPTION_ORDER = ['mp4', 'mp3', 'x', 'regular', 'unknown'];

export function formatMonthLabel(value) {
  const [year, month] = String(value).split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
}
