import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  });
}

// Server: always make a new client per request (no cross-request cache
// sharing). Browser: reuse a single module-level instance for the tab's
// whole lifetime. Providers previously created the client via
// `useState(makeQueryClient)`, which looks safe but isn't quite — Next
// dev's Strict Mode double-invokes component mounts, and that lazy
// initializer ran again on the second mount, handing back a *second*,
// empty QueryClient that replaced the first. Any query result that had
// already resolved (e.g. the homepage's chat-derived recommendations)
// would flash correctly for a moment, then reset to empty/loading and
// refetch from scratch a moment later — visible on the client as a
// brief flip from the right products to nothing/wrong ones. This
// singleton pattern is TanStack Query's own recommended fix for that
// exact SSR + Strict Mode interaction.
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
