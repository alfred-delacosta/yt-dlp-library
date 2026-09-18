import Downloader from '../components/download/Downloader';
import styles from './pages.module.scss';

export default function Download() {
  return (
    <div className={styles.stack}>
      <div className={styles.header}>
        <h1 className={styles.title}>Download</h1>
      </div>
      <Downloader />
    </div>
  );
}
