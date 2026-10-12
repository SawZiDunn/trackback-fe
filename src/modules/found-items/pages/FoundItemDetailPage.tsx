"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { showToast } from "nextjs-toast-notify";
import {
  ArrowLeft,
  CalendarDays,
  ImagePlus,
  LoaderCircle,
  MapPin,
} from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ClaimItemDialog } from "@/modules/claims/components/ClaimItemDialog";
import { useSubmitClaim } from "@/modules/claims/api/claimApi";
import type { SubmitClaimPayload } from "@/modules/claims/types/claim";
import { useFoundItem } from "../api/foundItemApi";

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
  PENDING_CLAIM: "A claim on this item is currently under review by the finder.",
  CLAIMED: "This item has been matched with its owner and is no longer available to claim.",
  CLOSED: "This post is closed and no longer accepts claims.",
};

export function FoundItemDetailPage({ itemId }: { itemId: string }) {
  const { user } = useAuth();
  const foundItemQuery = useFoundItem(itemId);
  const submitClaim = useSubmitClaim();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const item = foundItemQuery.data;
  const isOwner = Boolean(user?.id && item && item.userId === user.id);
  const canClaim = Boolean(item && !isOwner && item.status === "OPEN");

  const handleSubmitClaim = async (payload: SubmitClaimPayload, proofImage?: File) => {
    if (!item) return;
    setClaimError(null);
    try {
      await submitClaim.mutateAsync({ foundItemPostId: item.id, payload, proofImage });
      setIsClaiming(false);
      showToast.success("Claim submitted. The finder has been notified and will review it.");
    } catch (error) {
      setClaimError(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-5 px-4 sm:px-6 lg:px-8">
          <Link
            href="/found-items"
            className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            Back to Found Items
          </Link>

          {foundItemQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <div className="flex items-center gap-3 text-sm text-tertiary">
                <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-primary" />
                Loading item…
              </div>
            </div>
          ) : foundItemQuery.isError ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h1 className="text-lg font-semibold text-primary">Could not load this item</h1>
              <p className="mt-2 text-sm text-tertiary">{getErrorMessage(foundItemQuery.error)}</p>
              <button
                type="button"
                onClick={() => void foundItemQuery.refetch()}
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
                    Found at {item.foundLocation}
                  </p>
                  <p className="flex items-start gap-2">
                    <CalendarDays aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                    Found {formatDate(item.foundDate)}
                  </p>
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                  {item.description}
                </p>

                <div className="mt-6 border-t border-neutral/60 pt-5">
                  {canClaim ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-tertiary">
                        Is this yours? Submit a claim with details only the owner would know.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setClaimError(null);
                          setIsClaiming(true);
                        }}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
                      >
                        This is mine
                      </button>
                    </div>
                  ) : isOwner ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-tertiary">You reported this found item.</p>
                      <Link
                        href="/claims"
                        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-neutral/70 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-[#f4f5f7]"
                      >
                        View claims to review
                      </Link>
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

      {item && isClaiming && (
        <ClaimItemDialog
          item={item}
          isSubmitting={submitClaim.isPending}
          error={claimError}
          onClose={() => {
            if (!submitClaim.isPending) {
              setIsClaiming(false);
              setClaimError(null);
            }
          }}
          onSubmit={handleSubmitClaim}
        />
      )}
    </div>
  );
}
