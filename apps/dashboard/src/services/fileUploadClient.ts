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
    // Unlike httpClient, this service authenticates with a static x-api-key
    // (not the admin's JWT), so a 401 here is a misconfigured upload API key
    // — it must not clear the unrelated main-app login token or redirect.
    const message =
      error.response?.data?.error_message ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
