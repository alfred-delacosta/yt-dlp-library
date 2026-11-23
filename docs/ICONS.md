# App icons

The yt-dlp library icon ("Bento library", variation B, red play) lives in `frontend/public/`. Vite copies that folder into `frontend/dist/`, and Express serves it as static files before any auth, so the browser and the install prompt can always fetch these files.

| File | Size | Used by |
|---|---|---|
| `favicon.svg` | vector | Browser tab icon in modern browsers (`<link rel="icon">`), manifest `any` |
| `favicon.ico` | 16, 32 and 48 | Legacy favicon fallback |
| `apple-touch-icon.png` | 180x180, opaque | iOS home screen (`<link rel="apple-touch-icon">`) |
| `icons/icon-192.png`, `icons/icon-512.png` | transparent corners | `manifest.json`, purpose `any` |
| `icons/maskable-192.png`, `icons/maskable-512.png` | opaque, full bleed, safe zone | `manifest.json`, purpose `maskable` (Android adaptive icons) |

`frontend/index.html` links the favicons, the apple touch icon, `manifest.json` and the `theme-color` meta (#2563eb, the same as the manifest). The manifest keeps the app's existing colors: `theme_color` #2563eb and `background_color` #0c0c0e.

## Desktop / Chromium install

Desktop Chrome and Edge need a registered service worker (built by `vite-plugin-pwa` into `sw.js`) in addition to this manifest. Test install on a **secure context**:

- Preferred: build the frontend, run with `ENVIRONMENT=local` or `production`, and open `http://localhost:<PORT>` (Express serves `frontend/dist`).
- Production: `https://` behind your reverse proxy.
- Do **not** expect an install prompt on bare HTTP over a LAN IP, or on Vite-only `:5173` without the built SW.

After load, DevTools → Application → Manifest / Service workers should show the SW registered with no installability errors. Account also shows an **Install app** button when `beforeinstallprompt` fires.

To change the icon, replace these files with new renders of the same sizes and names. The source pack (SVG masters, lockups and social images) is kept outside this repo.

The logo, icon and lockups are copyright Advanced Software and AI Solutions LLC.
