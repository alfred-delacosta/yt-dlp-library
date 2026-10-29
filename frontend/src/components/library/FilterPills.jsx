import styles from './FilterPills.module.scss';

export default function FilterPills({ pills = [], value, onChange, ariaLabel = 'Filter' }) {
  if (!pills.length) return null;

  return (
    <div className={styles.row} role="tablist" aria-label={ariaLabel}>
      {pills.map((pill) => (
        <button
          key={pill.id}
          type="button"
          role="tab"
          aria-selected={String(value) === String(pill.id)}
          className={`${styles.pill} ${String(value) === String(pill.id) ? styles.active : ''}`}
          onClick={() => onChange(pill.id)}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
