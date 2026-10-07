import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import MediaSkeleton from '../components/library/MediaSkeleton';
import { fetchDuplicateVideos, removeDuplicateVideoRows } from '../lib/mediaActions';
import { formatDate, mediaUrl } from '../lib/media';
import page from './pages.module.scss';
import styles from './Duplicates.module.scss';

const SECTIONS = [
  { id: 'link', title: 'Same link', empty: 'No videos share a source link.' },
  { id: 'title', title: 'Same title', empty: 'No videos share a title.' },
  { id: 'path', title: 'Same file', empty: 'No videos share a file path.' },
];

export default function Duplicates() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(null);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDuplicateVideos();
      setGroups(data);
      setSelected({});
    } catch (err) {
      setError(err.response?.data?.message || 'Could not scan for duplicate videos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function selectionKey(sectionId, groupKey) {
    return `${sectionId}:${groupKey}`;
  }

  function selectedIds(sectionId, groupKey) {
    return selected[selectionKey(sectionId, groupKey)] || [];
  }

  function toggle(sectionId, groupKey, id) {
    const key = selectionKey(sectionId, groupKey);
    setSelected((current) => {
      const next = new Set(current[key] || []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...current, [key]: [...next] };
    });
  }

  async function removeIds(ids, message) {
    if (busy || ids.length === 0) return;
    if (!window.confirm(message)) return;
    setBusy(true);
    try {
      await removeDuplicateVideoRows(ids);
      toast.success(ids.length === 1 ? 'Database entry removed.' : `${ids.length} database entries removed.`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove the database entries.');
    } finally {
      setBusy(false);
    }
  }

  const totalGroups = groups
    ? SECTIONS.reduce((sum, section) => sum + (groups[section.id]?.length || 0), 0)
    : 0;

  return (
    <div className={page.stack}>
      <div className={page.header}>
        <h1 className={page.title}>Duplicate videos</h1>
      </div>
      <p className={styles.intro}>
        Removing an entry deletes that video row and its thumbnail row. Video, thumbnail, and subtitle files stay on disk.
      </p>

      {loading && !groups && <MediaSkeleton count={3} />}

      {error && (
        <div className={page.error} role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-ghost" onClick={load}>Try again</button>
        </div>
      )}

      {groups && totalGroups === 0 && (
        <div className={page.emptyState}>No duplicate videos found.</div>
      )}

      {groups && totalGroups > 0 && SECTIONS.map((section) => (
        <Section
          key={section.id}
          section={section}
          groups={groups[section.id] || []}
          busy={busy}
          selectedIds={(groupKey) => selectedIds(section.id, groupKey)}
          onToggle={(groupKey, id) => toggle(section.id, groupKey, id)}
          onRemove={removeIds}
          onOpen={(id) => navigate(`/video/${id}`)}
        />
      ))}
    </div>
  );
}

function Section({ section, groups, busy, selectedIds, onToggle, onRemove, onOpen }) {
  return (
    <section>
      <div className={page.header}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <span className={page.count}>{groups.length} {groups.length === 1 ? 'group' : 'groups'}</span>
      </div>
      {groups.length === 0 && <div className={page.emptyState}>{section.empty}</div>}
      <div className={page.stack}>
        {groups.map((group) => (
          <Group
            key={group.key}
            group={group}
            busy={busy}
            selected={selectedIds(group.key)}
            onToggle={(id) => onToggle(group.key, id)}
            onRemove={onRemove}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

function Group({ group, busy, selected, onToggle, onRemove, onOpen }) {
  const selectedInGroup = group.videos.filter((video) => selected.includes(video.id));

  function removeSelected() {
    const count = selectedInGroup.length;
    const noun = count === 1 ? 'database entry' : 'database entries';
    onRemove(
      selectedInGroup.map((video) => video.id),
      `Remove ${count} ${noun}? The files stay on disk.`,
    );
  }

  function keep(video) {
    const others = group.videos.filter((item) => item.id !== video.id);
    const count = others.length;
    const message = count === 1
      ? 'Remove the other database entry in this group? The files stay on disk.'
      : `Remove the other ${count} database entries in this group? The files stay on disk.`;
    onRemove(others.map((item) => item.id), message);
  }

  return (
    <article className={styles.group}>
      <div className={styles.groupHead}>
        <div>
          <h3 className={styles.groupLabel}>{group.label}</h3>
          <div className={page.count}>{group.videos.length} entries</div>
        </div>
        <button type="button" className="btn btn-danger" disabled={busy || selectedInGroup.length === 0} onClick={removeSelected}>
          Remove selected
        </button>
      </div>
      {group.videos.map((video) => (
        <div className={styles.row} key={video.id}>
          <div className={styles.body}>
            <input
              className={styles.check}
              type="checkbox"
              checked={selected.includes(video.id)}
              onChange={() => onToggle(video.id)}
              aria-label={`Select ${video.name}`}
            />
            {video.thumbnailPath ? (
              <img className={styles.thumb} src={mediaUrl(video.thumbnailPath)} alt="" loading="lazy" />
            ) : (
              <div className={styles.placeholder} />
            )}
            <div className={styles.meta}>
              <strong className={styles.name}>{video.name}</strong>
              <div className={styles.sub}>{formatDate(video.downloadDate)} · #{video.id}</div>
              {video.link && <div className={styles.sub}>{video.link}</div>}
              <div className={styles.sub}>{video.serverPath || video.videoPath}</div>
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={() => onOpen(video.id)}>Open</button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => onRemove([video.id], 'Remove this database entry? The video file, thumbnail file, and subtitles file stay on disk.')}
            >
              Remove entry
            </button>
            <button type="button" className="btn btn-danger" disabled={busy} onClick={() => keep(video)}>
              Keep this one
            </button>
          </div>
        </div>
      ))}
    </article>
  );
}
