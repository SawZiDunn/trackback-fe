"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, UploadCloud, X } from "lucide-react";
import type { FoundItem } from "@/modules/found-items/types/foundItem";
import type { SubmitClaimPayload } from "../types/claim";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ClaimItemDialog({
  item,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  item: FoundItem;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: SubmitClaimPayload, proofImage?: File) => Promise<void>;
}) {
  const [proofImage, setProofImage] = useState<File>();
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    },
    [proofPreviewUrl],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageError) return;
    const values = new FormData(event.currentTarget);
    await onSubmit(
      {
        justification: String(values.get("justification") ?? "").trim(),
        itemDetails: String(values.get("itemDetails") ?? "").trim(),
      },
      proofImage,
    );
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
        aria-labelledby="claim-item-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
              Claim found item
            </p>
            <h2 id="claim-item-title" className="mt-1 text-2xl font-semibold tracking-tight">
              This is mine
            </h2>
            <p className="mt-1 text-sm text-tertiary">
              Tell the finder why <span className="font-semibold text-primary">{item.title}</span>{" "}
              belongs to you. They will review your claim.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close claim form"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full p-2 text-tertiary transition hover:bg-[#f4f5f7] hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block space-y-1.5 text-xs font-medium text-primary">
            Why is this item yours?
            <textarea
              name="justification"
              required
              maxLength={1000}
              rows={3}
              placeholder="e.g. The initials and unique scratch on the item match mine."
              className="w-full resize-y rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-primary">
            Describe the item in detail
            <textarea
              name="itemDetails"
              required
              maxLength={1000}
              rows={3}
              placeholder="e.g. Black wallet with my student card and three bank cards inside."
              className="w-full resize-y rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          <div className="space-y-2">
            <p className="text-xs font-medium text-primary">
              Proof photo <span className="font-normal text-tertiary">(optional)</span>
            </p>
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-[#f4f5f7] p-4 text-center transition hover:border-primary hover:bg-[#f1f1f3]">
              {proofPreviewUrl ? (
                <div className="relative h-28 w-full max-w-xs">
                  <Image
                    src={proofPreviewUrl}
                    alt="Proof photo preview"
                    fill
                    unoptimized
                    className="rounded-lg object-contain"
                  />
                </div>
              ) : (
                <>
                  <UploadCloud aria-hidden="true" size={22} className="mb-2 text-tertiary" />
                  <span className="text-sm font-medium text-primary">Choose a proof photo</span>
                  <span className="mt-1 text-xs text-tertiary">JPG, PNG, or WebP · Up to 5 MB</span>
                </>
              )}
              <input
                name="proofPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isSubmitting}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!IMAGE_TYPES.includes(file.type)) {
                    event.target.value = "";
                    setProofImage(undefined);
                    setProofPreviewUrl(null);
                    setImageError("Choose a JPG, PNG, or WebP image.");
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    event.target.value = "";
                    setProofImage(undefined);
                    setProofPreviewUrl(null);
                    setImageError("The image must be 5 MB or smaller.");
                    return;
                  }
                  setProofImage(file);
                  setImageError(null);
                  setProofPreviewUrl(URL.createObjectURL(file));
                }}
              />
            </label>
            {imageError && <p role="alert" className="text-xs text-red-600">{imageError}</p>}
            {proofImage && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setProofImage(undefined);
                  setProofPreviewUrl(null);
                  setImageError(null);
                }}
                className="cursor-pointer text-xs font-medium text-tertiary underline underline-offset-4 transition hover:text-primary disabled:cursor-not-allowed"
              >
                Remove photo
              </button>
            )}
          </div>
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
            <button
              type="submit"
              disabled={isSubmitting || Boolean(imageError)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : "Submit claim"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
