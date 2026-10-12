"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { showToast } from "nextjs-toast-notify";
import { resolveRelatedItemType, useMarkNotificationRead } from "../api/notificationApi";
import type { Notification } from "../types/notification";

// Shared open-notification behaviour: mark it read, then navigate to the
// related post (resolving whether it is a found or lost item post).
export function useNotificationNavigation() {
  const router = useRouter();
  const markRead = useMarkNotificationRead();

  return useCallback(
    async (notification: Notification) => {
      if (!notification.isRead) {
        markRead.mutate(notification.id);
      }
      if (!notification.relatedItemId) {
        showToast.error("This notification is not linked to a post.");
        return;
      }

      const type = await resolveRelatedItemType(notification.relatedItemId);
      if (!type) {
        showToast.error("The post related to this notification is no longer available.");
        return;
      }
      router.push(`/${type}-items/${notification.relatedItemId}`);
    },
    [markRead, router],
  );
}
