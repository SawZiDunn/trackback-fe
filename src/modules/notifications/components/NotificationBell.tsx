"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "../api/notificationApi";
import { useNotificationNavigation } from "../hooks/useNotificationNavigation";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const notificationsQuery = useNotifications(1, {
    poll: true,
    enabled: isAuthenticated,
  });
  const markAllRead = useMarkAllNotificationsRead();
  const openNotification = useNotificationNavigation();

  if (!isAuthenticated) return null;

  const notifications = notificationsQuery.data?.items ?? [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative cursor-pointer rounded-full p-2 text-neutral-700 transition hover:bg-[#f4f5f7]"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-neutral/60 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-neutral/60 px-4 py-3">
              <p className="text-sm font-semibold text-primary">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                    {unreadCount} new
                  </span>
                )}
              </p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary transition hover:text-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {markAllRead.isPending ? (
                    <LoaderCircle aria-hidden="true" size={12} className="animate-spin" />
                  ) : (
                    <CheckCheck aria-hidden="true" size={12} />
                  )}
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationsQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-tertiary">
                  <LoaderCircle aria-hidden="true" size={14} className="animate-spin text-primary" />
                  Loading notifications…
                </div>
              ) : notificationsQuery.isError ? (
                <p className="px-4 py-8 text-center text-xs text-tertiary">
                  Could not load notifications. Try again later.
                </p>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-tertiary">
                  You&apos;re all caught up — no notifications yet.
                </p>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onOpen={(item) => {
                      setIsOpen(false);
                      void openNotification(item);
                    }}
                  />
                ))
              )}
            </div>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block border-t border-neutral/60 bg-[#f8f9fa] px-4 py-2.5 text-center text-xs font-semibold text-primary transition hover:bg-[#f1f1f3]"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
