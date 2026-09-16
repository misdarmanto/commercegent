import axios from "axios";
import { CONFIGS } from "../configs";

export const fileUploadClient = axios.create({
  baseURL: CONFIGS.uploadFileUrl,
});

fileUploadClient.interceptors.request.use((config) => {
  config.headers["x-api-key"] = CONFIGS.uploadFileApiKey;
  return config;
});

fileUploadClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(CONFIGS.localStorageKey);
      window.location.pathname = "/";
    }

    const message =
      error.response?.data?.error_message ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
