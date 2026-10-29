import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { createTag, fetchTags, setMediaTags } from '../../lib/tags';
import styles from './TagPicker.module.scss';

const CLOSE_MS = 200;

function motionMs() {
  if (typeof window === 'undefined') return 0;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CLOSE_MS;
}

export default function TagPicker({ open, item, onClose, onSaved }) {
  const ref = useRef(null);
  const [closing, setClosing] = useState(false);
  const [tags, setTags] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      setClosing(false);
      if (!dialog.open) dialog.showModal();
      return undefined;
    }

    if (!dialog.open) return undefined;
    setClosing(true);
    const timeout = window.setTimeout(() => {
      if (dialog.open) dialog.close();
      setClosing(false);
    }, motionMs());
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open || !item) return undefined;
    let cancelled = false;
    setLoading(true);
    setDraft('');
    const assigned = new Set((item.tags || []).map((tag) => Number(tag.id)));
    setSelected(assigned);
    fetchTags()
      .then((list) => {
        if (!cancelled) setTags(list);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load tags.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, item]);

  function toggle(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    const name = draft.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const tag = await createTag(name);
      setTags((current) => [...current, tag].sort((a, b) => a.name.localeCompare(b.name)));
      setSelected((current) => new Set(current).add(Number(tag.id)));
      setDraft('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create tag.');
    } finally {
      setCreating(false);
    }
  }

  async function handleSave() {
    if (!item || saving) return;
    setSaving(true);
    try {
      const tagsForItem = await setMediaTags(item, [...selected]);
      onSaved?.(tagsForItem);
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update tags.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${closing ? styles.closing : ''}`}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.handle} />
        <h2 className={styles.title}>Tags for {item?.name || 'this item'}</h2>
        <form className={styles.create} onSubmit={handleCreate}>
          <input
            type="text"
            value={draft}
            maxLength={80}
            placeholder="New tag name"
            onChange={(e) => setDraft(e.target.value)}
            aria-label="New tag name"
          />
          <button className="btn btn-ghost" type="submit" disabled={creating || !draft.trim()}>
            {creating ? 'Adding…' : 'Add'}
          </button>
        </form>
        {loading ? (
          <p className={styles.muted}>Loading tags…</p>
        ) : tags.length === 0 ? (
          <p className={styles.muted}>No tags yet. Create one above.</p>
        ) : (
          <div className={styles.list} role="listbox" aria-multiselectable="true">
            {tags.map((tag) => {
              const checked = selected.has(Number(tag.id));
              return (
                <label key={tag.id} className={`${styles.item} ${checked ? styles.checked : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(Number(tag.id))}
                  />
                  <span>{tag.name}</span>
                </label>
              );
            })}
          </div>
        )}
        <div className={styles.actions}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
