import { QueryClient } from '@tanstack/react-query';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (count, error) => {
          const status =
            typeof error === 'object' && error && 'status' in error ? Number(error.status) : 0;
          return status >= 500 && count < 2;
        },
      },
      mutations: { retry: 0 },
    },
  });
}

let browserClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  browserClient ??= makeQueryClient();
  return browserClient;
}
