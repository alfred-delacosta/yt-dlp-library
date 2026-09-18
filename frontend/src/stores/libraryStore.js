import { create } from 'zustand';
import { api } from '../lib/axios';
import { pushRecentSearch } from '../lib/media';

const PAGE_SIZE = 24;

export const useLibraryStore = create((set, get) => ({
  videos: [],
  mp3s: [],
  browseVideos: [],
  browseMp3s: [],
  query: '',
  type: 'all',
  loading: false,
  searching: false,
  hydrated: false,
  visibleCount: PAGE_SIZE,
  error: null,

  loadLibrary: async () => {
    set({ loading: true, error: null });
    try {
      const [videoRes, mp3Res] = await Promise.all([
        api.get('/videos'),
        api.get('/mp3s'),
      ]);
      const videos = Array.isArray(videoRes.data) ? videoRes.data : [];
      const mp3s = Array.isArray(mp3Res.data) ? mp3Res.data : [];
      set({
        videos,
        mp3s,
        browseVideos: videos,
        browseMp3s: mp3s,
        loading: false,
        hydrated: true,
        visibleCount: PAGE_SIZE,
      });
    } catch (error) {
      console.error(error);
      set({ loading: false, hydrated: true, error: 'Could not load library' });
    }
  },

  setQuery: (query) => set({ query }),

  search: async (term, signal) => {
    const q = String(term ?? get().query).trim();
    if (!q) {
      const { browseVideos, browseMp3s, hydrated } = get();
      if (!hydrated) return;
      set({
        videos: browseVideos,
        mp3s: browseMp3s,
        searching: false,
        visibleCount: PAGE_SIZE,
      });
      return;
    }
    set({ searching: true });
    try {
      const [videoRes, mp3Res] = await Promise.all([
        api.post('/videos/search', { searchTerm: q }, { signal }),
        api.post('/mp3s/search', { searchTerm: q }, { signal }),
      ]);
      if (get().query.trim() !== q) return;
      pushRecentSearch(q);
      set({
        videos: Array.isArray(videoRes.data) ? videoRes.data : [],
        mp3s: Array.isArray(mp3Res.data) ? mp3Res.data : [],
        searching: false,
        visibleCount: PAGE_SIZE,
      });
    } catch (error) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return;
      console.error(error);
      set({ searching: false, error: 'Search failed' });
    }
  },

  setType: (type) => set({ type, visibleCount: PAGE_SIZE }),
  loadMore: () => set((s) => ({ visibleCount: s.visibleCount + PAGE_SIZE })),
  removeVideo: (id) => set((s) => ({
    videos: s.videos.filter((v) => v.id !== id),
    browseVideos: s.browseVideos.filter((v) => v.id !== id),
  })),
  removeMp3: (id) => set((s) => ({
    mp3s: s.mp3s.filter((v) => v.id !== id),
    browseMp3s: s.browseMp3s.filter((v) => v.id !== id),
  })),
}));
