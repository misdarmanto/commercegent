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
    if (error.response?.status === 401) {
      localStorage.removeItem(CONFIGS.localStorageKey);
      window.location.pathname = "/";
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
