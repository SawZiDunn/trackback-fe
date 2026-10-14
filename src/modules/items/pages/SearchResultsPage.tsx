"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Header } from "@/common/components/Header";
import { Footer } from "@/common/components/Footer";
import { useSearchItems } from "@/modules/items/api/itemApi";
import type { Item } from "@/modules/items/types/item";

function getItemTypeLabel(type: Item["type"]): string {
  const t = (type ?? "").toUpperCase();
  return t.includes("LOST") ? "Lost" : "Found";
}

const STATUS_LABELS: Record<Item["status"], string> = {
  OPEN: "Open",
  RECOVERED: "Recovered",
  CLOSED: "Closed",
  PENDING_CLAIM: "Pending Claim",
  CLAIMED: "Claimed",
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function getItemDetailHref(item: Item) {
  const type = (item.type ?? "").toUpperCase();
  return type.includes("LOST")
    ? `/lost-items/${item.id}`
    : `/found-items/${item.id}`;
}

export function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const { data, isLoading, error } = useSearchItems({ query });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-tertiary">
              <span className="rounded bg-[#f1f1f3] px-2 py-1 font-semibold tracking-wide">
                DIRECTORY // SEARCH
              </span>
              <span>{total} results</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">
                Search Results
              </h1>
            </div>
            <p className="mt-2 text-sm leading-6 text-tertiary">
              Showing results for &ldquo;{query}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back to previous page"
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-md py-1 -ml-1 px-1">
              <ArrowLeft
                aria-hidden="true"
                className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              />
              <span>Back</span>
            </button>
          </section>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <p className="text-sm text-tertiary">Searching items…</p>
            </div>
          ) : error ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-primary">
                Could not load search results
              </h2>
              <p className="mt-2 text-sm text-tertiary">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong."}
              </p>
            </section>
          ) : items.length === 0 ? (
            <section className="rounded-2xl border border-neutral/60 bg-white px-6 py-14 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-tertiary">
                <Search aria-hidden="true" size={20} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-primary">
                No items found
              </h2>
              <p className="mt-1 text-sm text-tertiary">
                No results for &ldquo;{query}&rdquo;. Try a different search
                term.
              </p>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={getItemDetailHref(item)}
                  className="group flex overflow-hidden rounded-xl border border-neutral/60 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-square w-[40%] shrink-0 overflow-hidden bg-[#ececef]">
                    {item.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-400">
                        <Search
                          aria-hidden="true"
                          size={38}
                          strokeWidth={1.4}
                        />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold tracking-wide text-white">
                      {getItemTypeLabel(item.type)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary">
                        {item.category}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-tertiary">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold leading-snug tracking-tight text-primary">
                      {item.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-neutral-600">
                      {item.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-neutral/50 pt-3">
                      <span className="font-mono text-[10px] text-tertiary">
                        {item.location}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
