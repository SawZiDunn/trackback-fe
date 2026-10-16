"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { showToast } from "nextjs-toast-notify";
import { ArrowLeft, Check, ImagePlus, LoaderCircle, MapPin, UserRound, X } from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useFoundItem } from "@/modules/found-items/api/foundItemApi";
import { useProfile as useProfileQuery } from "@/modules/profile/api/profileApi";
import { useClaim, useReviewClaim } from "../api/claimApi";

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
};

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

function PostOwner({ userId, label }: { userId: string; label: string }) {
  const profileQuery = useProfileQuery(userId);
  const profile = profileQuery.data;
  const name =
    profile?.name || (profileQuery.isError ? "Post owner unavailable" : "Loading…");

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="relative h-[42px] w-[42px] shrink-0 overflow-hidden rounded-full border border-neutral/70 bg-[#f1f1f3]">
        {profile?.profileUrl ? (
          <Image
            src={profile.profileUrl}
            alt=""
            fill
            sizes="42px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-tertiary">
            <UserRound aria-hidden="true" size={19} />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p
          className="truncate text-sm font-medium text-primary"
          title={profileQuery.error instanceof Error ? profileQuery.error.message : undefined}
        >
          {name}
        </p>
        <p className="text-xs text-tertiary">{label}</p>
      </div>
    </div>
  );
}

export function ClaimDetailPage({ claimId }: { claimId: string }) {
  const { user } = useAuth();
  const claimQuery = useClaim(claimId);
  const reviewClaim = useReviewClaim();

  const claim = claimQuery.data;
  // Fetch the found item to identify the finder (its userId) and render the summary
  const foundItemQuery = useFoundItem(claim?.foundItem.id ?? "");
  const foundItem = foundItemQuery.data;

  const isFinder = Boolean(user?.id && foundItem && foundItem.userId === user.id);
  const isClaimant = Boolean(user?.id && claim && claim.claimant.id === user.id);
  const canReview = Boolean(claim && isFinder && claim.status === "PENDING");

  const handleReview = async (decision: "approve" | "reject") => {
    if (!claim) return;
    try {
      await reviewClaim.mutateAsync({ claimId: claim.id, decision });
      showToast.success(
        decision === "approve"
          ? "Claim approved. The claimant has been notified to collect the item."
          : "Claim rejected. The claimant has been notified.",
      );
    } catch (error) {
      showToast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-5 px-4 sm:px-6 lg:px-8">
          <Link
            href="/claims"
            className="inline-flex items-center gap-2 text-sm font-medium text-tertiary transition hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            Back to Claims
          </Link>

          {claimQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <div className="flex items-center gap-3 text-sm text-tertiary">
                <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-primary" />
                Loading claim…
              </div>
            </div>
          ) : claimQuery.isError ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h1 className="text-lg font-semibold text-primary">Could not load this claim</h1>
              <p className="mt-2 text-sm text-tertiary">{getErrorMessage(claimQuery.error)}</p>
              <button
                type="button"
                onClick={() => void claimQuery.refetch()}
                className="mt-5 cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Try again
              </button>
            </section>
          ) : claim ? (
            <>
              <section className="rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGES[claim.status]}`}
                    >
                      {claim.status}
                    </span>
                    <span className="font-mono text-[11px] text-tertiary">
                      Claim #{claim.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-tertiary">
                    Submitted {formatDate(claim.createdAt)}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                  {isClaimant ? "Your claim" : isFinder ? "Claim to review" : "Claim details"}
                </h1>
                {claim.status === "PENDING" && isClaimant && (
                  <p className="mt-2 text-sm text-tertiary">
                    Waiting for the finder to review your claim.
                  </p>
                )}
                {claim.status === "APPROVED" && (
                  <p className="mt-2 text-sm text-tertiary">
                    Approved — please go to the Lost &amp; Found office to collect your item.
                  </p>
                )}
                {claim.status === "REJECTED" && (
                  <p className="mt-2 text-sm text-tertiary">
                    This claim was rejected. You may submit another claim or contact the finder.
                  </p>
                )}
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <section
                  aria-label="Claimed found item"
                  className="overflow-hidden rounded-2xl border border-neutral/60 bg-white shadow-xs"
                >
                  <div className="relative aspect-[16/9] bg-[#ececef]">
                    {claim.foundItem.photoUrl ? (
                      <Image
                        src={claim.foundItem.photoUrl}
                        alt={claim.foundItem.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 480px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-400">
                        <ImagePlus aria-hidden="true" size={40} strokeWidth={1.3} />
                      </div>
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                        {claim.foundItem.category}
                      </span>
                      <span className="font-mono text-[11px] text-tertiary">
                        ID: {claim.foundItem.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-primary">
                      {claim.foundItem.title}
                    </h2>
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-tertiary">
                      <MapPin aria-hidden="true" size={13} className="mt-0.5 shrink-0" />
                      Found at {claim.foundItem.foundLocation} · {formatDate(claim.foundItem.foundDate)}
                    </p>
                    {foundItem && (
                      <div className="mt-4 rounded-xl bg-[#f8f9fa] p-4">
                        <PostOwner userId={foundItem.userId} label="Post owner" />
                      </div>
                    )}
                    <p className="mt-4 text-sm leading-6 text-neutral-700">
                      {claim.foundItem.description}
                    </p>
                    <Link
                      href={`/found-items/${claim.foundItem.id}`}
                      className="mt-4 inline-block text-xs font-semibold text-primary underline underline-offset-4"
                    >
                      View found item post
                    </Link>
                  </div>
                </section>

                <section
                  aria-label="Claim details"
                  className="space-y-5 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6"
                >
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
                      Why it&apos;s theirs
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                      {claim.claim.justification}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
                      Item details from the claimant
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                      {claim.claim.itemDetails}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
                      Proof photo
                    </h3>
                    <div className="relative mt-2 h-56 w-full overflow-hidden rounded-xl bg-[#ececef]">
                      {claim.claim.proofPhotoUrl ? (
                        <Image
                          src={claim.claim.proofPhotoUrl}
                          alt="Claim proof photo"
                          fill
                          sizes="(max-width: 1024px) 100vw, 480px"
                          unoptimized
                          className="object-contain"
                        />
                      ) : (
                        <>
                          <div className="flex h-full items-center justify-center text-neutral-400">
                            <ImagePlus aria-hidden="true" size={40} strokeWidth={1.3} />
                          </div>
                          <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-tertiary">
                            No proof photo attached
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {canReview && (
                    <div className="space-y-3 border-t border-neutral/60 pt-5">
                      <p className="text-sm font-semibold text-primary">
                        Does this claim convince you?
                      </p>
                      <p className="text-xs leading-5 text-tertiary">
                        Approving marks the item as claimed and notifies the claimant. Rejecting
                        reopens the item for other claims.
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => void handleReview("approve")}
                          disabled={reviewClaim.isPending}
                          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewClaim.isPending ? (
                            <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                          ) : (
                            <Check aria-hidden="true" size={16} />
                          )}
                          Approve claim
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleReview("reject")}
                          disabled={reviewClaim.isPending}
                          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <X aria-hidden="true" size={16} />
                          Reject claim
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
