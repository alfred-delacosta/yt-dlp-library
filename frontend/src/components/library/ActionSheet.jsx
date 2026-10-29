import { useEffect, useRef, useState } from 'react';
import styles from './ActionSheet.module.scss';

const CLOSE_MS = 200;

function motionMs() {
  if (typeof window === 'undefined') return 0;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CLOSE_MS;
}

export default function ActionSheet({ open, title, actions = [], onClose, confirm }) {
  const ref = useRef(null);
  const cachedTitle = useRef(title);
  const cachedActions = useRef(actions);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [closing, setClosing] = useState(false);

  if (open) {
    cachedTitle.current = title;
    cachedActions.current = actions;
  }

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
    if (!open) {
      setConfirming(false);
      setPending(false);
    }
  }, [open]);

  function handleClick(action) {
    if (action.confirm) {
      setConfirming(true);
      return;
    }
    action.onClick?.();
    onClose?.();
  }

  const visibleTitle = (open ? title : cachedTitle.current) || 'Actions';
  const visibleActions = (open ? actions : cachedActions.current) || [];

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
        <h2 className={styles.title}>{confirming ? (confirm?.title || 'Are you sure?') : visibleTitle}</h2>
        {!confirming && (
          <div className={styles.list}>
            {visibleActions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className={`${styles.item} ${action.danger ? styles.danger : ''}`}
                style={{ '--i': index }}
                onClick={() => handleClick(action)}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
        {confirming && (
          <div className={styles.confirm}>
            <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={pending}
              onClick={async () => {
                if (pending) return;
                setPending(true);
                try {
                  await confirm?.onConfirm?.();
                  onClose?.();
                } catch {
                  // The action reports its own error. Keep the confirmation open.
                  setPending(false);
                }
              }}
            >
              {pending ? 'Deleting…' : (confirm?.label || 'Delete')}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
