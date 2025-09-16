import { create } from "zustand";
import axios from "axios";

// in production, there's no localhost so we have to make this dynamic
const API_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3010/api" : "/api";
axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: API_URL
});

console.log(api.defaults.baseURL);

export const useAuthStore = create((set) => ({
  userId: null,
  accessToken: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
      });
      set({
        accessToken: response.data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
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
      await axios.post(`${API_URL}/auth/logout`);
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
  getNewAccessToken: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/auth/getNewAccessToken`);
      set({
        isAuthenticated: true,
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
  setAccessToken: (accessToken) => {
    set({ accessToken, isAuthenticated: true})
  },
  checkAuth: async (accessToken) => {
    set({ isLoading: true, error: null });
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      const response = await axios.get(`${API_URL}/auth/checkAuth`);
      console.log(response.data);
      set({
        isAuthenticated: response.data.isAuthorized,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error checking auth.",
        isLoading: false,
      });
      throw error;
    }
  },
  checkRefreshToken: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/auth/checkRefreshToken`);
      set({
        isAuthenticated: response.data.isAuthorized,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error checking auth.",
        isLoading: false,
      });
      throw error;
    }
  }

}));
