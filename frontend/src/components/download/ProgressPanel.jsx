import { useEffect, useRef, useState } from 'react';
import { parseProgressPercent } from '../../lib/sse';
import styles from './ProgressPanel.module.scss';

export default function ProgressPanel({ log, active }) {
  const [open, setOpen] = useState(false);
  const logRef = useRef(null);
  const percent = parseProgressPercent(log);
  const indeterminate = active && percent == null;

  useEffect(() => {
    if (open && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log, open]);

  if (!log && !active) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.bar} aria-hidden="true">
        <div
          className={`${styles.fill} ${indeterminate ? styles.fillIndeterminate : ''}`}
          style={indeterminate ? undefined : { width: `${percent ?? (active ? 8 : 100)}%` }}
        />
      </div>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? 'Hide log' : 'Show log'}
      </button>
      <div className={`${styles.logWrap} ${open ? styles.logOpen : ''}`}>
        <div className={styles.logClip}>
          <div className={styles.log} ref={logRef}>
            {log || 'Waiting…'}
          </div>
        </div>
      </div>
    </div>
  );
}
