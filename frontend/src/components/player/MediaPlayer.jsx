import { mediaUrl, subtitleTrackUrl, hasSubtitles } from '../../lib/media';
import styles from './MediaPlayer.module.scss';

export default function MediaPlayer({ item }) {
  if (!item) return null;
  const isVideo = item.mediaType === 'video' || item.videoPath;
  const src = mediaUrl(isVideo ? item.videoPath : item.mp3Path);
  const poster = mediaUrl(item.thumbnailPath);

  if (!isVideo) {
    return (
      <div className={styles.audioWrap}>
        <audio className={styles.audio} controls src={src} preload="metadata" />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <video className={styles.video} controls preload="metadata" src={src} poster={poster || undefined}>
        {hasSubtitles(item) && (
          <track src={subtitleTrackUrl(item)} kind="subtitles" srcLang="en" label="English" default />
        )}
      </video>
    </div>
  );
}
