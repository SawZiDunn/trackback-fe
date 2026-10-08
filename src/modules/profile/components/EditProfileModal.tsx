"use client";

import axios from "axios";
import { Check, IdCard, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { showToast } from "nextjs-toast-notify";
import { useUpdateProfile } from "../api/profileApi";
import type { UpdateProfilePayload } from "../types/profile";
import type { User } from "@/modules/auth/types/auth";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave?: (payload: UpdateProfilePayload) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [about, setAbout] = useState(user?.about || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultAvatar =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast.warning("File size exceeds 5MB limit. Please choose a smaller image.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleRemovePhoto();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: UpdateProfilePayload = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim() || undefined,
      about: about,
      profileFile: selectedFile,
    };

    try {
      if (onSave) {
        await onSave(payload);
      } else {
        const result = await updateProfileMutation.mutateAsync(payload);
        showToast.success(result.message || "Update Successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
      }
      handleClose();
    } catch (err) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : "Failed to update profile. Please try again.";
      setError(message ?? "Failed to update profile. Please try again.");
    }
  };

  const activeAvatar = previewUrl || user?.profileUrl || defaultAvatar;
  const isSubmitting = updateProfileMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral/60 bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg border border-neutral/60 bg-[#f4f5f7] p-2 text-primary">
              <IdCard size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">Edit Profile</h2>
              <p className="mt-0.5 text-xs text-tertiary">
                Update your public display details and contact credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-tertiary transition hover:bg-neutral/50 hover:text-primary cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Profile Photo Section */}
          <div className="flex items-center gap-4 rounded-xl bg-[#f4f5f7] p-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral/60 bg-neutral-200">
              <Image
                src={activeAvatar}
                alt="Profile Preview"
                width={56}
                height={56}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1">
              <h3 className="text-xs font-semibold text-primary">Profile Photo</h3>
              <p className="mt-0.5 text-[11px] text-tertiary">
                JPG, PNG or WEBP. Maximum file size 5MB.
              </p>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral/80 bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-2xs transition hover:bg-neutral-50 cursor-pointer"
                >
                  <Upload size={12} className="text-neutral-600" />
                  Change Photo
                </button>

                {(selectedFile || user?.profileUrl) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-medium text-tertiary transition hover:text-primary cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tertiary">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Alex Rivera"
              className="h-10 w-full rounded-xl bg-[#f4f5f7] px-4 text-sm font-medium text-primary outline-none transition placeholder:text-neutral-400 focus:bg-white focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tertiary">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="@gmail.com"
              className="h-10 w-full rounded-xl bg-[#f4f5f7] px-4 text-sm text-primary outline-none transition placeholder:text-neutral-400 focus:bg-white focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tertiary">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="h-10 w-full rounded-xl bg-[#f4f5f7] px-4 text-sm text-primary outline-none transition placeholder:text-neutral-400 focus:bg-white focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tertiary">
              About
            </label>
            <textarea
              value={about}
              rows={4}
              onChange={(e) => setAbout(e.target.value)}
              className="h-24 w-full rounded-xl bg-[#f4f5f7] p-3 text-sm font-medium text-primary outline-none transition placeholder:text-neutral-400 focus:bg-white focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-neutral/80 bg-white px-4 py-2 text-xs font-semibold text-primary transition hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-secondary cursor-pointer disabled:opacity-70"
            >
              <Check size={13} strokeWidth={2.5} />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
