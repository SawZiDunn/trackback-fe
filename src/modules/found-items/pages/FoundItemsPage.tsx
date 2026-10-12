"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { showToast } from "nextjs-toast-notify";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ClaimItemDialog } from "@/modules/claims/components/ClaimItemDialog";
import { useSubmitClaim } from "@/modules/claims/api/claimApi";
import type { SubmitClaimPayload } from "@/modules/claims/types/claim";
import { LOST_ITEM_CATEGORIES } from "@/modules/lost-items/constants/categories";
import {
  useDeleteFoundItem,
  useFoundItems,
  useUpdateFoundItem,
} from "../api/foundItemApi";
import type {
  FoundItem,
  FoundItemStatus,
  FoundItemsFilters,
  UpdateFoundItemPayload,
} from "../types/foundItem";

const PAGE_SIZE = 8;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function localDateValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function FoundItemCard({ item, onView }: { item: FoundItem; onView: (item: FoundItem) => void }) {
  return (
    <article className="group flex overflow-hidden rounded-xl border border-neutral/60 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square w-[40%] shrink-0 overflow-hidden bg-[#ececef]">
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
          {item.status.replaceAll("_", " ")}
        </span>
        <span className="absolute bottom-3 left-3 rounded bg-white/95 px-2 py-1 font-mono text-[10px] font-semibold text-primary shadow-xs">
          ID: {item.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary">
            {item.category}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-tertiary">
            {formatDate(item.foundDate)}
          </span>
        </div>
        <h2 className="text-base font-semibold leading-snug tracking-tight text-primary">
          {item.title}
        </h2>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-tertiary">
          <MapPin aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          <span>{item.foundLocation}</span>
        </p>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-neutral-600">
          {item.description}
        </p>
        <button
          type="button"
          onClick={() => onView(item)}
          className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#f4f5f7] px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-neutral"
        >
          View Details <ArrowRight aria-hidden="true" size={14} />
        </button>
      </div>
    </article>
  );
}

function EditFoundItemDialog({
  item,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  item: FoundItem;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: UpdateFoundItemPayload, image?: File) => Promise<void>;
}) {
  const [image, setImage] = useState<File>();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const categories = LOST_ITEM_CATEGORIES.includes(
    item.category as (typeof LOST_ITEM_CATEGORIES)[number],
  )
    ? LOST_ITEM_CATEGORIES
    : [item.category, ...LOST_ITEM_CATEGORIES];

  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageError) return;
    const values = new FormData(event.currentTarget);
    const foundDate = String(values.get("date") ?? "");
    await onSubmit(
      {
        title: String(values.get("title") ?? "").trim(),
        category: String(values.get("category") ?? "").trim(),
        description: String(values.get("description") ?? "").trim(),
        foundLocation: String(values.get("location") ?? "").trim(),
        foundDate: new Date(`${foundDate}T00:00:00.000Z`).toISOString(),
        ...(removeImage ? { photoUrl: null } : {}),
      },
      image,
    );
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-found-item-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
              Update your listing
            </p>
            <h2 id="edit-found-item-title" className="mt-1 text-2xl font-semibold tracking-tight">
              Edit Found Item
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close edit form"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer rounded-full p-2 text-tertiary transition hover:bg-[#f4f5f7] hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block space-y-1.5 text-xs font-medium text-primary">
            Item name
            <input
              name="title"
              required
              maxLength={120}
              defaultValue={item.title}
              className="w-full rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-xs font-medium text-primary">
              Category
              <span className="relative block">
                <select
                  name="category"
                  required
                  defaultValue={item.category}
                  className="w-full appearance-none rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 pr-9 text-sm outline-none transition focus:border-primary focus:bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
                />
              </span>
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-primary">
              Found date
              <input
                name="date"
                type="date"
                required
                max={localDateValue()}
                defaultValue={item.foundDate.slice(0, 10)}
                className="w-full rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
              />
            </label>
          </div>
          <label className="block space-y-1.5 text-xs font-medium text-primary">
            Found location
            <input
              name="location"
              required
              maxLength={160}
              defaultValue={item.foundLocation}
              className="w-full rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-primary">
            Description
            <textarea
              name="description"
              required
              maxLength={1000}
              rows={4}
              defaultValue={item.description}
              className="w-full resize-y rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          <div className="space-y-2">
            <p className="text-xs font-medium text-primary">Item image</p>
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-[#f4f5f7] p-4 text-center transition hover:border-primary hover:bg-[#f1f1f3]">
              {imagePreviewUrl || (item.photoUrl && !removeImage && !image) ? (
                <div className="relative h-32 w-full max-w-xs">
                  <Image
                    src={imagePreviewUrl ?? item.photoUrl!}
                    alt="Found item image preview"
                    fill
                    unoptimized
                    className="rounded-lg object-contain"
                  />
                </div>
              ) : (
                <>
                  <UploadCloud aria-hidden="true" size={24} className="mb-2 text-tertiary" />
                  <span className="text-sm font-medium text-primary">
                    {removeImage ? "Upload a replacement image" : "Choose an image"}
                  </span>
                  <span className="mt-1 text-xs text-tertiary">JPG, PNG, or WebP · Up to 5 MB</span>
                </>
              )}
              <input
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isSaving}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!IMAGE_TYPES.includes(file.type)) {
                    event.target.value = "";
                    setImage(undefined);
                    setImagePreviewUrl(null);
                    setImageError("Choose a JPG, PNG, or WebP image.");
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    event.target.value = "";
                    setImage(undefined);
                    setImagePreviewUrl(null);
                    setImageError("The image must be 5 MB or smaller.");
                    return;
                  }
                  setImage(file);
                  setRemoveImage(false);
                  setImageError(null);
                  setImagePreviewUrl(URL.createObjectURL(file));
                }}
              />
            </label>
            {imageError && <p role="alert" className="text-xs text-red-600">{imageError}</p>}
            {(image || (item.photoUrl && !removeImage)) && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setImage(undefined);
                  setImagePreviewUrl(null);
                  setImageError(null);
                  setRemoveImage(true);
                }}
                className="cursor-pointer text-xs font-medium text-tertiary underline underline-offset-4 transition hover:text-primary disabled:cursor-not-allowed"
              >
                Remove image
              </button>
            )}
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="cursor-pointer rounded-lg border border-neutral/70 px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || Boolean(imageError)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                  Saving…
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FoundItemDetailsDialog({
  item,
  isOwner,
  isDeleting,
  onEdit,
  onClaim,
  onClose,
  onDelete,
}: {
  item: FoundItem;
  isOwner: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onClaim: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="found-item-details-title"
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
            aria-label="Close found item details"
            onClick={onClose}
            disabled={isDeleting}
            className="absolute right-3 top-3 cursor-pointer rounded-full bg-white/90 p-2 text-primary shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X aria-hidden="true" size={18} />
          </button>
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
          <h2 id="found-item-details-title" className="mt-3 text-2xl font-semibold tracking-tight">
            {item.title}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-tertiary sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              {item.foundLocation}
            </p>
            <p className="flex items-start gap-2">
              <CalendarDays aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              Found {formatDate(item.foundDate)}
            </p>
          </div>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
            {item.description}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral/60 pt-5 sm:flex-row sm:justify-end">
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isOwner && item.status === "OPEN" && (
                <button
                  type="button"
                  onClick={onClaim}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
                >
                  This is mine
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={onEdit}
                    disabled={isDeleting}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral/70 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Pencil aria-hidden="true" size={15} />
                    Edit item
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                    Delete item
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ConfirmDeleteFoundItemDialog({
  item,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: {
  item: FoundItem;
  isDeleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-found-item-title"
        aria-describedby="delete-found-item-description"
        className="w-full max-w-md rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
            <Trash2 aria-hidden="true" size={20} />
          </span>
          <div>
            <h2 id="delete-found-item-title" className="text-lg font-semibold text-primary">
              Delete this found item?
            </h2>
            <p id="delete-found-item-description" className="mt-2 text-sm leading-6 text-tertiary">
              This will permanently delete <span className="font-semibold text-primary">{item.title}</span>.
              This action cannot be undone.
            </p>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg border border-neutral/70 px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 aria-hidden="true" size={15} />
                Delete item
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export function FoundItemsPage() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<FoundItemStatus | "">("OPEN");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  const filters = useMemo<FoundItemsFilters>(
    () => ({
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      ...(category ? { category } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo: `${dateTo}T23:59:59.999Z` } : {}),
      ...(status ? { status } : {}),
    }),
    [category, dateFrom, dateTo, debouncedKeyword, location, status],
  );

  const foundItemsQuery = useFoundItems(page, filters);
  const updateFoundItem = useUpdateFoundItem();
  const deleteFoundItem = useDeleteFoundItem();
  const submitClaim = useSubmitClaim();
  const items = foundItemsQuery.data?.items ?? [];
  const total = foundItemsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const resetFilters = () => {
    setKeyword("");
    setCategory("");
    setLocation("");
    setDateFrom("");
    setDateTo("");
    setStatus("");
    setPage(1);
  };

  const handleUpdate = async (payload: UpdateFoundItemPayload, image?: File) => {
    if (!selectedItem || selectedItem.userId !== user?.id) return;
    setEditError(null);
    try {
      const updatedItem = await updateFoundItem.mutateAsync({
        itemId: selectedItem.id,
        payload,
        image,
      });
      setSelectedItem(updatedItem);
      setIsEditing(false);
      showToast.success("Found item report updated successfully.");
    } catch (error) {
      setEditError(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || selectedItem.userId !== user?.id) return;
    setDeleteError(null);
    try {
      await deleteFoundItem.mutateAsync(selectedItem.id);
      setIsConfirmingDelete(false);
      setSelectedItem(null);
      showToast.success("Found item deleted successfully.");
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    }
  };

  const handleSubmitClaim = async (payload: SubmitClaimPayload, proofImage?: File) => {
    if (!selectedItem) return;
    setClaimError(null);
    try {
      await submitClaim.mutateAsync({
        foundItemPostId: selectedItem.id,
        payload,
        proofImage,
      });
      setIsClaiming(false);
      setSelectedItem(null);
      showToast.success("Claim submitted. The finder has been notified and will review it.");
    } catch (error) {
      setClaimError(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-tertiary">
                  <span className="rounded bg-[#f1f1f3] px-2 py-1 font-semibold tracking-wide">
                    DIRECTORY // FOUND ITEMS
                  </span>
                  <span>{total} {status === "OPEN" ? "Open Listings" : "Found Items"}</span>
                </div>
                <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">
                  Found Items Directory
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-tertiary sm:text-base">
                  Browse items found across campus. Check the details and use the claim action if an item belongs to you.
                </p>
              </div>
              <Link
                href="/found-items/report"
                className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white/85! shadow-sm transition hover:bg-secondary"
              >
                <span aria-hidden="true" className="text-lg leading-none">+</span>
                Report New Found Item
              </Link>
            </div>
          </section>

          <section
            aria-label="Filter found items"
            className="space-y-4 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6"
          >
            <label className="flex items-center gap-3 rounded-lg bg-[#f4f5f7] px-4 py-3 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/25">
              <Search aria-hidden="true" size={17} className="shrink-0 text-tertiary" />
              <input
                type="text"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Search found items by name, description, category, or location…"
                aria-label="Search found items"
                className="min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-neutral-500"
              />
              {keyword && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setKeyword("")}
                  className="cursor-pointer rounded p-1 text-tertiary hover:bg-neutral/60 hover:text-primary"
                >
                  <X aria-hidden="true" size={15} />
                </button>
              )}
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
                      <option key={value} value={value}>{value}</option>
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
                    aria-label="Filter by found location"
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
                      setStatus(event.target.value as FoundItemStatus | "");
                      setPage(1);
                    }}
                    className="w-full appearance-none rounded-lg bg-[#f4f5f7] px-3.5 py-3 pr-9 text-sm font-normal normal-case tracking-normal text-primary outline-none transition focus:ring-1 focus:ring-primary/25"
                  >
                    <option value="OPEN">Open</option>
                    <option value="PENDING_CLAIM">Pending Claim</option>
                    <option value="CLAIMED">Claimed</option>
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
              <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                Found from
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg bg-[#f4f5f7] px-3.5 py-3 text-sm font-normal normal-case tracking-normal text-primary outline-none transition focus:ring-1 focus:ring-primary/25"
                />
              </label>
              <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                Found to
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg bg-[#f4f5f7] px-3.5 py-3 text-sm font-normal normal-case tracking-normal text-primary outline-none transition focus:ring-1 focus:ring-primary/25"
                />
              </label>
            </div>
            {invalidDateRange && (
              <p role="alert" className="text-xs text-red-600">
                The start date must be on or before the end date.
              </p>
            )}
            <div className="flex flex-col gap-3 border-t border-neutral/50 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
                  Active criteria:
                </span>
                <span className="rounded-full bg-[#f4f5f7] px-3 py-1.5 font-mono text-[11px] text-primary">
                  Category: {category || "All"}
                </span>
                <span className="rounded-full bg-[#f4f5f7] px-3 py-1.5 font-mono text-[11px] text-primary">
                  Status: {status ? status.replaceAll("_", " ") : "All"}
                </span>
                {(keyword || location || category || dateFrom || dateTo || status) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="cursor-pointer px-2 py-1 text-[11px] font-medium text-tertiary underline underline-offset-4 transition hover:text-primary"
                  >
                    Reset filters
                  </button>
                )}
              </div>
              <p className="font-mono text-[11px] text-tertiary" aria-live="polite">
                Showing <span className="font-semibold text-primary">
                  {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                </span>{" "}of <span className="font-semibold text-primary">{total}</span> items
              </p>
            </div>
          </section>

          {invalidDateRange ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-neutral/60 bg-white text-sm text-tertiary">
              Adjust the date range to search found items.
            </div>
          ) : foundItemsQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
              <div className="flex items-center gap-3 text-sm text-tertiary">
                <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-primary" />
                Loading found items…
              </div>
            </div>
          ) : foundItemsQuery.isError ? (
            <section className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-primary">Could not load found items</h2>
              <p className="mt-2 text-sm text-tertiary">{getErrorMessage(foundItemsQuery.error)}</p>
              <button
                type="button"
                onClick={() => void foundItemsQuery.refetch()}
                className="mt-5 cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Try again
              </button>
            </section>
          ) : items.length === 0 ? (
            <section className="rounded-2xl border border-neutral/60 bg-white px-6 py-14 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-tertiary">
                <Search aria-hidden="true" size={20} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-primary">No found items found</h2>
              <p className="mt-1 text-sm text-tertiary">
                Try changing your search or filters to find what you are looking for.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 cursor-pointer text-sm font-semibold text-primary underline underline-offset-4"
              >
                Reset filters
              </button>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <FoundItemCard key={item.id} item={item} onView={setSelectedItem} />
              ))}
            </div>
          )}

          <section className="flex flex-col gap-4 rounded-2xl border border-neutral/60 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-tertiary">
              Showing <span className="font-semibold text-primary">
                {total === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
              </span>{" "}of <span className="font-semibold text-primary">{total}</span> found items
            </p>
            <nav aria-label="Found items pages" className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || foundItemsQuery.isFetching}
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
                disabled={page >= totalPages || foundItemsQuery.isFetching}
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

      {selectedItem && !isEditing && !isConfirmingDelete && !isClaiming && (
        <FoundItemDetailsDialog
          item={selectedItem}
          isOwner={Boolean(user?.id && selectedItem.userId === user.id)}
          isDeleting={deleteFoundItem.isPending}
          onEdit={() => {
            setEditError(null);
            setIsEditing(true);
          }}
          onClaim={() => {
            setClaimError(null);
            setIsClaiming(true);
          }}
          onClose={() => {
            if (!deleteFoundItem.isPending) {
              setSelectedItem(null);
              setDeleteError(null);
              setEditError(null);
            }
          }}
          onDelete={() => {
            setDeleteError(null);
            setIsConfirmingDelete(true);
          }}
        />
      )}
      {selectedItem && isClaiming && (
        <ClaimItemDialog
          item={selectedItem}
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
      {selectedItem && isEditing && (
        <EditFoundItemDialog
          item={selectedItem}
          isSaving={updateFoundItem.isPending}
          error={editError}
          onClose={() => {
            if (!updateFoundItem.isPending) {
              setIsEditing(false);
              setEditError(null);
            }
          }}
          onSubmit={handleUpdate}
        />
      )}
      {selectedItem && isConfirmingDelete && (
        <ConfirmDeleteFoundItemDialog
          item={selectedItem}
          isDeleting={deleteFoundItem.isPending}
          error={deleteError}
          onCancel={() => {
            if (!deleteFoundItem.isPending) {
              setIsConfirmingDelete(false);
              setDeleteError(null);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}
