export const SUPPORTED_BROWSERS = [
  "brave",
  "chrome",
  "chromium",
  "edge",
  "firefox",
  "opera",
  "safari",
  "vivaldi",
  "whale",
];

export const setSSEHeaders = (res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in proxies like Nginx

  // Flush headers to establish connection
  res.flushHeaders();
};

export const sseProcessOutput = (req, res, ytdlpProcess) => {
  // Stream stdout as SSE events
  ytdlpProcess.stdout.on("data", (chunk) => {
    const message = chunk.toString();
    const formatted = message.replace("\r", "").trim();
    res.write(`data: ${formatted}\n\n`); // SSE format: each message ends with \n\n
  });

  // Stream stderr as SSE events (optional)
  ytdlpProcess.stderr.on("data", (chunk) => {
    const message = chunk.toString();
    const formatted = message.replace("\r", "").trim();
    res.write(`data: [ERROR]: ${formatted}\n\n`); // Prefix errors for clarity
  });

  // Handle spawn errors (e.g., command not found)
  ytdlpProcess.on("error", (err) => {
    console.log(`onError: ${err.message}`);
    res.write(`data: Error: ${err.message}\n\n`);
  });
};

/**
 * Normalize download options from the request body.
 * Returns { ok: true, options } or { ok: false, message }.
 */
export const resolveDownloadOptions = (body = {}) => {
  const writeDescription = body.writeDescription !== false;
  const writeThumbnail = body.writeThumbnail !== false;
  const useCookies = Boolean(body.useCookies);

  if (!useCookies) {
    return {
      ok: true,
      options: { writeDescription, writeThumbnail, useCookies: false, browser: null },
    };
  }

  const requested =
    typeof body.browser === "string" && body.browser.trim()
      ? body.browser.trim().toLowerCase()
      : null;
  const fromEnv =
    typeof process.env.BROWSER === "string" && process.env.BROWSER.trim()
      ? process.env.BROWSER.trim().toLowerCase()
      : null;
  const browser = requested || fromEnv;

  if (!browser) {
    return {
      ok: false,
      message:
        "Cookies from browser was enabled, but no browser was selected and BROWSER is not set on the server.",
    };
  }

  if (!SUPPORTED_BROWSERS.includes(browser)) {
    return {
      ok: false,
      message: `Unsupported browser "${browser}". Supported: ${SUPPORTED_BROWSERS.join(", ")}.`,
    };
  }

  return {
    ok: true,
    options: { writeDescription, writeThumbnail, useCookies: true, browser },
  };
};

/**
 * Build yt-dlp argv for a download type and user options.
 */
export const buildDownloadArgs = ({
  type,
  videoUrl,
  writeDescription = true,
  writeThumbnail = true,
  useCookies = false,
  browser = null,
}) => {
  const args = [];

  if (type === "regular" || type === "mp4") {
    args.push("--windows-filenames", "--restrict-filenames");
  } else if (type === "mp3") {
    args.push("--restrict-filenames");
  }

  if (writeDescription) {
    args.push("--write-description");
  }

  if (type === "mp3") {
    if (writeThumbnail) {
      args.push("--embed-thumbnail");
    }
  } else {
    args.push("--write-subs", "--embed-subs");
    if (writeThumbnail) {
      args.push("--write-thumbnail");
    }
  }

  if (useCookies && browser) {
    args.push("--cookies-from-browser", browser);
  }

  if (type === "regular" || type === "mp4") {
    args.push("--impersonate", "chrome-99");
  }

  if (type === "mp4") {
    args.push("-t", "mp4");
  } else if (type === "mp3") {
    args.push("-t", "mp3");
  } else if (type === "x") {
    args.push("-o", "%(uploader_id)s-%(id)s-%(upload_date)s.%(ext)s");
  }

  args.push(videoUrl);
  return args;
};
