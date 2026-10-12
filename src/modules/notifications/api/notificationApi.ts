import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import type { Notification, NotificationsResult } from "../types/notification";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const PAGE_SIZE = 8;
const POLL_INTERVAL_MS = 30_000;

// List the current user's notifications, newest first.
// Pass { poll: true } to keep the data fresh (used by the header bell).
export function useNotifications(
  page: number,
  options?: { poll?: boolean; enabled?: boolean },
) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, page],
    queryFn: async (): Promise<NotificationsResult> => {
      const response = await apiClient.get<NotificationsResult>("/notifications", {
        params: { page, limit: PAGE_SIZE },
      });
      return response.data;
    },
    enabled: options?.enabled ?? true,
    ...(options?.poll ? { refetchInterval: POLL_INTERVAL_MS } : {}),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string): Promise<{ id: string; isRead: boolean }> => {
      const response = await apiClient.patch<{ id: string; isRead: boolean }>(
        `/notifications/${notificationId}/read`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ updatedCount: number }> => {
      const response = await apiClient.patch<{ updatedCount: number }>("/notifications/read-all");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

// A notification only carries relatedItemId — the backend has no /items/:id
// resolver, so probe the found-items endpoint and fall back to lost-items.
export async function resolveRelatedItemType(
  relatedItemId: string,
): Promise<"found" | "lost" | null> {
  try {
    await apiClient.get(`/found-items/${relatedItemId}`);
    return "found";
  } catch {
    try {
      await apiClient.get(`/lost-items/${relatedItemId}`);
      return "lost";
    } catch {
      return null;
    }
  }
}

export type { Notification };
