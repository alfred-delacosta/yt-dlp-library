import { useMemo } from 'react';
import { useInfiniteMedia } from '../../hooks/useInfiniteMedia';
import MediaCard from './MediaCard';
import styles from './MediaGrid.module.scss';

export default function MediaGrid({ items, query, hasMore, loadMore, loading, onOpen, onMenu, animateEnter = true }) {
  const sentinelRef = useInfiniteMedia(hasMore, loadMore, loading);
  const empty = !loading && items.length === 0;

  const cards = useMemo(
    () => items.map((item, index) => (
      <MediaCard
        key={`${item.mediaType}-${item.id}`}
        item={item}
        query={query}
        onOpen={onOpen}
        onMenu={onMenu}
        index={index}
        animateEnter={animateEnter}
      />
    )),
    [items, query, onOpen, onMenu, animateEnter]
  );

  if (empty) {
    return <p className={`${styles.empty} page-enter`}>Nothing here yet.</p>;
  }

  return (
    <>
      <div className={styles.grid}>{cards}</div>
      <div ref={sentinelRef} className={styles.sentinel} />
    </>
  );
}
