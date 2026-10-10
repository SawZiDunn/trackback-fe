import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import type {
  CreateLostItemPayload,
  CreateLostItemResponse,
  LostItemsFilters,
  LostItemsResult,
  LostItem,
  UpdateLostItemPayload,
  UploadedImagesResponse,
} from "../types/lostItem";

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

export function useCreateLostItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      image,
    }: {
      payload: CreateLostItemPayload;
      image?: File;
    }): Promise<CreateLostItemResponse> => {
      let photoUrl: string | undefined;

      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadResponse = await apiClient.post<UploadedImagesResponse>(
          "/media/image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        photoUrl = uploadResponse.data.data[0]?.url;
        if (!photoUrl) {
          throw new Error("The image upload did not return an image URL.");
        }
      }

      const response = await apiClient.post<CreateLostItemResponse>("/lost-items", {
        ...payload,
        ...(photoUrl ? { photoUrl } : {}),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOST_ITEMS_QUERY_KEY });
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

export function useUpdateLostItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
      image,
    }: {
      itemId: string;
      payload: UpdateLostItemPayload;
      image?: File;
    }): Promise<LostItem> => {
      let photoUrl = payload.photoUrl;
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadResponse = await apiClient.post<UploadedImagesResponse>(
          "/media/image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        photoUrl = uploadResponse.data.data[0]?.url;
        if (!photoUrl) {
          throw new Error("The image upload did not return an image URL.");
        }
      }

      const response = await apiClient.patch<LostItem>(`/lost-items/${itemId}`, {
        ...payload,
        ...(photoUrl !== undefined ? { photoUrl } : {}),
      });
      return response.data;
    },
    onSuccess: (_item, variables) => {
      queryClient.invalidateQueries({ queryKey: LOST_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LOST_ITEMS_QUERY_KEY, variables.itemId] });
    },
  });
}
