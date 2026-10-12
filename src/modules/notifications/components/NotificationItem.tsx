"use client";

import type { Notification } from "../types/notification";

function timeAgo(value: string) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (Number.isNaN(seconds)) return value;
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function NotificationItem({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      aria-label={`Open notification: ${notification.message}`}
      className={`flex w-full cursor-pointer items-start gap-3 border-b border-neutral/50 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f8f9fa] ${
        notification.isRead ? "" : "bg-primary/5"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          notification.isRead ? "bg-neutral-300" : "bg-primary"
        }`}
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm leading-5 ${
            notification.isRead ? "text-tertiary" : "font-medium text-primary"
          }`}
        >
          {notification.message}
        </span>
        <span className="mt-1 block font-mono text-[10px] text-tertiary">
          {timeAgo(notification.createdAt)}
          {notification.relatedItemId ? " · Linked to a post" : ""}
        </span>
      </span>
    </button>
  );
}
