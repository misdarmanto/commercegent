import { jwtDecode } from "jwt-decode";
import { CONFIG } from "../config";

export interface IJwtPayload {
  userId: number;
  userRole: string;
  iat: number;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CONFIG.tokenStorageKey);
}

export function setToken(token: string): void {
  window.localStorage.setItem(CONFIG.tokenStorageKey, token);
}

export function removeToken(): void {
  window.localStorage.removeItem(CONFIG.tokenStorageKey);
}

export function getDecodedToken(): IJwtPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode<IJwtPayload>(token);
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getDecodedToken() !== null;
}
