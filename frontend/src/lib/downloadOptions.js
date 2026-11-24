export const SUPPORTED_BROWSERS = [
  'brave',
  'chrome',
  'chromium',
  'edge',
  'firefox',
  'opera',
  'safari',
  'vivaldi',
  'whale',
];

export const COOKIE_SOURCES = ['none', 'browser', 'harvest'];

const KEY = 'yt-dlp-download-options';

export const DEFAULT_DOWNLOAD_OPTIONS = {
  writeDescription: true,
  writeThumbnail: true,
  cookieSource: 'none',
  browser: 'chrome',
};

function normalizeCookieSource(parsed) {
  if (typeof parsed.cookieSource === 'string') {
    const source = parsed.cookieSource.toLowerCase();
    if (COOKIE_SOURCES.includes(source)) return source;
  }
  // Legacy: useCookies boolean
  if (parsed.useCookies) return 'browser';
  return DEFAULT_DOWNLOAD_OPTIONS.cookieSource;
}

export function loadDownloadOptions() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_DOWNLOAD_OPTIONS };
    const parsed = JSON.parse(raw);
    const browser =
      typeof parsed.browser === 'string' && SUPPORTED_BROWSERS.includes(parsed.browser.toLowerCase())
        ? parsed.browser.toLowerCase()
        : DEFAULT_DOWNLOAD_OPTIONS.browser;
    return {
      writeDescription: parsed.writeDescription !== false,
      writeThumbnail: parsed.writeThumbnail !== false,
      cookieSource: normalizeCookieSource(parsed),
      browser,
    };
  } catch {
    return { ...DEFAULT_DOWNLOAD_OPTIONS };
  }
}

export function saveDownloadOptions(options) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        writeDescription: Boolean(options.writeDescription),
        writeThumbnail: Boolean(options.writeThumbnail),
        cookieSource: options.cookieSource || DEFAULT_DOWNLOAD_OPTIONS.cookieSource,
        browser: options.browser || DEFAULT_DOWNLOAD_OPTIONS.browser,
      })
    );
  } catch {
    /* ignore */
  }
}
