import { useMemo } from 'react';
import { useInfiniteMedia } from '../../hooks/useInfiniteMedia';
import MediaCard from './MediaCard';
import styles from './MediaGrid.module.scss';

export default function MediaGrid({ items, query, hasMore, loadMore, loading, onOpen, onMenu }) {
  const sentinelRef = useInfiniteMedia(hasMore, loadMore, loading);
  const empty = !loading && items.length === 0;

  const cards = useMemo(
    () => items.map((item) => (
      <MediaCard
        key={`${item.mediaType}-${item.id}`}
        item={item}
        query={query}
        onOpen={onOpen}
        onMenu={onMenu}
      />
    )),
    [items, query, onOpen, onMenu]
  );

  if (empty) {
    return <p className={styles.empty}>Nothing here yet.</p>;
  }

  return (
    <>
      <div className={styles.grid}>{cards}</div>
      <div ref={sentinelRef} className={styles.sentinel} />
    </>
  );
}
