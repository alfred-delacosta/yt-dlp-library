import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/axios';
import { readSseStream } from '../../lib/sse';
import {
  loadDownloadOptions,
  saveDownloadOptions,
  SUPPORTED_BROWSERS,
} from '../../lib/downloadOptions';
import { useLibraryStore } from '../../stores/libraryStore';
import ProgressPanel from './ProgressPanel';
import styles from './Downloader.module.scss';

function browserLabel(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function Downloader() {
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const invalidateMp3s = useLibraryStore((s) => s.invalidateMp3s);
  const invalidateVideos = useLibraryStore((s) => s.invalidateVideos);
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadType, setDownloadType] = useState('mp4');
  const [options, setOptions] = useState(() => loadDownloadOptions());
  const [log, setLog] = useState('');
  const [loading, setLoading] = useState(false);
  const skipFirstSave = useRef(true);

  const { writeDescription, writeThumbnail, cookieSource, browser } = options;

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveDownloadOptions(options);
  }, [options]);

  function updateOption(patch) {
    setOptions((prev) => ({ ...prev, ...patch }));
  }

  async function handleFocus() {
    try {
      if (!navigator.clipboard?.readText) return;
      const text = await navigator.clipboard.readText();
      if (text && /^https?:\/\//i.test(text) && !videoUrl) setVideoUrl(text.trim());
    } catch {
      /* permission denied is fine */
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (cookieSource === 'browser' && !browser) {
      toast.error('Select a browser for cookies.');
      return;
    }
    setLoading(true);
    setLog('');
    toast.loading('Downloading…');
    try {
      const response = await api.post(
        `/ytdlp/download/${downloadType}`,
        {
          videoUrl,
          writeDescription,
          writeThumbnail,
          cookieSource,
          browser: cookieSource === 'browser' ? browser : undefined,
        },
        {
          headers: { Accept: 'text/event-stream' },
          responseType: 'stream',
          adapter: 'fetch',
          timeout: 30 * 60 * 1000,
        }
      );
      await readSseStream(response, setLog);
      toast.dismiss();
      toast.success('Download completed');
      setVideoUrl('');
      const downloaded = downloadType === 'mp3' ? 'mp3' : 'video';
      if (downloaded === 'mp3') invalidateMp3s();
      else invalidateVideos();
      const current = useLibraryStore.getState().type;
      if (downloaded === current) await loadLibrary(current, { force: true });
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('There was an error with the download.');
    } finally {
      setLoading(false);
    }
  }

  const thumbnailLabel = downloadType === 'mp3' ? 'Embed thumbnail' : 'Save thumbnail';

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="videoUrl">Video URL</label>
        <input
          id="videoUrl"
          name="videoUrl"
          type="url"
          required
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onFocus={handleFocus}
          placeholder="https://"
          disabled={loading}
        />
      </div>
      <div className={styles.row}>
        <label htmlFor="downloadType">Type</label>
        <select
          id="downloadType"
          name="downloadType"
          value={downloadType}
          onChange={(e) => setDownloadType(e.target.value)}
          disabled={loading}
        >
          <option value="mp4">MP4</option>
          <option value="mp3">MP3</option>
          <option value="x">X / Twitter</option>
          <option value="regular">Best</option>
        </select>
      </div>

      <fieldset className={styles.options} disabled={loading}>
        <legend className={styles.optionsLegend}>Options</legend>

        <label className={styles.option}>
          <input
            type="checkbox"
            checked={writeDescription}
            onChange={(e) => updateOption({ writeDescription: e.target.checked })}
          />
          <span>Save description</span>
        </label>

        <label className={styles.option}>
          <input
            type="checkbox"
            checked={writeThumbnail}
            onChange={(e) => updateOption({ writeThumbnail: e.target.checked })}
          />
          <span>{thumbnailLabel}</span>
        </label>

        <div className={styles.cookieSource}>
          <span className={styles.cookieSourceLabel} id="cookieSourceLabel">
            Cookies
          </span>
          <div
            className={styles.cookieSourceChoices}
            role="radiogroup"
            aria-labelledby="cookieSourceLabel"
          >
            <label className={styles.option}>
              <input
                type="radio"
                name="cookieSource"
                value="none"
                checked={cookieSource === 'none'}
                onChange={() => updateOption({ cookieSource: 'none' })}
              />
              <span>Off</span>
            </label>
            <label className={styles.option}>
              <input
                type="radio"
                name="cookieSource"
                value="browser"
                checked={cookieSource === 'browser'}
                onChange={() => updateOption({ cookieSource: 'browser' })}
              />
              <span>From installed browser</span>
            </label>
            <label className={styles.option}>
              <input
                type="radio"
                name="cookieSource"
                value="harvest"
                checked={cookieSource === 'harvest'}
                onChange={() => updateOption({ cookieSource: 'harvest' })}
              />
              <span>Auto-harvest (Playwright)</span>
            </label>
          </div>
        </div>

        {cookieSource === 'browser' && (
          <div className={styles.browserRow}>
            <label htmlFor="cookieBrowser">Browser</label>
            <select
              id="cookieBrowser"
              name="cookieBrowser"
              value={browser}
              onChange={(e) => updateOption({ browser: e.target.value })}
              required={cookieSource === 'browser'}
            >
              {SUPPORTED_BROWSERS.map((name) => (
                <option key={name} value={name}>
                  {browserLabel(name)}
                </option>
              ))}
            </select>
            <p className={styles.hint}>
              yt-dlp reads cookies from the selected browser on this machine. Close the browser if
              cookie access fails.
            </p>
          </div>
        )}

        {cookieSource === 'harvest' && (
          <div className={styles.browserRow}>
            <p className={styles.hint}>
              Opens Google Chrome on the server, visits the URL, starts playback when possible,
              exports cookies for yt-dlp, then closes the browser. Chrome must be installed on the
              host.
            </p>
          </div>
        )}
      </fieldset>

      <div className={styles.actions}>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Downloading…' : 'Download'}
        </button>
      </div>
      <ProgressPanel log={log} active={loading} />
    </form>
  );
}
