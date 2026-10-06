import { useEffect, useRef } from 'react';
import { useLibraryStore } from '../stores/libraryStore';

export function useDebouncedSearch(delay = 200) {
  const query = useLibraryStore((s) => s.query);
  const type = useLibraryStore((s) => s.type);
  const search = useLibraryStore((s) => s.search);
  const controllerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    controllerRef.current?.abort();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      controllerRef.current = new AbortController();
      search(query, controllerRef.current.signal);
    }, delay);
    return () => {
      clearTimeout(timerRef.current);
      controllerRef.current?.abort();
    };
  }, [query, type, delay, search]);
}
