import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/axios';
import { readSseStream } from '../../lib/sse';
import { useLibraryStore } from '../../stores/libraryStore';
import ProgressPanel from './ProgressPanel';
import styles from './Downloader.module.scss';

export default function Downloader() {
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadType, setDownloadType] = useState('mp4');
  const [log, setLog] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setLog('');
    toast.loading('Downloading…');
    try {
      const response = await api.post(
        `/ytdlp/download/${downloadType}`,
        { videoUrl },
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
      loadLibrary();
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('There was an error with the download.');
    } finally {
      setLoading(false);
    }
  }

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
        />
      </div>
      <div className={styles.row}>
        <label htmlFor="downloadType">Type</label>
        <select id="downloadType" name="downloadType" value={downloadType} onChange={(e) => setDownloadType(e.target.value)}>
          <option value="mp4">MP4</option>
          <option value="mp3">MP3</option>
          <option value="x">X / Twitter</option>
          <option value="regular">Best</option>
        </select>
      </div>
      <div className={styles.actions}>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Downloading…' : 'Download'}
        </button>
      </div>
      <ProgressPanel log={log} active={loading} />
    </form>
  );
}
