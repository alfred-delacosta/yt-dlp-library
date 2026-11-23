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

const KEY = 'yt-dlp-download-options';

export const DEFAULT_DOWNLOAD_OPTIONS = {
  writeDescription: true,
  writeThumbnail: true,
  useCookies: false,
  browser: 'chrome',
};

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
      useCookies: Boolean(parsed.useCookies),
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
        useCookies: Boolean(options.useCookies),
        browser: options.browser || DEFAULT_DOWNLOAD_OPTIONS.browser,
      })
    );
  } catch {
    /* ignore */
  }
}
