import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import type {
  CreateFoundItemPayload,
  CreateFoundItemResponse,
  FoundItem,
  FoundItemsFilters,
  FoundItemsResult,
  UpdateFoundItemPayload,
  UploadedImagesResponse,
} from "../types/foundItem";

const FOUND_ITEMS_QUERY_KEY = ["found-items"];
const MY_POSTS_QUERY_KEY = ["my-posts"];
const PAGE_SIZE = 8;

export function useFoundItems(page: number, filters: FoundItemsFilters) {
  return useQuery({
    queryKey: [...FOUND_ITEMS_QUERY_KEY, page, filters],
    queryFn: async (): Promise<FoundItemsResult> => {
      const response = await apiClient.get<FoundItemsResult>("/found-items", {
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

export function useFoundItem(itemId: string) {
  return useQuery({
    queryKey: [...FOUND_ITEMS_QUERY_KEY, itemId],
    queryFn: async (): Promise<FoundItem> => {
      const response = await apiClient.get<FoundItem>(`/found-items/${itemId}`);
      return response.data;
    },
    enabled: Boolean(itemId),
  });
}

export function useCreateFoundItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      image,
    }: {
      payload: CreateFoundItemPayload;
      image?: File;
    }): Promise<CreateFoundItemResponse> => {
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

      const response = await apiClient.post<CreateFoundItemResponse>("/found-items", {
        ...payload,
        ...(photoUrl ? { photoUrl } : {}),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOUND_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_POSTS_QUERY_KEY });
    },
  });
}

export function useUpdateFoundItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
      image,
    }: {
      itemId: string;
      payload: UpdateFoundItemPayload;
      image?: File;
    }): Promise<FoundItem> => {
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

      const response = await apiClient.patch<FoundItem>(`/found-items/${itemId}`, {
        ...payload,
        ...(photoUrl !== undefined ? { photoUrl } : {}),
      });
      return response.data;
    },
    onSuccess: (_item, variables) => {
      queryClient.invalidateQueries({ queryKey: FOUND_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...FOUND_ITEMS_QUERY_KEY, variables.itemId] });
    },
  });
}

export function useDeleteFoundItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string): Promise<{ success: true }> => {
      const response = await apiClient.delete<{ success: true }>(`/found-items/${itemId}`);
      return response.data;
    },
    onSuccess: (_result, itemId) => {
      queryClient.invalidateQueries({ queryKey: FOUND_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_POSTS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: [...FOUND_ITEMS_QUERY_KEY, itemId] });
    },
  });
}
