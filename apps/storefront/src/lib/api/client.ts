import axios from "axios";
import { CONFIG } from "../config";
import { getToken, removeToken } from "../auth/token";

export const apiClient = axios.create({
  baseURL: CONFIG.apiUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(getToken());

    // Only clear the session on a 401 that invalidates an *existing* token —
    // a 401 on login/register itself never had a token to begin with, and
    // clearing there would be pointless (and could mask the real error).
    if (error.response?.status === 401 && hadToken) {
      removeToken();
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
