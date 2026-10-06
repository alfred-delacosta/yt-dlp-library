import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Search } from 'lucide-react';
import { getRecentSearches } from '../../lib/media';
import { useLibraryStore } from '../../stores/libraryStore';
import styles from './SearchField.module.scss';

export default function SearchField() {
  const query = useLibraryStore((s) => s.query);
  const setQuery = useLibraryStore((s) => s.setQuery);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState(getRecentSearches);
  const navigate = useNavigate();
  const location = useLocation();

  function goToLibrary() {
    const path = useLibraryStore.getState().type === 'mp3' ? '/audio' : '/';
    if (location.pathname !== '/' && location.pathname !== '/audio') navigate(path);
  }

  function handleChange(e) {
    goToLibrary();
    setQuery(e.target.value);
  }

  function handleFocus() {
    setRecent(getRecentSearches());
    setOpen(true);
  }

  function pick(term) {
    setQuery(term);
    setOpen(false);
    goToLibrary();
  }

  return (
    <div className={styles.wrap}>
      <Search size={16} className={styles.icon} />
      <input
        className={styles.input}
        type="search"
        placeholder="Search library"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        aria-label="Search library"
      />
      {open && !query && (
        <div className={styles.recent}>
          {recent.length === 0 && <div className={styles.empty}>Recent searches show up here</div>}
          {recent.map((term) => (
            <button key={term} type="button" className={styles.recentBtn} onMouseDown={() => pick(term)}>
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
