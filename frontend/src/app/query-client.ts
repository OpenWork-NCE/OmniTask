import { QueryClient } from "@tanstack/react-query";

import { isApiProblem } from "@/lib/api/problem";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  return error instanceof TypeError || (isApiProblem(error) && error.status >= 500);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: false
    }
  }
});
