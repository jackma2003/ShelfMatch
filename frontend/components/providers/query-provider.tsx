"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ME_QUERY_KEY } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // `useMe`'s own 401 is already handled by AuthGuard (it owns the "am I logged
            // in at all" check). This covers every *other* query dying mid-session — e.g. the
            // 7-day cookie expiring while someone's actively on /pantry — so it reads as
            // "please log back in" instead of a dead-end "couldn't load, try again" loop.
            const isMeQuery =
              query.queryKey[0] === ME_QUERY_KEY[0] && query.queryKey[1] === ME_QUERY_KEY[1];
            if (error instanceof ApiError && error.status === 401 && !isMeQuery) {
              window.location.assign("/login");
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
