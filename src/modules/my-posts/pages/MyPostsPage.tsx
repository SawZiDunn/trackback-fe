"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { showToast } from "nextjs-toast-notify";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { LOST_ITEM_CATEGORIES } from "@/modules/lost-items/constants/categories";
import {
  useDeleteLostItem,
  useRecoverLostItem,
  useUpdateLostItem,
} from "@/modules/lost-items/api/lostItemApi";
import {
  useDeleteFoundItem,
  useUpdateFoundItem,
} from "@/modules/found-items/api/foundItemApi";
import { useMyPosts } from "../api/myPostsApi";
import type { MyPost, MyPostType, MyPostUpdateValues } from "../types/myPost";

const PAGE_SIZE = 8;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EMPTY_POSTS: MyPost[] = [];

type PostFilter = "ALL" | MyPostType;
type DialogMode = "details" | "edit" | "delete";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getDateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
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

function statusLabel(status: MyPost["status"]) {
  return status.replaceAll("_", " ");
}

function MyPostCard({
  post,
  onView,
  onEdit,
  onDelete,
  onRecover,
}: {
  post: MyPost;
  onView: (post: MyPost) => void;
  onEdit: (post: MyPost) => void;
  onDelete: (post: MyPost) => void;
  onRecover: (post: MyPost) => void;
}) {
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-neutral/60 bg-white p-4 shadow-xs transition hover:shadow-md sm:flex-row sm:items-center sm:p-5">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-[#ececef] sm:aspect-square sm:w-32">
        {post.photoUrl ? (
          <Image
            src={post.photoUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, 128px"
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ImagePlus aria-hidden="true" size={34} strokeWidth={1.4} />
          </div>
        )}
        <span className="absolute bottom-2 left-2 rounded bg-white/95 px-2 py-1 font-mono text-[9px] font-semibold text-primary shadow-xs">
          #{post.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold tracking-wide text-white">
              {post.postType} ITEM
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f1f3] px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-700">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  post.status === "OPEN" ? "bg-emerald-600" : "bg-neutral-500"
                }`}
              />
              {statusLabel(post.status)}
            </span>
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-tertiary">
              {post.category}
            </span>
          </div>
          <h2 className="text-base font-semibold leading-snug tracking-tight text-primary sm:text-lg">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">{post.description}</p>
        </div>

        <div className="grid gap-2 text-xs text-tertiary sm:grid-cols-2 lg:grid-cols-1">
          <p className="flex items-start gap-2">
            <CalendarDays aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
            <span>
              {post.postType === "LOST" ? "Last seen" : "Found"}: {formatDate(post.date)}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
            <span>{post.location}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-neutral/50 pt-3 sm:border-0 sm:pt-0 sm:pl-2">
        <button
          type="button"
          onClick={() => onView(post)}
          className="cursor-pointer rounded-lg bg-[#f4f5f7] px-3.5 py-2 text-xs font-medium text-primary transition hover:bg-neutral"
        >
          View Details
        </button>
        {post.status === "OPEN" && (
          <button
            type="button"
            onClick={() => onEdit(post)}
            aria-label={`Edit ${post.title}`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#f4f5f7] px-3.5 py-2 text-xs font-medium text-primary transition hover:bg-neutral"
          >
            <Pencil aria-hidden="true" size={13} />
            Edit
          </button>
        )}
        {post.postType === "LOST" && post.status === "OPEN" && (
          <button
            type="button"
            onClick={() => onRecover(post)}
            aria-label={`Mark ${post.title} as recovered`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-white transition hover:bg-secondary"
          >
            <Check aria-hidden="true" size={14} />
            Recovered
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(post)}
          aria-label={`Delete ${post.title}`}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
        >
          <Trash2 aria-hidden="true" size={13} />
          Delete
        </button>
      </div>
    </article>
  );
}

function MyPostDetailsDialog({
  post,
  onClose,
  onEdit,
}: {
  post: MyPost;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-post-details-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative aspect-[16/9] bg-[#ececef]">
          {post.photoUrl ? (
            <Image
              src={post.photoUrl}
              alt={post.title}
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
            className="absolute right-3 top-3 cursor-pointer rounded-full bg-white/90 p-2 text-primary shadow-sm transition hover:bg-white"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              {post.postType} ITEM
            </span>
            <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-tertiary">
              {statusLabel(post.status)}
            </span>
            <span className="font-mono text-[11px] text-tertiary">
              ID: {post.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h2 id="my-post-details-title" className="mt-3 text-2xl font-semibold tracking-tight">
            {post.title}
          </h2>
          <p className="mt-2 text-sm text-tertiary">{post.category}</p>
          <div className="mt-5 grid gap-3 text-sm text-tertiary sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              {post.location}
            </p>
            <p className="flex items-start gap-2">
              <CalendarDays aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              {post.postType === "LOST" ? "Last seen" : "Found"} {formatDate(post.date)}
            </p>
          </div>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
            {post.description}
          </p>
          <div className="mt-6 flex justify-end border-t border-neutral/60 pt-5">
            {post.status === "OPEN" && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                <Pencil aria-hidden="true" size={15} />
                Edit Post
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function EditMyPostDialog({
  post,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  post: MyPost;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: MyPostUpdateValues, image?: File) => Promise<void>;
}) {
  const [image, setImage] = useState<File>();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const categories = LOST_ITEM_CATEGORIES.includes(
    post.category as (typeof LOST_ITEM_CATEGORIES)[number],
  )
    ? LOST_ITEM_CATEGORIES
    : [post.category, ...LOST_ITEM_CATEGORIES];

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
    const dateValue = String(values.get("date") ?? "");
    if (!dateValue) return;

    await onSubmit(
      {
        title: String(values.get("title") ?? "").trim(),
        category: String(values.get("category") ?? "").trim(),
        description: String(values.get("description") ?? "").trim(),
        location: String(values.get("location") ?? "").trim(),
        date: new Date(`${dateValue}T00:00:00.000Z`).toISOString(),
        ...(removeImage ? { photoUrl: null } : {}),
      },
      image,
    );
  };

  const handleImageChange = (file?: File) => {
    setImageError(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setImage(undefined);

    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
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
        aria-labelledby="edit-my-post-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary">
              Edit {post.postType.toLowerCase()} report
            </p>
            <h2 id="edit-my-post-title" className="mt-1 text-2xl font-semibold tracking-tight">
              Edit Post
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close edit form"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer rounded-full p-2 text-tertiary transition hover:bg-[#f4f5f7] hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block space-y-1.5 text-xs font-semibold text-primary">
            Item title
            <input
              name="title"
              defaultValue={post.title}
              required
              maxLength={120}
              className="w-full rounded-lg border border-neutral/70 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold text-primary">
            Category
            <select
              name="category"
              defaultValue={post.category}
              required
              className="w-full rounded-lg border border-neutral/70 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-xs font-semibold text-primary">
            Description
            <textarea
              name="description"
              defaultValue={post.description}
              required
              rows={3}
              maxLength={1000}
              className="w-full resize-y rounded-lg border border-neutral/70 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-xs font-semibold text-primary">
              {post.postType === "LOST" ? "Last seen location" : "Found location"}
              <input
                name="location"
                defaultValue={post.location}
                required
                maxLength={200}
                className="w-full rounded-lg border border-neutral/70 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-semibold text-primary">
              {post.postType === "LOST" ? "Last seen date" : "Found date"}
              <input
                type="date"
                name="date"
                defaultValue={getDateInputValue(post.date)}
                max={localDateValue()}
                required
                className="w-full rounded-lg border border-neutral/70 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary"
              />
            </label>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-primary">Photo</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral/70 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-[#f4f5f7]">
                <UploadCloud aria-hidden="true" size={15} />
                Choose image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => handleImageChange(event.currentTarget.files?.[0])}
                />
              </label>
              {(post.photoUrl || imagePreviewUrl) && !removeImage && (
                <button
                  type="button"
                  onClick={() => {
                    setRemoveImage(true);
                    handleImageChange(undefined);
                  }}
                  className="cursor-pointer text-xs font-medium text-red-700 hover:underline"
                >
                  Remove photo
                </button>
              )}
              {removeImage && (
                <button
                  type="button"
                  onClick={() => setRemoveImage(false)}
                  className="cursor-pointer text-xs font-medium text-primary hover:underline"
                >
                  Keep current photo
                </button>
              )}
            </div>
            {imagePreviewUrl && !removeImage && (
              <div className="relative mt-3 h-24 w-24 overflow-hidden rounded-lg bg-[#f4f5f7]">
                <Image src={imagePreviewUrl} alt="New item photo preview" fill className="object-cover" />
              </div>
            )}
            {imageError && <p role="alert" className="mt-2 text-xs text-red-700">{imageError}</p>}
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 border-t border-neutral/60 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="cursor-pointer rounded-lg border border-neutral/70 px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-60"
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
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ConfirmDeleteDialog({
  post,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: {
  post: MyPost;
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
        aria-labelledby="delete-my-post-title"
        aria-describedby="delete-my-post-description"
        className="w-full max-w-md rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
            <Trash2 aria-hidden="true" size={20} />
          </span>
          <div>
            <h2 id="delete-my-post-title" className="text-lg font-semibold text-primary">
              Delete this post?
            </h2>
            <p id="delete-my-post-description" className="mt-2 text-sm leading-6 text-tertiary">
              This will permanently delete <span className="font-semibold text-primary">{post.title}</span>.
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
                Delete post
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export function MyPostsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const myPostsQuery = useMyPosts();
  const updateLostItem = useUpdateLostItem();
  const updateFoundItem = useUpdateFoundItem();
  const deleteLostItem = useDeleteLostItem();
  const deleteFoundItem = useDeleteFoundItem();
  const recoverLostItem = useRecoverLostItem();
  const [filter, setFilter] = useState<PostFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<MyPost | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/auth/login");
  }, [isAuthLoading, isAuthenticated, router]);

  const posts = myPostsQuery.data?.items ?? EMPTY_POSTS;
  const counts = useMemo(
    () => ({
      ALL: posts.length,
      LOST: posts.filter((post) => post.postType === "LOST").length,
      FOUND: posts.filter((post) => post.postType === "FOUND").length,
    }),
    [posts],
  );
  const filteredPosts = useMemo(() => {
    const searchTerm = keyword.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const matchesType = filter === "ALL" || post.postType === filter;
      const matchesSearch =
        !searchTerm ||
        [post.title, post.description, post.category, post.location, post.id]
          .some((value) => value.toLocaleLowerCase().includes(searchTerm));
      return matchesType && matchesSearch;
    });
  }, [filter, keyword, posts]);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagePosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openDialog = (post: MyPost, mode: DialogMode) => {
    setSelectedPost(post);
    setDialogMode(mode);
    setEditError(null);
    setDeleteError(null);
    setActionError(null);
  };

  const closeDialog = () => {
    setSelectedPost(null);
    setDialogMode(null);
    setEditError(null);
    setDeleteError(null);
    setActionError(null);
  };

  const handleUpdate = async (values: MyPostUpdateValues, image?: File) => {
    const post = selectedPost;
    if (!post || post.userId !== user?.id) return;
    setEditError(null);

    try {
      const date = values.date;
      if (post.postType === "LOST") {
        await updateLostItem.mutateAsync({
          itemId: post.id,
          payload: {
            title: values.title,
            description: values.description,
            category: values.category,
            lastSeenLocation: values.location,
            lastSeenDate: date,
            ...(values.photoUrl !== undefined ? { photoUrl: values.photoUrl } : {}),
          },
          image,
        });
      } else {
        await updateFoundItem.mutateAsync({
          itemId: post.id,
          payload: {
            title: values.title,
            description: values.description,
            category: values.category,
            foundLocation: values.location,
            foundDate: date,
            ...(values.photoUrl !== undefined ? { photoUrl: values.photoUrl } : {}),
          },
          image,
        });
      }
      showToast.success(`${post.postType === "LOST" ? "Lost" : "Found"} item updated successfully.`);
      closeDialog();
    } catch (error) {
      setEditError(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    const post = selectedPost;
    if (!post || post.userId !== user?.id) return;
    setDeleteError(null);

    try {
      if (post.postType === "LOST") {
        await deleteLostItem.mutateAsync(post.id);
      } else {
        await deleteFoundItem.mutateAsync(post.id);
      }
      showToast.success(`${post.postType === "LOST" ? "Lost" : "Found"} item deleted successfully.`);
      closeDialog();
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    }
  };

  const handleRecover = async (post: MyPost) => {
    if (post.postType !== "LOST" || post.userId !== user?.id) return;
    setActionError(null);
    try {
      await recoverLostItem.mutateAsync(post.id);
      showToast.success("Lost item marked as recovered.");
      closeDialog();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  if (isAuthLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle aria-label="Loading your account" className="animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated && !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-tertiary">
              <span className="rounded bg-[#f1f1f3] px-2 py-1 font-semibold tracking-wide">
                MY ACCOUNT // POSTS
              </span>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>Owner dashboard</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">
              My Posts
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-tertiary sm:text-base">
              Manage lost items you have reported and found items you have turned in. Update your
              reports, track their status, and close the loop when an item is recovered.
            </p>
          </section>

          <section
            aria-label="Filter your posts"
            className="flex flex-col gap-4 rounded-2xl border border-neutral/60 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="inline-flex w-full items-center rounded-xl bg-[#f4f5f7] p-1 sm:w-auto">
              {(["ALL", "LOST", "FOUND"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => {
                    setFilter(value);
                    setPage(1);
                  }}
                  className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-xs font-medium transition sm:flex-none ${
                    filter === value
                      ? "bg-primary text-white shadow-xs"
                      : "text-neutral-600 hover:text-primary"
                  }`}
                >
                  {value === "ALL" ? "All Posts" : value === "LOST" ? "Lost Items" : "Found Items"}
                  <span className={`ml-1.5 ${filter === value ? "text-white/70" : "text-tertiary"}`}>
                    {counts[value]}
                  </span>
                </button>
              ))}
            </div>
            <label className="flex min-w-0 items-center gap-3 rounded-lg bg-[#f4f5f7] px-4 py-3 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/25 sm:w-[min(100%,24rem)]">
              <Search aria-hidden="true" size={16} className="shrink-0 text-tertiary" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, location, or ID..."
                aria-label="Search your posts"
                className="min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-neutral-500"
              />
              {keyword && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setKeyword("")}
                  className="cursor-pointer rounded p-1 text-tertiary hover:bg-neutral/60 hover:text-primary"
                >
                  <X aria-hidden="true" size={14} />
                </button>
              )}
            </label>
          </section>

          <section aria-label="Your posts" className="space-y-4">
            {myPostsQuery.isLoading ? (
              <div className="flex min-h-56 items-center justify-center rounded-2xl border border-neutral/60 bg-white">
                <div className="flex items-center gap-3 text-sm text-tertiary">
                  <LoaderCircle aria-hidden="true" size={19} className="animate-spin text-primary" />
                  Loading your posts…
                </div>
              </div>
            ) : myPostsQuery.isError ? (
              <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <p role="alert" className="text-sm text-red-700">
                  {getErrorMessage(myPostsQuery.error)}
                </p>
                <button
                  type="button"
                  onClick={() => void myPostsQuery.refetch()}
                  className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
                >
                  Try again
                </button>
              </div>
            ) : pagePosts.length === 0 ? (
              <div className="rounded-2xl border border-neutral/60 bg-white px-6 py-14 text-center shadow-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f1f3] text-tertiary">
                  <ShieldCheck aria-hidden="true" size={23} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-primary">
                  {posts.length === 0 ? "You haven't posted any items yet" : "No posts match your search"}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-tertiary">
                  {posts.length === 0
                    ? "Your lost and found item reports will appear here so you can keep track of them."
                    : "Try another search term or choose a different post type."}
                </p>
              </div>
            ) : (
              pagePosts.map((post) => (
                <MyPostCard
                  key={`${post.postType}-${post.id}`}
                  post={post}
                  onView={(value) => openDialog(value, "details")}
                  onEdit={(value) => openDialog(value, "edit")}
                  onDelete={(value) => openDialog(value, "delete")}
                  onRecover={(value) => void handleRecover(value)}
                />
              ))
            )}
          </section>

          {!myPostsQuery.isLoading && !myPostsQuery.isError && filteredPosts.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-neutral/60 bg-white px-5 py-4 text-xs text-tertiary shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{" "}
                <span className="font-semibold text-primary">{(currentPage - 1) * PAGE_SIZE + 1}</span>
                {"–"}
                <span className="font-semibold text-primary">
                  {Math.min(currentPage * PAGE_SIZE, filteredPosts.length)}
                </span>{" "}
                of <span className="font-semibold text-primary">{filteredPosts.length}</span> posts
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral/70 px-3 py-2 font-medium text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft aria-hidden="true" size={14} />
                  Previous
                </button>
                <span className="min-w-16 text-center font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral/70 px-3 py-2 font-medium text-primary transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight aria-hidden="true" size={14} />
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </p>
          )}
        </div>
      </main>
      <Footer />

      {selectedPost && dialogMode === "details" && (
        <MyPostDetailsDialog
          post={selectedPost}
          onClose={closeDialog}
          onEdit={() => {
            setEditError(null);
            setDialogMode("edit");
          }}
        />
      )}
      {selectedPost && dialogMode === "edit" && (
        <EditMyPostDialog
          post={selectedPost}
          isSaving={updateLostItem.isPending || updateFoundItem.isPending}
          error={editError}
          onClose={closeDialog}
          onSubmit={handleUpdate}
        />
      )}
      {selectedPost && dialogMode === "delete" && (
        <ConfirmDeleteDialog
          post={selectedPost}
          isDeleting={deleteLostItem.isPending || deleteFoundItem.isPending}
          error={deleteError}
          onCancel={closeDialog}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}
