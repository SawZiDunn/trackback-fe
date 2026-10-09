import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import type { LostItemsFilters, LostItemsResult } from "../types/lostItem";

const LOST_ITEMS_QUERY_KEY = ["lost-items"];
const PAGE_SIZE = 8;

export function useLostItems(page: number, filters: LostItemsFilters) {
  return useQuery({
    queryKey: [...LOST_ITEMS_QUERY_KEY, page, filters],
    queryFn: async (): Promise<LostItemsResult> => {
      const response = await apiClient.get<LostItemsResult>("/lost-items", {
        params: {
          ...filters,
          page,
          limit: PAGE_SIZE,
        },
      });
      return response.data;
    },
  });
}

export function useRecoverLostItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string): Promise<{ success: true; status: "RECOVERED" }> => {
      const response = await apiClient.patch<{ success: true; status: "RECOVERED" }>(
        `/lost-items/${itemId}/recover`,
      );
      return response.data;
    },
    onSuccess: (_result, itemId) => {
      queryClient.invalidateQueries({ queryKey: LOST_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LOST_ITEMS_QUERY_KEY, itemId] });
    },
  });
}
