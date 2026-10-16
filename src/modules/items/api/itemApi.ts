import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import type { SearchItemsParams, SearchItemsResult } from "../types/item";

const ITEMS_QUERY_KEY = ["items"];
const SEARCH_QUERY_KEY = [...ITEMS_QUERY_KEY, "search"];
const SEARCH_LIMIT = 8;

export function useSearchItems(params: SearchItemsParams) {
  const query = params.query.trim();

  return useQuery({
    queryKey: [...SEARCH_QUERY_KEY, query],
    queryFn: async (): Promise<SearchItemsResult> => {
      const response = await apiClient.get<SearchItemsResult>("/items/search", {
        params: { keyword: query, limit: params.limit ?? SEARCH_LIMIT },
      });
      return response.data;
    },
    enabled: query.length > 0,
  });
}