export const CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  uploadFileUrl: process.env.NEXT_PUBLIC_UPLOAD_FILE_URL ?? "",
  tokenStorageKey:
    process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY ?? "fresh_storefront_token",
};
