import { Link } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import SearchField from '../search/SearchField';
import { useTheme } from '../../hooks/useTheme';
import styles from './TopBar.module.scss';

export default function TopBar() {
  const { theme, toggle } = useTheme();

  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.logo}>
        <span className={styles.mark}>yt</span>
        <span>Library</span>
      </Link>
      <div className={styles.search}>
        <SearchField />
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.iconBtn} onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
