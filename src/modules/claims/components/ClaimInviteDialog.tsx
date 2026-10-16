"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Send, X } from "lucide-react";
import type { MyPost } from "@/modules/my-posts/types/myPost";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ClaimInviteDialog({
  lostItemTitle,
  foundItems,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  lostItemTitle: string;
  foundItems: MyPost[];
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (foundItemPostId: string) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState(foundItems[0]?.id ?? "");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId) return;
    await onSubmit(selectedId);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-invite-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
              Help reunite this item
            </p>
            <h2 id="claim-invite-title" className="mt-1 text-2xl font-semibold tracking-tight">
              I have this
            </h2>
            <p className="mt-1 text-sm text-tertiary">
              {foundItems.length > 0 ? (
                <>
                  Pick which of your found items matches{" "}
                  <span className="font-semibold text-primary">{lostItemTitle}</span>. The owner
                  will be notified and can submit a claim to confirm it.
                </>
              ) : (
                <>
                  First report the item you have as a found item, then invite the owner of{" "}
                  <span className="font-semibold text-primary">{lostItemTitle}</span> to claim it.
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close claim invite form"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full p-2 text-tertiary transition hover:bg-[#f4f5f7] hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          {foundItems.length > 0 ? (
            <fieldset className="space-y-2.5">
              <legend className="text-xs font-medium text-primary">Your open found items</legend>
              {foundItems.map((foundItem) => {
                const isSelected = foundItem.id === selectedId;
                return (
                  <label
                    key={foundItem.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-neutral/70 bg-[#f4f5f7] hover:bg-[#ececef]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="foundItem"
                      value={foundItem.id}
                      checked={isSelected}
                      onChange={() => setSelectedId(foundItem.id)}
                      disabled={isSubmitting}
                      className="mt-1 cursor-pointer accent-[#09090b]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-primary">{foundItem.title}</span>
                        <span className="font-mono text-[10px] text-tertiary">
                          {formatDate(foundItem.date)}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-tertiary">
                        {foundItem.category} · {foundItem.location}
                      </span>
                      <span className="mt-1 line-clamp-1 block text-xs leading-5 text-neutral-600">
                        {foundItem.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-400 bg-[#f4f5f7] p-6 text-center">
              <p className="text-sm font-semibold text-primary">No open found items yet</p>
              <p className="mt-1.5 text-xs leading-5 text-tertiary">
                The invite points the owner to one of your found posts, so they can verify and
                claim it — report the item you&apos;re holding to get started.
              </p>
            </div>
          )}

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-neutral/70 px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            {foundItems.length > 0 ? (
              <button
                type="submit"
                disabled={isSubmitting || !selectedId}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send aria-hidden="true" size={15} />
                    Notify owner
                  </>
                )}
              </button>
            ) : (
              <Link
                href="/found-items/report"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Report found item
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
