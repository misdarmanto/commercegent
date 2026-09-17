const CHAT_SESSION_STORAGE_KEY = "fresh_storefront_chat_session_id";

export function getStoredChatSessionId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setStoredChatSessionId(chatSessionId: number): void {
  window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, String(chatSessionId));
}

export function clearStoredChatSessionId(): void {
  window.localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
}
