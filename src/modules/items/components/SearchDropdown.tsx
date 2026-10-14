"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { Item } from "../types/item";

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
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getItemDetailHref(item: Item) {
  const type = (item.type ?? "").toUpperCase();
  return type.includes("LOST") ? `/lost-items/${item.id}` : `/found-items/${item.id}`;
}

export function SearchDropdown({
  items,
  total,
  query,
  onClose,
}: {
  items: Item[];
  total: number;
  query: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 w-full rounded-xl border border-neutral/60 bg-white shadow-lg">
      <div className="max-h-[420px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f5f7] text-tertiary">
              <Search aria-hidden="true" size={18} />
            </div>
            <p className="mt-2 text-sm font-medium text-primary">No items found</p>
            <p className="mt-1 text-xs text-tertiary">
              No results for &ldquo;{query}&rdquo;. Try a different search term.
            </p>
          </div>
        ) : (
          <ul role="listbox" className="divide-y divide-neutral/50">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={getItemDetailHref(item)}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#f8f9fa]"
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#ececef]">
                    {item.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-400">
                        <Search aria-hidden="true" size={16} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-primary">
                        {item.title}
                      </span>
                      <span className="shrink-0 rounded bg-[#f4f5f7] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                        {getItemTypeLabel(item.type)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-tertiary">
                      {item.category} · {formatDate(item.date)} · {item.location}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                    {STATUS_LABELS[item.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {total > 0 && (
          <div className="border-t border-neutral/50 px-4 py-2.5 text-center">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="text-xs font-semibold text-primary transition hover:text-secondary"
            >
              View all {total} results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}