"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Package,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { LOST_ITEM_CATEGORIES } from "@/modules/lost-items/constants/categories";
import { useCreateFoundItem } from "../api/foundItemApi";
import type { CreateFoundItemPayload } from "../types/foundItem";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function localDateValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function FormSection({
  icon,
  title,
  eyebrow,
  children,
}: {
  icon: ReactNode;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-primary sm:text-lg">
          {icon}
          {title}
        </h2>
        {eyebrow && (
          <span className="font-mono text-[10px] uppercase tracking-wide text-tertiary">
            {eyebrow}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-medium text-primary">
      <span>
        {label} <span aria-hidden="true" className="text-red-600">*</span>
      </span>
      {children}
      {helper && (
        <span className="block text-[11px] font-normal leading-5 text-tertiary">{helper}</span>
      )}
    </label>
  );
}

const inputClassName =
  "w-full rounded-lg border border-neutral/70 bg-[#f4f5f7] px-3.5 py-3 text-sm font-normal text-primary outline-none transition placeholder:text-neutral-500 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/15";

export function ReportFoundItemPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const createFoundItem = useCreateFoundItem();
  const [image, setImage] = useState<File>();
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const values = new FormData(event.currentTarget);
    const foundDate = String(values.get("date") ?? "");
    const payload: CreateFoundItemPayload = {
      title: String(values.get("title") ?? "").trim(),
      category: String(values.get("category") ?? "").trim(),
      description: String(values.get("description") ?? "").trim(),
      foundLocation: String(values.get("location") ?? "").trim(),
      foundDate: new Date(`${foundDate}T00:00:00.000Z`).toISOString(),
    };

    try {
      const result = await createFoundItem.mutateAsync({ payload, image });
      showToast.success(result.message || "Found item reported successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
      router.push("/found-items");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle aria-label="Loading account" size={24} className="animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-tertiary">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/found-items" className="transition hover:text-primary">Found Items</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-primary">Report Found Item</span>
          </nav>

          <header className="pb-1">
            <p className="mb-2 inline-flex items-center gap-2 rounded bg-[#e9e9eb] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Found item intake form // TrackBack
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl">
              Report Found Item
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-tertiary sm:text-base">
              Share where and when you found the item so its owner can identify it and get it back.
            </p>
          </header>

          <div className="grid gap-5 rounded-xl border border-neutral/60 bg-white p-4 shadow-xs sm:grid-cols-3 sm:p-5">
            {[
              { number: "1", label: "ITEM DETAILS", caption: "Identify the item" },
              { number: "2", label: "PHOTO", caption: "Add a visual reference" },
              { number: "3", label: "LOCATION & DATE", caption: "When and where it was found" },
            ].map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
                  {step.number}
                </span>
                <div>
                  <p className="text-[10px] font-semibold tracking-wide text-primary">{step.label}</p>
                  <p className="text-xs text-tertiary">{step.caption}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="grid items-start gap-5 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <FormSection
                icon={<Package aria-hidden="true" size={17} />}
                title="1. Item Identification"
                eyebrow="Required"
              >
                <div className="space-y-4">
                  <Field label="Item name / title">
                    <input
                      name="title"
                      required
                      maxLength={120}
                      placeholder="e.g. Matte black water bottle"
                      className={inputClassName}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category">
                      <span className="relative block">
                        <select
                          name="category"
                          required
                          defaultValue=""
                          className={`${inputClassName} appearance-none pr-9`}
                        >
                          <option value="" disabled>Select a category</option>
                          {LOST_ITEM_CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        <ChevronDown
                          aria-hidden="true"
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
                        />
                      </span>
                    </Field>
                    <Field label="Found date">
                      <span className="relative block">
                        <input
                          name="date"
                          type="date"
                          required
                          max={localDateValue()}
                          defaultValue={localDateValue()}
                          className={`${inputClassName} pr-10`}
                        />
                        <CalendarDays
                          aria-hidden="true"
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
                        />
                      </span>
                    </Field>
                  </div>
                  <Field
                    label="Campus facility / building"
                    helper="Be specific, such as a building, room, or nearby landmark."
                  >
                    <span className="relative block">
                      <MapPin
                        aria-hidden="true"
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
                      />
                      <input
                        name="location"
                        required
                        maxLength={160}
                        placeholder="Building, room, or nearby landmark"
                        className={`${inputClassName} pl-9`}
                      />
                    </span>
                  </Field>
                </div>
              </FormSection>

              <FormSection
                icon={<FileText aria-hidden="true" size={17} />}
                title="2. Description"
                eyebrow="Item details"
              >
                <Field
                  label="Public item description"
                  helper="Describe visible features that can help the owner identify it. Avoid including private or sensitive information."
                >
                  <textarea
                    name="description"
                    required
                    maxLength={1000}
                    rows={5}
                    placeholder="Describe the item's appearance, distinguishing features, or contents."
                    className={`${inputClassName} resize-y`}
                  />
                </Field>
              </FormSection>

              <FormSection
                icon={<ImagePlus aria-hidden="true" size={17} />}
                title="3. Visual Reference"
                eyebrow="Optional · JPG / PNG / WEBP · Up to 5 MB"
              >
                <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-[#f4f5f7] p-5 text-center transition hover:border-primary hover:bg-[#f1f1f3]">
                  {imagePreviewUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative h-32 w-48">
                        <Image
                          src={imagePreviewUrl}
                          alt="Selected found item preview"
                          fill
                          unoptimized
                          className="rounded-lg object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium text-primary">{image?.name}</span>
                      <span className="text-xs text-tertiary">Choose a different photo</span>
                    </div>
                  ) : (
                    <>
                      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5e5e7] text-primary">
                        <UploadCloud aria-hidden="true" size={22} />
                      </span>
                      <span className="text-sm font-semibold text-primary">Add a photo</span>
                      <span className="mt-1 max-w-sm text-xs leading-5 text-tertiary">
                        A clear photo can help the owner recognize their item. Adding a photo is optional.
                      </span>
                    </>
                  )}
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        setImage(undefined);
                        setImageError(null);
                        setImagePreviewUrl(null);
                        return;
                      }
                      if (!IMAGE_TYPES.includes(file.type)) {
                        event.target.value = "";
                        setImage(undefined);
                        setImageError("Choose a JPG, PNG, or WebP image.");
                        setImagePreviewUrl(null);
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        event.target.value = "";
                        setImage(undefined);
                        setImageError("The image must be 5 MB or smaller.");
                        setImagePreviewUrl(null);
                        return;
                      }
                      setImage(file);
                      setImageError(null);
                      setImagePreviewUrl(URL.createObjectURL(file));
                    }}
                  />
                </label>
                {imageError && <p role="alert" className="mt-2 text-xs text-red-600">{imageError}</p>}
                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(undefined);
                      setImageError(null);
                      setImagePreviewUrl(null);
                    }}
                    className="mt-3 cursor-pointer text-xs font-medium text-tertiary underline underline-offset-4 transition hover:text-primary"
                  >
                    Remove selected photo
                  </button>
                )}
              </FormSection>

              <section className="rounded-xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6">
                <div className="rounded-lg bg-[#f4f5f7] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck aria-hidden="true" size={19} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <h2 className="text-xs font-semibold text-primary">Campus recovery notice</h2>
                      <p className="mt-1 text-xs leading-5 text-tertiary">
                        Your report will be shared with the campus community. Keep the item safe
                        and do not include private account details or sensitive information.
                      </p>
                    </div>
                  </div>
                </div>
                {formError && (
                  <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </p>
                )}
                <div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/found-items"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral/70 px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#f4f5f7]"
                  >
                    <ArrowLeft aria-hidden="true" size={15} />
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={createFoundItem.isPending || Boolean(imageError)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createFoundItem.isPending ? (
                      <>
                        <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                        Submitting report…
                      </>
                    ) : (
                      <>
                        <Check aria-hidden="true" size={16} />
                        Submit Found Item Report
                      </>
                    )}
                  </button>
                </div>
              </section>
            </div>

            <aside className="space-y-5 lg:col-span-4">
              <section className="rounded-xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6">
                <h2 className="text-sm font-semibold tracking-tight text-primary">What happens next</h2>
                <ol className="mt-5 space-y-4">
                  {[
                    { title: "Report received", text: "Your found item is added to the directory." },
                    { title: "Owner searches", text: "The owner can browse listings and identify their belongings." },
                    { title: "Return coordination", text: "Follow up with the owner through the app's claim process." },
                  ].map((item, index) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white after:absolute after:left-1/2 after:top-6 after:h-5 after:w-px after:bg-neutral-300 last:after:hidden">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-primary">{item.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-tertiary">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-xl border border-neutral/60 bg-white p-5 shadow-xs sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Clock3 aria-hidden="true" size={16} />
                  Need immediate help?
                </h2>
                <p className="mt-3 text-xs leading-5 text-tertiary">
                  For urgent or sensitive items, contact your campus security or lost-and-found
                  office directly.
                </p>
                <Link
                  href="/found-items"
                  className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#f4f5f7] px-4 py-2.5 text-xs font-medium text-primary transition hover:bg-neutral"
                >
                  Return to found items
                </Link>
              </section>
            </aside>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
