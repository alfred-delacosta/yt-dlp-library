import { useEffect, useRef } from 'react';

export function useInfiniteMedia(hasMore, loadMore, loading) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) loadMore();
      },
      { rootMargin: '240px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore, loading]);

  return ref;
}
