import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  IChatMessage,
  IChatRecommendationsResponse,
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
  recommendations: () => [...chatKeys.all, "recommendations"] as const,
};

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ISendChatMessagePayload) => {
      const { data } = await apiClient.post("/chats", payload);
      return data.data as ISendChatMessageResponse;
    },
    onSuccess: () => {
      // The homepage's "Recommended for You" is derived from the latest
      // chat history; without this it kept showing whatever it had at
      // mount time (or nothing) until the user did a hard refresh, even
      // though a new message had just changed the underlying recommendation.
      queryClient.invalidateQueries({ queryKey: chatKeys.recommendations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
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

/** Product recommendations derived from the user's most recent chat session. */
export function useChatRecommendations() {
  return useQuery({
    queryKey: chatKeys.recommendations(),
    queryFn: async () => {
      const { data } = await apiClient.get("/chats/recommendations");
      return data.data as IChatRecommendationsResponse;
    },
    enabled: isLoggedIn(),
    staleTime: 60_000,
  });
}
