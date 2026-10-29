import styles from './TagChips.module.scss';

export default function TagChips({ tags = [], max = 0, className = '' }) {
  const list = Array.isArray(tags) ? tags : [];
  const visible = max > 0 ? list.slice(0, max) : list;
  const extra = max > 0 ? Math.max(0, list.length - visible.length) : 0;
  if (visible.length === 0) return null;

  return (
    <span className={`${styles.chips} ${className}`.trim()}>
      {visible.map((tag) => (
        <span key={tag.id} className={styles.chip} title={tag.name}>
          {tag.name}
        </span>
      ))}
      {extra > 0 && <span className={styles.chip}>+{extra}</span>}
    </span>
  );
}
