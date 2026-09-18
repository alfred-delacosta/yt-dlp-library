import { useEffect, useMemo, useState } from 'react';
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
  const [menuItem, setMenuItem] = useState(null);
  const actions = useMediaActions();
  const navigate = useNavigate();

  useDebouncedSearch();

  useEffect(() => {
    setType(viewType);
    loadLibrary(viewType);
  }, [viewType, setType, loadLibrary]);

  const items = useMemo(() => {
    const source = viewType === 'mp3' ? mp3s : videos;
    return source
      .map((item) => ({ ...item, mediaType: viewType }))
      .sort((a, b) => new Date(b.downloadDate) - new Date(a.downloadDate));
  }, [videos, mp3s, viewType]);

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
