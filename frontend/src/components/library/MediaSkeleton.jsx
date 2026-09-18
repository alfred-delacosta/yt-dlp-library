import styles from './MediaSkeleton.module.scss';

export default function MediaSkeleton({ count = 8 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.thumb} />
          <div className={styles.line} />
          <div className={styles.lineShort} />
        </div>
      ))}
    </div>
  );
}
