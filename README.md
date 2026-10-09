# yt-dlp Library

A self-hosted video and audio library. Paste a URL, [yt-dlp](https://github.com/yt-dlp/yt-dlp) downloads it, and the file is added to the signed-in account's library.

Each account has its own catalog. Media files live on the server under `backend/media` and are served only to a signed-in session.

## What you can do

### Library

- Browse videos and audio on separate pages.
- Search titles and descriptions. Video search also looks through saved subtitle text.
- Keep recent searches on this browser.
- Sort by download date, newest or oldest first.
- Play a video or MP3 in the browser. A video with a saved subtitle file shows an English track.
- Download the file, open the original URL, or delete the item. Deleting a video or MP3 removes the catalog row and the files on disk.

### Downloads

The Download page accepts any URL yt-dlp supports and streams yt-dlp's output while the download runs. Focusing the URL field fills it from the clipboard when the clipboard holds a link.

| Type | What it does |
| --- | --- |
| MP4 | Downloads an MP4. Uses cookies from the browser named in `BROWSER`, and asks yt-dlp to save the description, subtitles, and thumbnail. |
| MP3 | Extracts audio with yt-dlp's MP3 preset and embeds the thumbnail. Requires `ffmpeg`. |
| X / Twitter | Downloads a post with a filename based on the uploader, id, and upload date. |
| Best | Lets yt-dlp choose the format. Uses the same browser cookies, description, subtitles, and thumbnail options as MP4. |

Finished files are moved out of a temporary processing folder into `backend/media/videos` or `backend/media/mp3s` and recorded for the signed-in user.

### Video tools

From a video's page, or from the library action menu:

- Edit the name, description, and original link.
- Copy the file into the folder set by `JELLYFIN_FOLDER_PATH`. The library copy stays in place.
- Generate English subtitles on this machine. The server extracts audio with `ffmpeg`, runs the `whisperx` command (CPU, int8), and stores the transcript and a `.vtt` file.
- Send the video to a WhisperX HTTP API (`WHISPER_X_API_URL`) to transcribe it, or to convert it to MP3.

### Duplicate videos

Account → Review duplicate videos groups the current user's videos three ways:

- Same source link. YouTube links are matched by video id.
- Same title.
- Same file path.

Removing entries deletes those catalog rows and their thumbnail rows. The media files stay on disk.

### Account and sessions

- Sign up and log in with email and a password of at least 8 characters. Passwords are hashed with Argon2id.
- Stay signed in with a rotating refresh cookie. Access tokens are short-lived.
- See the browsers that are signed in, and sign out every device except this one.
- Switch between light and dark. The choice is saved in the browser and starts from the system theme.
- Download a SQL backup of the database from Account. Backup and restore need `mysqldump` and the `mysql` client on the server `PATH`.

Restore stays hidden until legacy tools are enabled. Restoring a backup replaces the current database.

The Tags page is a placeholder. Tagging is not available yet.

## Requirements

- Node.js 20 or newer
- A running MySQL server
- `yt-dlp` on the server `PATH`
- `ffmpeg` on the server `PATH` (MP3 downloads and local subtitle extraction)
- `mysqldump` and `mysql` on the server `PATH` (database backup and restore)
- Optional: the `whisperx` command on the server `PATH`
- Optional: a WhisperX HTTP API
- Optional: a Jellyfin library folder

The MySQL account needs permission to create the database named in `DB_NAME`. On first launch the app creates that database if it is missing, then creates the tables and the `backend/media` folders.

## Setup

```bash
git clone https://github.com/alfred-delacosta/yt-dlp-library.git
cd yt-dlp-library
npm run build
```

`npm run build` installs the backend and frontend dependencies and builds the frontend.

### Backend environment

Copy `backend/.env-sample` to `backend/.env`.

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the API listens on. Use `3010` when you run the Vite dev server. The frontend calls `http://localhost:3010` in local development. |
| `ENVIRONMENT` | `development`, `local`, or `production`. See [How to run](#how-to-run). |
| `ARGON2_SECRET` | Pepper for password hashes. Required. |
| `ACCESS_TOKEN_SECRET` | Secret for access tokens and media cookies. Required. |
| `JWT_NUMBER_OF_DAYS_EXPIRATION` | Refresh-session lifetime in days. Defaults to 7 when unset. |
| `ACCESS_TOKEN_NUMBER_OF_MINUTES_EXPIRATION` | Access-token lifetime in minutes. Defaults to 15 when unset. |
| `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` | MySQL connection. `DB_PORT` defaults to `3306` when empty. |
| `JELLYFIN_FOLDER_PATH` | Folder that receives a copy when you send a video to Jellyfin. |
| `WHISPER_X_API_URL` | Base URL of the WhisperX HTTP API. Required for the WhisperX subtitle and MP3 actions. |
| `BROWSER` | Browser name passed to yt-dlp `--cookies-from-browser` for MP4 and Best downloads. Example: `chrome`, `firefox`, `edge`. |
| `ENABLE_LEGACY_UPDATE` | Set to `true` or `1` to show the Legacy page and the database restore button. |

`JWT_SECRET` and `COOKIE_EXPIRATION_TIME_IN_HOURS` are in the sample file. The app does not read them. Session length follows `JWT_NUMBER_OF_DAYS_EXPIRATION`.

### Frontend environment

Create `frontend/.env` for Vite development:

```bash
VITE_LOCALHOST_DEV=true
VITE_IP_ADDRESS_DEV=
VITE_LOCAL_DEV_IP_ADDRESS=
```

`VITE_LOCALHOST_DEV=true` points the dev app at `http://localhost:3010/api`. To use another machine on the LAN instead, set `VITE_IP_ADDRESS_DEV=true` and `VITE_LOCAL_DEV_IP_ADDRESS` to that machine's address, and leave `VITE_LOCALHOST_DEV` empty. A production frontend build always calls `/api` on the same origin.

## How to run

### Development

Use two terminals. In `backend/.env` set `ENVIRONMENT=development` and `PORT=3010`.

```bash
npm run dev --prefix backend
```

```bash
npm run dev --prefix frontend
```

Open `http://localhost:5173`. The API allows that Vite origin when `ENVIRONMENT` is `development`.

Sign up from the login page. The first visit creates the database, tables, and media folders.

### One process

Use this when Express should serve the built frontend. Set `ENVIRONMENT` to `local` or `production`.

```bash
npm run build --prefix frontend
npm run run --prefix backend
```

Open `http://localhost:<PORT>`.

`local` and `production` both serve `frontend/dist`. `production` also enables Helmet, and auth cookies are marked `Secure`, so the site needs HTTPS.

The root `start` and `local` scripts call `npm run start` inside `backend`. That script is not defined. Start the API with `npm run run --prefix backend`. The root `dev` script builds the frontend and starts the API with nodemon. It does not start Vite.

### Tests

```bash
npm test --prefix backend
```

## Legacy tools

Set `ENABLE_LEGACY_UPDATE` to `true` or `1`, then restart the API. A Legacy item appears in the navigation. After you reveal the options, you can update legacy tables and rewrite stored video, MP3, and thumbnail paths. The Account page also shows **Restore database** in that mode.

## Layout

```text
frontend/     React 19 app (Vite, React Router, Sass)
backend/      Express 5 API
backend/media videos, audio, thumbnails, and subtitles
```

The API is mounted at `/api` (`auth`, `initialize`, `ytdlp`, `videos`, `mp3s`). Media files are served from `/media`.

## Stack

React, Vite, Sass, Express, MySQL, yt-dlp, and ffmpeg. WhisperX is optional.

## Acknowledgements

[yt-dlp](https://github.com/yt-dlp/yt-dlp) does the downloading.
