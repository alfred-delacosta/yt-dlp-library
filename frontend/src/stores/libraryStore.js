import { create } from 'zustand';
import { api } from '../lib/axios';
import { pushRecentSearch } from '../lib/media';

const PAGE_SIZE = 24;

function isAudioType(type) {
  return type === 'mp3';
}

export const useLibraryStore = create((set, get) => ({
  videos: [],
  mp3s: [],
  browseVideos: [],
  browseMp3s: [],
  query: '',
  type: 'video',
  loading: false,
  searching: false,
  videosHydrated: false,
  mp3sHydrated: false,
  visibleCount: PAGE_SIZE,
  error: null,

  loadLibrary: async (type, { force = false } = {}) => {
    const view = type || get().type || 'video';
    const audio = isAudioType(view);
    set({ type: audio ? 'mp3' : 'video' });

    if (get().query.trim()) {
      set({ loading: false });
      return;
    }

    if (!force) {
      if (audio && get().mp3sHydrated) {
        set({ visibleCount: PAGE_SIZE, loading: false });
        return;
      }
      if (!audio && get().videosHydrated) {
        set({ visibleCount: PAGE_SIZE, loading: false });
        return;
      }
    }

    set({ loading: true, error: null });
    try {
      if (audio) {
        const mp3Res = await api.get('/mp3s');
        const mp3s = Array.isArray(mp3Res.data) ? mp3Res.data : [];
        set({
          mp3s,
          browseMp3s: mp3s,
          mp3sHydrated: true,
          loading: false,
          visibleCount: PAGE_SIZE,
        });
      } else {
        const videoRes = await api.get('/videos');
        const videos = Array.isArray(videoRes.data) ? videoRes.data : [];
        set({
          videos,
          browseVideos: videos,
          videosHydrated: true,
          loading: false,
          visibleCount: PAGE_SIZE,
        });
      }
    } catch (error) {
      console.error(error);
      set({ loading: false, error: 'Could not load library' });
    }
  },

  setQuery: (query) => set({ query }),

  search: async (term, signal) => {
    const type = get().type || 'video';
    const audio = isAudioType(type);
    const q = String(term ?? get().query).trim();
    if (!q) {
      if (audio) {
        if (!get().mp3sHydrated) return;
        set({
          mp3s: get().browseMp3s,
          searching: false,
          visibleCount: PAGE_SIZE,
        });
      } else {
        if (!get().videosHydrated) return;
        set({
          videos: get().browseVideos,
          searching: false,
          visibleCount: PAGE_SIZE,
        });
      }
      return;
    }
    set({ searching: true });
    try {
      if (audio) {
        const mp3Res = await api.post('/mp3s/search', { searchTerm: q }, { signal });
        if (get().query.trim() !== q || get().type !== 'mp3') return;
        pushRecentSearch(q);
        set({
          mp3s: Array.isArray(mp3Res.data) ? mp3Res.data : [],
          searching: false,
          visibleCount: PAGE_SIZE,
        });
      } else {
        const videoRes = await api.post('/videos/search', { searchTerm: q }, { signal });
        if (get().query.trim() !== q || get().type !== 'video') return;
        pushRecentSearch(q);
        set({
          videos: Array.isArray(videoRes.data) ? videoRes.data : [],
          searching: false,
          visibleCount: PAGE_SIZE,
        });
      }
    } catch (error) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return;
      console.error(error);
      set({ searching: false, error: 'Search failed' });
    }
  },

  setType: (type) => set({ type, visibleCount: PAGE_SIZE }),
  loadMore: () => set((s) => ({ visibleCount: s.visibleCount + PAGE_SIZE })),
  invalidateMp3s: () => set({ mp3sHydrated: false }),
  invalidateVideos: () => set({ videosHydrated: false }),
  removeVideo: (id) => set((s) => ({
    videos: s.videos.filter((v) => v.id !== id),
    browseVideos: s.browseVideos.filter((v) => v.id !== id),
  })),
  removeMp3: (id) => set((s) => ({
    mp3s: s.mp3s.filter((v) => v.id !== id),
    browseMp3s: s.browseMp3s.filter((v) => v.id !== id),
  })),
}));
