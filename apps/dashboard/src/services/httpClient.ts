import axios from "axios";
import { CONFIGS } from "../configs";

export const httpClient = axios.create({
  baseURL: CONFIGS.baseUrl,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(CONFIGS.localStorageKey) || "";
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(localStorage.getItem(CONFIGS.localStorageKey));

    // Only force a logout/redirect when a 401 invalidates an *existing*
    // session. A 401 with no token yet (e.g. a failed login attempt) just
    // means "invalid credentials" and must not wipe the error message by
    // reloading the page before it can be shown.
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem(CONFIGS.localStorageKey);
      window.location.pathname = "/";
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
