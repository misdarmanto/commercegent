import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  IChatMessage,
  IChatSession,
  ISendChatMessagePayload,
  ISendChatMessageResponse,
} from "@/interfaces/Chat";
import { isLoggedIn } from "@/lib/auth/token";

export const chatKeys = {
  all: ["chat"] as const,
  sessions: () => [...chatKeys.all, "sessions"] as const,
  session: (chatSessionId: number) =>
    [...chatKeys.all, "session", chatSessionId] as const,
};

export function useSendChatMessage() {
  return useMutation({
    mutationFn: async (payload: ISendChatMessagePayload) => {
      const { data } = await apiClient.post("/chats", payload);
      return data.data as ISendChatMessageResponse;
    },
  });
}

export function useChatSessions() {
  return useQuery({
    queryKey: chatKeys.sessions(),
    queryFn: async () => {
      const { data } = await apiClient.get("/chats/sessions");
      return data.data as IChatSession[];
    },
    enabled: isLoggedIn(),
  });
}

export function useChatSessionMessages(chatSessionId: number | null) {
  return useQuery({
    queryKey: chatKeys.session(chatSessionId ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get(`/chats/sessions/${chatSessionId}`);
      return data.data as { session: IChatSession; messages: IChatMessage[] };
    },
    enabled: isLoggedIn() && chatSessionId != null,
  });
}
