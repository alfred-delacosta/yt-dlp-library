import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Book,
  ClosedCaption,
  Film,
  HardDriveDownload,
  Music,
  Pencil,
  SquareArrowOutUpRight,
  Tags,
  Trash2,
} from 'lucide-react';
import MediaGrid from '../components/library/MediaGrid';
import MediaSkeleton from '../components/library/MediaSkeleton';
import ActionSheet from '../components/library/ActionSheet';
import ProgressPanel from '../components/download/ProgressPanel';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { useMediaActions } from '../hooks/useMediaActions';
import { useLibraryStore } from '../stores/libraryStore';
import styles from './pages.module.scss';

export default function Library() {
  const location = useLocation();
  const viewType = location.pathname === '/audio' ? 'mp3' : 'video';
  const videos = useLibraryStore((s) => s.videos);
  const mp3s = useLibraryStore((s) => s.mp3s);
  const query = useLibraryStore((s) => s.query);
  const loading = useLibraryStore((s) => s.loading);
  const searching = useLibraryStore((s) => s.searching);
  const error = useLibraryStore((s) => s.error);
  const visibleCount = useLibraryStore((s) => s.visibleCount);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const setType = useLibraryStore((s) => s.setType);
  const loadMore = useLibraryStore((s) => s.loadMore);
  const sortDirection = useLibraryStore((s) => s.sortDirection);
  const setSortDirection = useLibraryStore((s) => s.setSortDirection);
  const scrollPosition = useLibraryStore((s) => s.scrollPosition);
  const setScrollPosition = useLibraryStore((s) => s.setScrollPosition);
  const [menuItem, setMenuItem] = useState(null);
  const actions = useMediaActions();
  const navigate = useNavigate();

  useDebouncedSearch();

  useEffect(() => {
    setType(viewType);
    loadLibrary(viewType);
  }, [viewType, setType, loadLibrary]);

  const hasRestoredRef = useRef(false);

  // Restore scroll position when returning from a video/audio detail page.
  // Timeout gives time for the (previously loaded) grid items + images to lay out.
  useEffect(() => {
    if (hasRestoredRef.current || scrollPosition <= 0) {
      return;
    }

    hasRestoredRef.current = true;

    const timeout = setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'auto' });
    }, 100);

    return () => clearTimeout(timeout);
  }, [scrollPosition]);

  // Continuously save current scroll while on the library page
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const handleScroll = () => {
      setScrollPosition(window.scrollY || 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollPosition]);

  const items = useMemo(() => {
    const source = viewType === 'mp3' ? mp3s : videos;
    const sorted = [...source].map((item) => ({ ...item, mediaType: viewType }));
    sorted.sort((a, b) => {
      const da = new Date(a.downloadDate || 0).getTime();
      const db = new Date(b.downloadDate || 0).getTime();
      return sortDirection === 'desc' ? db - da : da - db;
    });
    return sorted;
  }, [videos, mp3s, viewType, sortDirection]);

  const visible = items.slice(0, visibleCount);
  const hasMore = visible.length < items.length;

  const sheetActions = menuItem
    ? [
        menuItem.mediaType === 'video' && {
          id: 'edit',
          label: 'Edit',
          icon: <Pencil size={18} />,
          onClick: () => actions.editItem(menuItem),
        },
        {
          id: 'download',
          label: 'Download file',
          icon: <HardDriveDownload size={18} />,
          onClick: () => actions.downloadFile(menuItem),
        },
        menuItem.link && {
          id: 'link',
          label: 'Original link',
          icon: <SquareArrowOutUpRight size={18} />,
          onClick: () => window.open(menuItem.link, '_blank'),
        },
        {
          id: 'tags',
          label: 'Tags (soon)',
          icon: <Tags size={18} />,
          onClick: () => navigate('/tags'),
        },
        menuItem.mediaType === 'video' && {
          id: 'jellyfin',
          label: 'Jellyfin',
          icon: <Film size={18} />,
          onClick: () => actions.jellyfin(menuItem),
        },
        menuItem.mediaType === 'video' && {
          id: 'subs',
          label: 'Generate subtitles',
          icon: <ClosedCaption size={18} />,
          onClick: () => actions.localSubtitles(menuItem),
        },
        menuItem.mediaType === 'video' && {
          id: 'whisper-subs',
          label: 'WhisperX subtitles',
          icon: <Book size={18} />,
          onClick: () => actions.whisperSubtitles(menuItem),
        },
        menuItem.mediaType === 'video' && {
          id: 'whisper-mp3',
          label: 'WhisperX convert to MP3',
          icon: <Music size={18} />,
          onClick: () => actions.whisperMp3(menuItem),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 size={18} />,
          danger: true,
          confirm: true,
        },
      ].filter(Boolean)
    : [];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{viewType === 'mp3' ? 'Audio' : 'Videos'}</h1>
        <span className={styles.count}>{items.length} items</span>
      </div>
      <div className={styles.sortControls}>
        <span className={styles.sortLabel}>Sort by date</span>
        <button
          type="button"
          className={`${styles.sortBtn} ${sortDirection === 'desc' ? styles.sortActive : ''}`}
          onClick={() => setSortDirection('desc')}
        >
          Newest first
        </button>
        <button
          type="button"
          className={`${styles.sortBtn} ${sortDirection === 'asc' ? styles.sortActive : ''}`}
          onClick={() => setSortDirection('asc')}
        >
          Oldest first
        </button>
      </div>
      {error && <p className={styles.emptyState}>{error}</p>}
      {(loading || searching) && items.length === 0 ? (
        <MediaSkeleton />
      ) : (
        <MediaGrid
          items={visible}
          query={query}
          hasMore={hasMore}
          loadMore={loadMore}
          loading={loading || searching}
          onOpen={actions.openItem}
          onMenu={setMenuItem}
        />
      )}
      {(actions.busy || actions.log) && (
        <div style={{ marginTop: '1rem' }}>
          <ProgressPanel log={actions.log} active={actions.busy} />
        </div>
      )}
      <ActionSheet
        open={Boolean(menuItem)}
        title={menuItem?.name || 'Actions'}
        actions={sheetActions}
        onClose={() => setMenuItem(null)}
        confirm={{
          title: `Delete “${menuItem?.name}”?`,
          label: 'Delete',
          onConfirm: () => menuItem && actions.remove(menuItem),
        }}
      />
    </div>
  );
}
