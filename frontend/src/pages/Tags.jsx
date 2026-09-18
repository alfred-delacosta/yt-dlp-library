import styles from './pages.module.scss';

export default function Tags() {
  return (
    <div className={styles.stack}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tags</h1>
      </div>
      <div className={styles.emptyState}>
        Tags are coming next. You’ll be able to organize videos and MP3s with many-to-many labels from here.
      </div>
    </div>
  );
}
