"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { showToast } from "nextjs-toast-notify";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MapPin,
} from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ClaimInviteDialog } from "@/modules/claims/components/ClaimInviteDialog";
import { useSendClaimInvite } from "@/modules/claims/api/claimApi";
import { useMyPosts } from "@/modules/my-posts/api/myPostsApi";
import { useLostItem, useRecoverLostItem } from "../api/lostItemApi";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

const STATUS_HINTS: Record<string, string> = {
  RECOVERED: "Good news — the owner marked this item as recovered.",
  CLOSED: "This post is closed.",
};

export function LostItemDetailPage({ itemId }: { itemId: string }) {
  const { user } = useAuth();
  const lostItemQuery = useLostItem(itemId);
  const recoverLostItem = useRecoverLostItem();
  const sendClaimInvite = useSendClaimInvite();
  const myPostsQuery = useMyPosts();
  const [isConfirmingRecover, setIsConfirmingRecover] = useState(false);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const item = lostItemQuery.data;
  const isOwner = Boolean(user?.id && item && item.userId === user.id);
  const canRecover = Boolean(item && isOwner && item.status === "OPEN");
  // Non-owners can say they have the item. The backend invite points at one of
  // the viewer's own OPEN found posts, so the dialog guides them to report one
  // first if they don't have any yet.
  const openFoundPosts = (myPostsQuery.data?.items ?? []).filter(
    (post) => post.postType === "FOUND" && post.status === "OPEN",
  );
  const canInvite = Boolean(user && item && !isOwner && item.status === "OPEN");

  const handleSendInvite = async (foundItemPostId: string) => {
    if (!item) return;
    setInviteError(null);
    try {
      await sendClaimInvite.mutateAsync({ foundItemPostId, lostItemId: item.id });
      setIsInviting(false);
      showToast.success("Invite sent. The owner will be notified to review and claim it.");
    } catch (error) {
      setInviteError(getErrorMessage(error));
    }
  };

  const handleRecover = async () => {
    if (!item) return;
    setRecoverError(null);
    try {
      await recoverLostItem.mutateAsync(item.id);
      setIsConfirmingRecover(false);
      showToast.success("Marked as recovered. Glad you found it!");
    } catch (error) {
      setRecoverError(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-5 px-4 sm:px-6 lg:px-8">
          <Link
            href="/lost-items"
            className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            Back to Lost Items
          </Link>

          {lostItemQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <div className="flex items-center gap-3 text-sm text-tertiary">
                <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-primary" />
                Loading item…
              </div>
            </div>
          ) : lostItemQuery.isError ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h1 className="text-lg font-semibold text-primary">Could not load this item</h1>
              <p className="mt-2 text-sm text-tertiary">{getErrorMessage(lostItemQuery.error)}</p>
              <button
                type="button"
                onClick={() => void lostItemQuery.refetch()}
                className="mt-5 cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Try again
              </button>
            </section>
          ) : item ? (
            <article className="overflow-hidden rounded-2xl border border-neutral/60 bg-white shadow-xs">
              <div className="relative aspect-[16/9] bg-[#ececef]">
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    unoptimized
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-400">
                    <ImagePlus aria-hidden="true" size={48} strokeWidth={1.3} />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                    {item.category}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {item.status.replaceAll("_", " ")}
                  </span>
                  <span className="font-mono text-[11px] text-tertiary">
                    ID: {item.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
                  {item.title}
                </h1>
                <div className="mt-4 grid gap-3 text-sm text-tertiary sm:grid-cols-2">
                  <p className="flex items-start gap-2">
                    <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                    Last seen at {item.lastSeenLocation}
                  </p>
                  <p className="flex items-start gap-2">
                    <CalendarDays aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                    Last seen {formatDate(item.lastSeenDate)}
                  </p>
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                  {item.description}
                </p>

                <div className="mt-6 border-t border-neutral/60 pt-5">
                  {canRecover ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-tertiary">
                        Did you get this item back outside TrackBack? Mark it as recovered to close
                        this post.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoverError(null);
                          setIsConfirmingRecover(true);
                        }}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral/70 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-[#f4f5f7]"
                      >
                        <CheckCircle2 aria-hidden="true" size={15} />
                        Mark as recovered
                      </button>
                    </div>
                  ) : isOwner ? (
                    <p className="text-sm text-tertiary">You reported this lost item.</p>
                  ) : canInvite ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-tertiary">
                        Found this item? Let the owner know — they can submit a claim to confirm
                        it is theirs.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setInviteError(null);
                          setIsInviting(true);
                        }}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
                      >
                        I have this
                      </button>
                    </div>
                  ) : (
                    STATUS_HINTS[item.status] && (
                      <p className="text-sm text-tertiary">{STATUS_HINTS[item.status]}</p>
                    )
                  )}
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </main>
      <Footer />

      {item && isConfirmingRecover && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !recoverLostItem.isPending) {
              setIsConfirmingRecover(false);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="recover-lost-item-title"
            aria-describedby="recover-lost-item-description"
            className="w-full max-w-md rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 aria-hidden="true" size={20} />
              </span>
              <div>
                <h2 id="recover-lost-item-title" className="text-lg font-semibold text-primary">
                  Mark as recovered?
                </h2>
                <p id="recover-lost-item-description" className="mt-2 text-sm leading-6 text-tertiary">
                  This closes{" "}
                  <span className="font-semibold text-primary">{item.title}</span>. Make sure you
                  have the item back — the post will no longer accept matches.
                </p>
              </div>
            </div>
            {recoverError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {recoverError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!recoverLostItem.isPending) {
                    setIsConfirmingRecover(false);
                    setRecoverError(null);
                  }
                }}
                disabled={recoverLostItem.isPending}
                className="cursor-pointer rounded-lg border border-neutral/70 px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Not yet
              </button>
              <button
                type="button"
                onClick={() => void handleRecover()}
                disabled={recoverLostItem.isPending}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {recoverLostItem.isPending ? (
                  <>
                    <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                    Marking…
                  </>
                ) : (
                  <>
                    <CheckCircle2 aria-hidden="true" size={15} />
                    Yes, I got it back
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}

      {item && isInviting && (
        <ClaimInviteDialog
          lostItemTitle={item.title}
          foundItems={openFoundPosts}
          isSubmitting={sendClaimInvite.isPending}
          error={inviteError}
          onClose={() => {
            if (!sendClaimInvite.isPending) {
              setIsInviting(false);
              setInviteError(null);
            }
          }}
          onSubmit={handleSendInvite}
        />
      )}
    </div>
  );
}
