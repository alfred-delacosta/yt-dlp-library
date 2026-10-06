import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import {
  deleteMp3,
  deleteVideo,
  generateLocalSubtitles,
  transferToJellyfin,
  whisperXConvertToMp3,
  whisperXGenerateSubtitles,
} from '../lib/mediaActions';
import { mediaUrl } from '../lib/media';
import { useLibraryStore } from '../stores/libraryStore';

export function useMediaActions() {
  const navigate = useNavigate();
  const removeVideo = useLibraryStore((s) => s.removeVideo);
  const removeMp3 = useLibraryStore((s) => s.removeMp3);
  const invalidateMp3s = useLibraryStore((s) => s.invalidateMp3s);
  const [log, setLog] = useState('');
  const [busy, setBusy] = useState(false);

  function openItem(item) {
    const { setScrollPosition } = useLibraryStore.getState();
    setScrollPosition(window.scrollY || 0);
    navigate(item.mediaType === 'mp3' ? `/mp3/${item.id}` : `/video/${item.id}`);
  }

  function editItem(item) {
    if (item.mediaType === 'mp3') return;
    const { setScrollPosition } = useLibraryStore.getState();
    setScrollPosition(window.scrollY || 0);
    navigate(`/edit/video/${item.id}`);
  }

  function downloadFile(item) {
    const href = mediaUrl(item.mediaType === 'mp3' ? item.mp3Path : item.videoPath);
    if (!href) return;
    const a = document.createElement('a');
    a.href = href;
    a.download = '';
    a.click();
  }

  async function jellyfin(item) {
    await toast.promise(transferToJellyfin(item.id), {
      loading: 'Moving to Jellyfin…',
      success: 'Copied to Jellyfin',
      error: 'Jellyfin transfer failed',
    });
  }

  async function localSubtitles(item) {
    setBusy(true);
    setLog('');
    try {
      await toast.promise(generateLocalSubtitles(item.id, setLog), {
        loading: 'Generating subtitles…',
        success: 'Subtitles generated',
        error: 'Subtitle generation failed',
      });
    } finally {
      setBusy(false);
    }
  }

  async function whisperSubtitles(item) {
    await toast.promise(whisperXGenerateSubtitles(item.id), {
      loading: 'WhisperX is generating subtitles…',
      success: 'WhisperX subtitles ready',
      error: 'WhisperX subtitle generation failed',
    });
  }

  async function whisperMp3(item) {
    await toast.promise(whisperXConvertToMp3(item.id), {
      loading: 'WhisperX is converting to MP3…',
      success: 'Converted to MP3',
      error: 'WhisperX conversion failed',
    });
    invalidateMp3s();
  }

  async function remove(item) {
    if (item.mediaType === 'mp3') {
      await toast.promise(deleteMp3(item.id), {
        loading: 'Deleting…',
        success: 'MP3 deleted',
        error: 'Could not delete MP3',
      });
      removeMp3(item.id);
    } else {
      await toast.promise(deleteVideo(item.id), {
        loading: 'Deleting…',
        success: 'Video deleted',
        error: 'Could not delete video',
      });
      removeVideo(item.id);
    }
  }

  return {
    log,
    busy,
    openItem,
    editItem,
    downloadFile,
    jellyfin,
    localSubtitles,
    whisperSubtitles,
    whisperMp3,
    remove,
  };
}
