import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Video, Music } from 'lucide-react';
import { createTag, deleteTag, fetchTags, renameTag } from '../lib/tags';
import { useLibraryStore } from '../stores/libraryStore';
import page from './pages.module.scss';
import styles from './Tags.module.scss';

export default function Tags() {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [busyId, setBusyId] = useState(null);
  const renameTagOnItems = useLibraryStore((s) => s.renameTagOnItems);
  const removeTagFromItems = useLibraryStore((s) => s.removeTagFromItems);

  async function load() {
    setLoading(true);
    try {
      setTags(await fetchTags());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load tags.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const name = draft.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const tag = await createTag(name);
      setTags((current) => [...current, tag].sort((a, b) => a.name.localeCompare(b.name)));
      setDraft('');
      toast.success('Tag created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create tag.');
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(tag) {
    const name = editName.trim();
    if (!name || busyId) return;
    setBusyId(tag.id);
    try {
      const updated = await renameTag(tag.id, name);
      setTags((current) =>
        current
          .map((item) => (item.id === tag.id ? { ...item, ...updated } : item))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      renameTagOnItems(tag.id, updated.name);
      setEditingId(null);
      toast.success('Tag renamed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not rename tag.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(tag) {
    if (busyId) return;
    if (!window.confirm(`Delete “${tag.name}”? It will be removed from all videos and audio.`)) return;
    setBusyId(tag.id);
    try {
      await deleteTag(tag.id);
      setTags((current) => current.filter((item) => item.id !== tag.id));
      removeTagFromItems(tag.id);
      toast.success('Tag deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete tag.');
    } finally {
      setBusyId(null);
    }
  }

  function openLibrary(tag) {
    if (tag.videoCount > 0) navigate(`/?tag=${tag.id}`);
    else if (tag.mp3Count > 0) navigate(`/audio?tag=${tag.id}`);
  }

  return (
    <div className={`${page.stack} page-enter`}>
      <div className={page.header}>
        <h1 className={page.title}>Tags</h1>
        <span className={page.count}>{tags.length} tags</span>
      </div>
      <form className={styles.create} onSubmit={handleCreate}>
        <input
          type="text"
          value={draft}
          maxLength={80}
          placeholder="New tag name"
          onChange={(e) => setDraft(e.target.value)}
          aria-label="New tag name"
        />
        <button className="btn btn-primary" type="submit" disabled={creating || !draft.trim()}>
          {creating ? 'Adding…' : 'Create'}
        </button>
      </form>
      {loading ? (
        <p className={page.count}>Loading…</p>
      ) : tags.length === 0 ? (
        <div className={page.emptyState}>
          No tags yet. Create one to organize videos and audio.
        </div>
      ) : (
        <div className={styles.list}>
          {tags.map((tag, index) => (
            <article
              key={tag.id}
              className={`${styles.card} rise-in`}
              style={{ '--i': index }}
            >
              {editingId === tag.id ? (
                <form
                  className={styles.rename}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRename(tag);
                  }}
                >
                  <input
                    type="text"
                    value={editName}
                    maxLength={80}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label="Rename tag"
                    autoFocus
                  />
                  <button className="btn btn-primary" type="submit" disabled={busyId === tag.id || !editName.trim()}>
                    Save
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={busyId === tag.id}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.nameBtn}
                    onClick={() => openLibrary(tag)}
                    disabled={tag.videoCount + tag.mp3Count === 0}
                  >
                    <h2 className={styles.name}>{tag.name}</h2>
                    <span className={styles.meta}>
                      <span><Video size={14} /> {tag.videoCount} videos</span>
                      <span><Music size={14} /> {tag.mp3Count} audio</span>
                    </span>
                  </button>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditingId(tag.id);
                        setEditName(tag.name);
                      }}
                      disabled={busyId === tag.id}
                    >
                      <Pencil size={16} /> Rename
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(tag)}
                      disabled={busyId === tag.id}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
