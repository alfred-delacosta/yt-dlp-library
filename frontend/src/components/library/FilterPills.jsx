import styles from './FilterPills.module.scss';

const PILLS = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'mp3', label: 'Audio' },
];

export default function FilterPills({ value, onChange }) {
  return (
    <div className={styles.row} role="tablist" aria-label="Filter media">
      {PILLS.map((pill) => (
        <button
          key={pill.id}
          type="button"
          role="tab"
          aria-selected={value === pill.id}
          className={`${styles.pill} ${value === pill.id ? styles.active : ''}`}
          onClick={() => onChange(pill.id)}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
