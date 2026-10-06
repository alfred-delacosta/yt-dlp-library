import { MoreVertical, Music } from 'lucide-react';
import { highlightText, mediaUrl, formatDuration } from '../../lib/media';
import styles from './MediaCard.module.scss';

export default function MediaCard({ item, query, onOpen, onMenu }) {
  const isVideo = item.mediaType === 'video';
  const thumb = isVideo ? mediaUrl(item.thumbnailPath) : '';
  const highlighted = highlightText(item.name, query);

  return (
    <article className={styles.card}>
      <div className={styles.thumbWrap}>
        <button type="button" className={styles.thumbButton} onClick={() => onOpen(item)} aria-label={item.name}>
          {thumb ? (
            <img className={styles.thumb} src={thumb} alt="" loading="lazy" />
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
      </button>
    </article>
  );
}
