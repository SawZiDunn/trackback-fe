"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  FileQuestion,
  Inbox,
  LoaderCircle,
  Send,
} from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useClaims } from "../api/claimApi";
import type { ClaimRole, ClaimStatus } from "../types/claim";

const PAGE_SIZE = 8;

const STATUS_BADGES: Record<ClaimStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
};

const ROLES: { value: ClaimRole; label: string; description: string }[] = [
  { value: "mine", label: "Submitted by me", description: "Claims you submitted on found items" },
  { value: "toReview", label: "To review", description: "Claims on items you reported as found" },
];

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

export function ClaimsPage() {
  const [role, setRole] = useState<ClaimRole>("mine");
  const [status, setStatus] = useState<ClaimStatus | "">("");
  const [page, setPage] = useState(1);

  const claimsQuery = useClaims(role, status, page);
  const claims = claimsQuery.data?.items ?? [];
  const total = claimsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeRole = ROLES.find((option) => option.value === role)!;

  const switchRole = (nextRole: ClaimRole) => {
    setRole(nextRole);
    setStatus("");
    setPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl space-y-5 px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-tertiary">
              <span className="rounded bg-[#f1f1f3] px-2 py-1 font-semibold tracking-wide">
                CLAIMS // {role === "mine" ? "SUBMITTED" : "TO REVIEW"}
              </span>
              <span>{total} Claims</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">
              Claims
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-tertiary sm:text-base">
              Track claims you submitted on found items, and review claims other users submitted on
              items you reported.
            </p>
          </section>

          <section
            aria-label="Filter claims"
            className="space-y-4 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6"
          >
            <div
              role="tablist"
              aria-label="Claim lists"
              className="grid gap-2 rounded-xl bg-[#f4f5f7] p-1 sm:grid-cols-2"
            >
              {ROLES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={role === option.value}
                  onClick={() => switchRole(option.value)}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                    role === option.value
                      ? "bg-white text-primary shadow-xs"
                      : "text-tertiary hover:text-primary"
                  }`}
                >
                  {option.value === "mine" ? (
                    <Send aria-hidden="true" size={14} />
                  ) : (
                    <Inbox aria-hidden="true" size={14} />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-tertiary">{activeRole.description}</p>
            <div className="flex items-center justify-between gap-3 border-t border-neutral/50 pt-4">
              <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                Status
                <span className="relative block">
                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value as ClaimStatus | "");
                      setPage(1);
                    }}
                    className="w-full cursor-pointer appearance-none rounded-lg bg-[#f4f5f7] px-3.5 py-2.5 pr-9 text-sm font-normal normal-case tracking-normal text-primary outline-none transition focus:ring-1 focus:ring-primary/25"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
                  />
                </span>
              </label>
              <p className="font-mono text-[11px] text-tertiary" aria-live="polite">
                Showing{" "}
                <span className="font-semibold text-primary">
                  {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                </span>{" "}
                of <span className="font-semibold text-primary">{total}</span> claims
              </p>
            </div>
          </section>

          {claimsQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <div className="flex items-center gap-3 text-sm text-tertiary">
                <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-primary" />
                Loading claims…
              </div>
            </div>
          ) : claimsQuery.isError ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-primary">Could not load claims</h2>
              <p className="mt-2 text-sm text-tertiary">{getErrorMessage(claimsQuery.error)}</p>
              <button
                type="button"
                onClick={() => void claimsQuery.refetch()}
                className="mt-5 cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Try again
              </button>
            </section>
          ) : claims.length === 0 ? (
            <section className="rounded-2xl border border-neutral/60 bg-white px-6 py-14 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-tertiary">
                <FileQuestion aria-hidden="true" size={20} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-primary">
                {role === "mine" ? "No claims submitted yet" : "No claims waiting for your review"}
              </h2>
              <p className="mt-1 text-sm text-tertiary">
                {role === "mine"
                  ? "Found something that belongs to you? Browse found items and submit a claim."
                  : "When someone claims an item you reported as found, it will show up here."}
              </p>
              {role === "mine" && (
                <Link
                  href="/found-items"
                  className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4"
                >
                  Browse found items
                </Link>
              )}
            </section>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="block rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <span className="font-mono text-[10px] text-tertiary">
                      {role === "mine" ? "Submitted" : "Received"} {formatDate(claim.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-primary">
                    {claim.justification}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs leading-5 text-tertiary">
                    Item details: {claim.itemDetails}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    View claim <ArrowRight aria-hidden="true" size={13} />
                  </p>
                </Link>
              ))}
            </div>
          )}

          <section className="flex flex-col gap-4 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-tertiary">
              Showing{" "}
              <span className="font-semibold text-primary">
                {total === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
              </span>{" "}
              of <span className="font-semibold text-primary">{total}</span> claims
            </p>
            <nav aria-label="Claims pages" className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || claimsQuery.isFetching}
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
                disabled={page >= totalPages || claimsQuery.isFetching}
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
