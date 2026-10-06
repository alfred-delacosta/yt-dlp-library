import { create } from "zustand";
import axios from "axios";

let API_URL = '';
const LOCAL_DEV_IP_ADDRESS = `http://${import.meta.env.VITE_LOCAL_DEV_IP_ADDRESS}:3010`;

if (import.meta.env.VITE_LOCALHOST_DEV !== "" && import.meta.env.VITE_LOCALHOST_DEV !== "false") {
  API_URL = import.meta.env.MODE === "development" ? "http://localhost:3010/api" : "/api";
}

if (import.meta.env.VITE_IP_ADDRESS_DEV !== "" && import.meta.env.VITE_IP_ADDRESS_DEV !== "false") {
  API_URL = import.meta.env.MODE === "development" ? `${LOCAL_DEV_IP_ADDRESS}/api` : "/api";
}

if (import.meta.env.PROD) {
  API_URL = "/api";
}

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const serverUrl = API_URL.split('/api')[0];

let refreshTask = null;

async function performRefresh() {
  const response = await axios.post(`${API_URL}/auth/refresh`, null, { withCredentials: true });
  return response.data;
}

export function requestRefresh() {
  if (!refreshTask) {
    const clear = () => {
      refreshTask = null;
    };
    if (globalThis.navigator?.locks?.request) {
      refreshTask = navigator.locks.request("yt-dlp-auth-refresh", performRefresh).finally(clear);
    } else {
      refreshTask = performRefresh().finally(clear);
    }
  }
  return refreshTask;
}

function applyAccessToken(accessToken) {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

function authPath(url = "") {
  const path = url.split("?")[0];
  return ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"].some((suffix) => path.endsWith(suffix));
}

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  message: null,

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { email, password }, { withCredentials: true });
      applyAccessToken(response.data.accessToken);
      set({
        accessToken: response.data.accessToken,
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
      applyAccessToken(response.data.accessToken);
      set({
        isAuthenticated: true,
        user: response.data.user,
        accessToken: response.data.accessToken,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/auth/logout`, null, { withCredentials: true });
      applyAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      const data = await requestRefresh();
      applyAccessToken(data.accessToken);
      set({
        isAuthenticated: true,
        accessToken: data.accessToken,
        user: data.user ?? get().user,
        error: null,
      });
      return data.accessToken;
    } catch (error) {
      if (error.response?.status === 401) {
        applyAccessToken(null);
        set({ accessToken: null, isAuthenticated: false, user: null });
      }
      throw error;
    }
  },
}));

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || !original || original._retry || authPath(original.url)) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      await useAuthStore.getState().refreshSession();
      return api(original);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);
