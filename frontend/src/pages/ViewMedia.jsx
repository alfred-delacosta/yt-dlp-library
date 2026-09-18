import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  Book,
  ClosedCaption,
  Film,
  HardDriveDownload,
  Music,
  Pencil,
  SquareArrowOutUpRight,
  Trash2,
} from 'lucide-react';
import MediaPlayer from '../components/player/MediaPlayer';
import ProgressPanel from '../components/download/ProgressPanel';
import { fetchMp3ById, fetchVideoById } from '../lib/mediaActions';
import { formatDate } from '../lib/media';
import { useMediaActions } from '../hooks/useMediaActions';
import styles from './pages.module.scss';

export default function ViewMedia({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const actions = useMediaActions();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const record = type === 'mp3' ? await fetchMp3ById(id) : await fetchVideoById(id);
        if (!cancelled) setItem(record ? { ...record, mediaType: type } : null);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Could not load this item.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, type]);

  async function refresh() {
    const record = type === 'mp3' ? await fetchMp3ById(id) : await fetchVideoById(id);
    setItem(record ? { ...record, mediaType: type } : null);
  }

  if (error) return <p className={styles.emptyState}>{error}</p>;
  if (!item) return <p className={styles.count}>Loading…</p>;

  return (
    <div className={styles.stack}>
      <MediaPlayer item={item} />
      <div className={styles.playerMeta}>
        <h1 className={styles.title}>{item.name}</h1>
        <span className={styles.count}>{formatDate(item.downloadDate)}</span>
        {item.description && <div className={styles.description}>{item.description}</div>}
        <div className={styles.actions}>
          {type === 'video' && (
            <Link className="btn btn-ghost" to={`/edit/video/${item.id}`}>
              <Pencil size={16} /> Edit
            </Link>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => actions.downloadFile(item)}>
            <HardDriveDownload size={16} /> File
          </button>
          {item.link && (
            <a className="btn btn-ghost" href={item.link} target="_blank" rel="noreferrer">
              <SquareArrowOutUpRight size={16} /> Original
            </a>
          )}
          {type === 'video' && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => actions.jellyfin(item)}>
                <Film size={16} /> Jellyfin
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={async () => {
                  await actions.localSubtitles(item);
                  await refresh();
                }}
              >
                <ClosedCaption size={16} /> Subtitles
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={async () => {
                  await actions.whisperSubtitles(item);
                  await refresh();
                }}
              >
                <Book size={16} /> WhisperX subs
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => actions.whisperMp3(item)}>
                <Music size={16} /> WhisperX MP3
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              if (!window.confirm(`Delete “${item.name}”?`)) return;
              await actions.remove(item);
              navigate('/');
            }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
        <ProgressPanel log={actions.log} active={actions.busy} />
        {item.subtitles && <div className={styles.subtitles}>{item.subtitles}</div>}
      </div>
    </div>
  );
}
