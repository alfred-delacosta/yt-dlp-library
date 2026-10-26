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

To change the icon, replace these files with new renders of the same sizes and names. The source pack (SVG masters, lockups and social images) is kept outside this repo.

The logo, icon and lockups are copyright Advanced Software and AI Solutions LLC.
