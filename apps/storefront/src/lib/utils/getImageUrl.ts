import { CONFIG } from "../config";

export function getImageUrl(path?: string | null): string {
  if (!path) return "/placeholder-product.svg";
  if (path.startsWith("http")) return path;
  return `${CONFIG.uploadFileUrl}/${path}`;
}
