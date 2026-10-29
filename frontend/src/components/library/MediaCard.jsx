import { useState } from 'react';
import { MoreVertical, Music } from 'lucide-react';
import { highlightText, mediaUrl, formatDuration } from '../../lib/media';
import TagChips from './TagChips';
import styles from './MediaCard.module.scss';

export default function MediaCard({ item, query, onOpen, onMenu, index = 0, animateEnter = true }) {
  const isVideo = item.mediaType === 'video';
  const thumb = isVideo ? mediaUrl(item.thumbnailPath) : '';
  const highlighted = highlightText(item.name, query);
  const [loaded, setLoaded] = useState(false);

  return (
    <article
      className={`${styles.card} ${animateEnter ? 'rise-in' : ''}`}
      style={{ '--i': index < 12 ? index : 0 }}
    >
      <div className={styles.thumbWrap}>
        <button type="button" className={styles.thumbButton} onClick={() => onOpen(item)} aria-label={item.name}>
          {thumb ? (
            <img
              className={`${styles.thumb} ${loaded ? styles.thumbLoaded : ''}`}
              src={thumb}
              alt=""
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          ) : (
            <div className={styles.placeholder}>
              <Music size={32} />
            </div>
          )}
        </button>
          <button
            type="button"
            className={styles.more}
            onClick={() => onMenu(item)}
            aria-label="More actions"
          >
            <MoreVertical size={16} />
          </button>
          {item.duration && (
            <span className={styles.duration}>{formatDuration(item.duration)}</span>
          )}
        </div>
      <button type="button" className={styles.meta} onClick={() => onOpen(item)}>
        <div className={styles.title}>
          {typeof highlighted === 'string' ? highlighted : (
            <>
              {highlighted.before}
              <mark>{highlighted.match}</mark>
              {highlighted.after}
            </>
          )}
        </div>
        <div className={styles.sub}>{isVideo ? 'Video' : 'Audio'}</div>
        <TagChips tags={item.tags} max={2} />
      </button>
    </article>
  );
}
