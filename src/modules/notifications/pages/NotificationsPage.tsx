"use client";

import axios from "axios";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CheckCheck,
  LoaderCircle,
} from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useMarkAllNotificationsRead, useNotifications } from "../api/notificationApi";
import { useNotificationNavigation } from "../hooks/useNotificationNavigation";
import { NotificationItem } from "../components/NotificationItem";

const PAGE_SIZE = 8;

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const notificationsQuery = useNotifications(page);
  const markAllRead = useMarkAllNotificationsRead();
  const openNotification = useNotificationNavigation();

  const notifications = notificationsQuery.data?.items ?? [];
  const total = notificationsQuery.data?.total ?? 0;
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-tertiary">
                  <span className="rounded bg-[#f1f1f3] px-2 py-1 font-semibold tracking-wide">
                    ACTIVITY // NOTIFICATIONS
                  </span>
                  <span>{total} Notifications</span>
                </div>
                <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">
                  Notifications
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-tertiary">
                  Match alerts, claim updates, and claim invites land here. Click one to jump to
                  the related post.
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-neutral/70 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {markAllRead.isPending ? (
                    <LoaderCircle aria-hidden="true" size={14} className="animate-spin" />
                  ) : (
                    <CheckCheck aria-hidden="true" size={14} />
                  )}
                  Mark all as read
                </button>
              )}
            </div>
          </section>

          {notificationsQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <div className="flex items-center gap-3 text-sm text-tertiary">
                <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-primary" />
                Loading notifications…
              </div>
            </div>
          ) : notificationsQuery.isError ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-primary">Could not load notifications</h2>
              <p className="mt-2 text-sm text-tertiary">{getErrorMessage(notificationsQuery.error)}</p>
              <button
                type="button"
                onClick={() => void notificationsQuery.refetch()}
                className="mt-5 cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Try again
              </button>
            </section>
          ) : notifications.length === 0 ? (
            <section className="rounded-2xl border border-neutral/60 bg-white px-6 py-14 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-tertiary">
                <BellRing aria-hidden="true" size={20} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-primary">No notifications yet</h2>
              <p className="mt-1 text-sm text-tertiary">
                When someone matches, claims, or reviews your posts, you&apos;ll hear about it
                here.
              </p>
            </section>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral/60 bg-white shadow-xs">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={(item) => void openNotification(item)}
                />
              ))}
            </div>
          )}

          <section className="flex flex-col gap-4 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-tertiary">
              Showing{" "}
              <span className="font-semibold text-primary">
                {total === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
              </span>{" "}
              of <span className="font-semibold text-primary">{total}</span> notifications
            </p>
            <nav
              aria-label="Notifications pages"
              className="flex items-center gap-1.5 self-end sm:self-auto"
            >
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || notificationsQuery.isFetching}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#f4f5f7] px-3 py-2 text-xs font-medium text-primary transition hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft aria-hidden="true" size={13} />
                Previous
              </button>
              <span className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white">
                {page} <span className="font-normal text-white/70">/ {totalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || notificationsQuery.isFetching}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#f4f5f7] px-3 py-2 text-xs font-medium text-primary transition hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight aria-hidden="true" size={13} />
              </button>
            </nav>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
