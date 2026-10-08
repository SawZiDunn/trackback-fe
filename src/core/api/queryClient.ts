import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error: unknown) => {
          // Do not retry 401 or 404
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 404) {
              return false;
            }
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

export const queryClient = createQueryClient();
