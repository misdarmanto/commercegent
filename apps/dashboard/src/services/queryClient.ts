import { QueryCache, QueryClient, MutationCache } from "@tanstack/react-query";
import { notifyErrorAlert } from "./alertBridge";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => notifyErrorAlert(getErrorMessage(error)),
  }),
  mutationCache: new MutationCache({
    onError: (error) => notifyErrorAlert(getErrorMessage(error)),
  }),
});
