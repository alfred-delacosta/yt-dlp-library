import { useEffect, useRef, useState } from 'react';
import styles from './ActionSheet.module.scss';

export default function ActionSheet({ open, title, actions = [], onClose, confirm }) {
  const ref = useRef(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) setConfirming(false);
  }, [open]);

  function handleClick(action) {
    if (action.confirm) {
      setConfirming(true);
      return;
    }
    action.onClick?.();
    onClose?.();
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.handle} />
        <h2 className={styles.title}>{confirming ? (confirm?.title || 'Are you sure?') : title}</h2>
        {!confirming && (
          <div className={styles.list}>
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={`${styles.item} ${action.danger ? styles.danger : ''}`}
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
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                confirm?.onConfirm?.();
                onClose?.();
              }}
            >
              {confirm?.label || 'Delete'}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
