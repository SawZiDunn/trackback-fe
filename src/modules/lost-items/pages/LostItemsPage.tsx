"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useLostItems, useRecoverLostItem } from "../api/lostItemApi";
import { LOST_ITEM_CATEGORIES } from "../constants/categories";
import type { LostItem, LostItemStatus, LostItemsFilters } from "../types/lostItem";

const PAGE_SIZE = 8;

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

function LostItemCard({
  item,
  onView,
}: {
  item: LostItem;
  onView: (item: LostItem) => void;
}) {
  return (
    <article className="group flex overflow-hidden rounded-xl border border-neutral/60 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ececef]">
        {item.photoUrl ? (
          <Image
            src={item.photoUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ImagePlus aria-hidden="true" size={38} strokeWidth={1.4} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold tracking-wide text-white">
          {item.status === "OPEN" ? "LOST" : item.status.replace("_", " ")}
        </span>
        <span className="absolute bottom-3 left-3 rounded bg-white/95 px-2 py-1 font-mono text-[10px] font-semibold text-primary shadow-xs">
          ID: {item.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary">
            {item.category}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-tertiary">
            {formatDate(item.lastSeenDate)}
          </span>
        </div>
        <h2 className="text-base font-semibold leading-snug tracking-tight text-primary">
          {item.title}
        </h2>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-tertiary">
          <MapPin aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          <span>{item.lastSeenLocation}</span>
        </p>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-neutral-600">
          {item.description}
        </p>
        <button
          type="button"
          onClick={() => onView(item)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f4f5f7] px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-neutral"
        >
          View Details <ArrowRight aria-hidden="true" size={14} />
        </button>
      </div>
    </article>
  );
}

function ItemDetailsDialog({
  item,
  isOwner,
  isRecovering,
  error,
  onClose,
  onRecover,
}: {
  item: LostItem;
  isOwner: boolean;
  isRecovering: boolean;
  error: string | null;
  onClose: () => void;
  onRecover: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isRecovering) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-details-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative aspect-[16/9] bg-[#ececef]">
          {item.photoUrl ? (
            <Image
              src={item.photoUrl}
              alt={item.title}
              fill
              sizes="(max-width: 672px) 100vw, 672px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <ImagePlus aria-hidden="true" size={48} strokeWidth={1.3} />
            </div>
          )}
          <button
            type="button"
            aria-label="Close item details"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-primary shadow-sm transition hover:bg-white"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
              {item.category}
            </span>
            <span className="font-mono text-[11px] text-tertiary">
              ID: {item.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h2 id="item-details-title" className="mt-3 text-2xl font-semibold tracking-tight">
            {item.title}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-tertiary sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              {item.lastSeenLocation}
            </p>
            <p className="flex items-start gap-2">
              <CalendarDays aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              Last seen {formatDate(item.lastSeenDate)}
            </p>
          </div>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
            {item.description}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral/60 pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral/70 px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#f4f5f7]"
            >
              Close
            </button>
            {isOwner && item.status === "OPEN" && (
              <button
                type="button"
                onClick={onRecover}
                disabled={isRecovering}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-60"
              >
                {isRecovering ? (
                  <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                ) : (
                  <Check aria-hidden="true" size={16} />
                )}
                Mark as recovered
              </button>
            )}
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export function LostItemsPage() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<LostItemStatus | "">("OPEN");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [recoverError, setRecoverError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  const filters = useMemo<LostItemsFilters>(
    () => ({
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      ...(category ? { category } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(status ? { status } : {}),
    }),
    [category, debouncedKeyword, location, status],
  );
  const lostItemsQuery = useLostItems(page, filters);
  const recoverLostItem = useRecoverLostItem();

  const items = lostItemsQuery.data?.items ?? [];
  const total = lostItemsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetFilters = () => {
    setKeyword("");
    setCategory("");
    setLocation("");
    setStatus("OPEN");
    setPage(1);
  };

  const handleRecover = async () => {
    if (!selectedItem) return;
    setRecoverError(null);
    try {
      await recoverLostItem.mutateAsync(selectedItem.id);
      setSelectedItem({ ...selectedItem, status: "RECOVERED" });
      setPage(1);
    } catch (error) {
      setRecoverError(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-tertiary">
                <span className="rounded bg-[#f1f1f3] px-2 py-1 font-semibold tracking-wide">
                  DIRECTORY // SECTION 02
                </span>
                <span>
                  {status === "OPEN" ? `${total} Open Cases` : `${total} Lost Items`}
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">
                Lost Items Directory
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-tertiary sm:text-base">
                Browse items reported missing across campus. If you have found one, help return it
                or report a match.
              </p>
            </div>
          </section>

          <section
            aria-label="Filter lost items"
            className="space-y-4 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6"
          >
            <label className="flex items-center gap-3 rounded-lg bg-[#f4f5f7] px-4 py-3 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/25">
              <Search aria-hidden="true" size={17} className="shrink-0 text-tertiary" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Search lost items by name, description, category, or location…"
                aria-label="Search lost items"
                className="min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-neutral-500"
              />
              {keyword && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setKeyword("")}
                  className="rounded p-1 text-tertiary hover:bg-neutral/60 hover:text-primary"
                >
                  <X aria-hidden="true" size={15} />
                </button>
              )}
              <kbd className="hidden rounded border border-neutral/70 bg-white px-2 py-1 font-mono text-[10px] text-tertiary sm:inline">
                CTRL+K
              </kbd>
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                Category
                <span className="relative block">
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setPage(1);
                    }}
                    className="w-full appearance-none rounded-lg bg-[#f4f5f7] px-3.5 py-3 pr-9 text-sm font-normal normal-case tracking-normal text-primary outline-none transition focus:ring-1 focus:ring-primary/25"
                  >
                    <option value="">All Categories</option>
                    {LOST_ITEM_CATEGORIES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
                  />
                </span>
              </label>
              <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                Campus Location
                <span className="relative block">
                  <MapPin
                    aria-hidden="true"
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
                  />
                  <input
                    value={location}
                    onChange={(event) => {
                      setLocation(event.target.value);
                      setPage(1);
                    }}
                    placeholder="All Locations"
                    aria-label="Filter by campus location"
                    className="w-full rounded-lg bg-[#f4f5f7] py-3 pl-9 pr-3.5 text-sm font-normal normal-case tracking-normal text-primary outline-none transition placeholder:text-primary focus:bg-white focus:ring-1 focus:ring-primary/25"
                  />
                </span>
              </label>
              <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                Status
                <span className="relative block">
                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value as LostItemStatus | "");
                      setPage(1);
                    }}
                    className="w-full appearance-none rounded-lg bg-[#f4f5f7] px-3.5 py-3 pr-9 text-sm font-normal normal-case tracking-normal text-primary outline-none transition focus:ring-1 focus:ring-primary/25"
                  >
                    <option value="OPEN">Active / Open</option>
                    <option value="RECOVERED">Recovered</option>
                    <option value="CLOSED">Closed</option>
                    <option value="">All Statuses</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
                  />
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-neutral/50 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                  Active criteria:
                </span>
                <span className="rounded-full bg-[#f4f5f7] px-3 py-1.5 font-mono text-[11px] text-primary">
                  Category: {category || "All"}
                </span>
                <span className="rounded-full bg-[#f4f5f7] px-3 py-1.5 font-mono text-[11px] text-primary">
                  Status: {status || "All"}
                </span>
                {(keyword || location || category || status !== "OPEN") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-2 py-1 text-[11px] font-medium text-tertiary underline underline-offset-4 transition hover:text-primary"
                  >
                    Reset parameters
                  </button>
                )}
              </div>
              <p className="font-mono text-[11px] text-tertiary" aria-live="polite">
                Showing{" "}
                <span className="font-semibold text-primary">
                  {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)}
                </span>{" "}
                of <span className="font-semibold text-primary">{total}</span> items
              </p>
            </div>
          </section>

          {lostItemsQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <div className="flex items-center gap-3 text-sm text-tertiary">
                <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-primary" />
                Loading lost items…
              </div>
            </div>
          ) : lostItemsQuery.isError ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-primary">Could not load lost items</h2>
              <p className="mt-2 text-sm text-tertiary">{getErrorMessage(lostItemsQuery.error)}</p>
              <button
                type="button"
                onClick={() => void lostItemsQuery.refetch()}
                className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Try again
              </button>
            </section>
          ) : items.length === 0 ? (
            <section className="rounded-2xl border border-neutral/60 bg-white px-6 py-14 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-tertiary">
                <Search aria-hidden="true" size={20} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-primary">No lost items found</h2>
              <p className="mt-1 text-sm text-tertiary">
                Try changing your search or filters to find what you are looking for.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-primary underline underline-offset-4"
              >
                Reset filters
              </button>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => (
                <LostItemCard key={item.id} item={item} onView={setSelectedItem} />
              ))}
            </div>
          )}

          <section className="flex flex-col gap-4 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-tertiary">
              Showing{" "}
              <span className="font-semibold text-primary">
                {total === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
              </span>{" "}
              of <span className="font-semibold text-primary">{total}</span> lost items
            </p>
            <nav aria-label="Lost items pages" className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || lostItemsQuery.isFetching}
                className="inline-flex items-center gap-1 rounded-md bg-[#f4f5f7] px-3 py-2 text-xs font-medium text-primary transition hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40"
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
                disabled={page >= totalPages || lostItemsQuery.isFetching}
                className="inline-flex items-center gap-1 rounded-md bg-[#f4f5f7] px-3 py-2 text-xs font-medium text-primary transition hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight aria-hidden="true" size={13} />
              </button>
            </nav>
          </section>

          <section className="flex flex-col gap-5 rounded-xl bg-[#f1f1f3] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <h2 className="text-sm font-semibold text-primary">
                  Found something that matches a listing?
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-tertiary">
                  Help reunite a campus community member with their belongings. Browse found items
                  and report a match.
                </p>
              </div>
            </div>
            <a
              href="/found-items"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-primary shadow-xs transition hover:bg-neutral"
            >
              Browse Found Items <ArrowRight aria-hidden="true" size={14} />
            </a>
          </section>
        </div>
      </main>
      <Footer />

      {selectedItem && (
        <ItemDetailsDialog
          item={selectedItem}
          isOwner={Boolean(user?.id && selectedItem.userId === user.id)}
          isRecovering={recoverLostItem.isPending}
          error={recoverError}
          onClose={() => {
            if (!recoverLostItem.isPending) {
              setSelectedItem(null);
              setRecoverError(null);
            }
          }}
          onRecover={() => void handleRecover()}
        />
      )}
    </div>
  );
}
