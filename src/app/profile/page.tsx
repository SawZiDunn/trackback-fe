"use client";

import {
  Check,
  IdCard,
  Lock,
  LogOut,
  SquarePen,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  // Observer pattern: consumes user state, authentication status, updateProfile and logout actions
  const { user, isAuthenticated, updateProfile, logout, isLoading } = useAuth();

  // Edit profile dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect to login ONLY if not loading and user is definitely unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = user?.name || "Alex Rivera";
  const displayEmail = user?.email || "alex.rivera@university.edu";
  const displayUid = user?.id ? user.id.slice(0, 8) : "984021";
  const studentId = `STU-${displayUid.toUpperCase()}`;
  const avatarUrl =
    user?.profileUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({ name: editedName });
      setIsEditOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />

      {/* Main Profile Content */}
      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
          {/* Top Profile Card */}
          <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8 md:flex-row md:items-center">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Avatar with Verified Badge */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 sm:h-24 sm:w-24">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
                <span className="absolute right-1.5 bottom-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                  <Check size={10} strokeWidth={3} />
                </span>
              </div>

              {/* User Bio Information */}
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                    {displayName}
                  </h1>
                  <span className="rounded border border-neutral/70 bg-[#f4f5f7] px-2 py-0.5 text-[11px] font-mono font-medium text-tertiary">
                    UID #{displayUid}
                  </span>
                </div>
                <p className="mt-1 text-xs text-tertiary sm:text-sm">
                  Senior Undergraduate • Faculty of Computer Science & Engineering
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={() => {
                setEditedName(displayName);
                setIsEditOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral/80 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-2xs transition hover:bg-[#f4f5f7] cursor-pointer"
            >
              <SquarePen size={14} className="text-neutral-600" />
              Edit Profile
            </button>
          </section>

          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Contact & Institutional Identification */}
            <section className="space-y-4 rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs lg:col-span-7 xl:col-span-8">
              <div className="flex items-center gap-2.5">
                <IdCard size={18} className="text-neutral-700 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-primary">
                    Contact & Institutional Identification
                  </h2>
                  <p className="text-xs text-tertiary">
                    Verified records issued via campus registrar authentication.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {/* Legal Registrar Name */}
                <div className="rounded-xl bg-[#f4f5f7] p-4">
                  <span className="block text-[10px] font-semibold tracking-wider text-tertiary uppercase">
                    Legal Registrar Name
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-primary">
                    {displayName}
                  </span>
                </div>

                {/* University Email */}
                <div className="flex items-center justify-between rounded-xl bg-[#f4f5f7] p-4">
                  <div>
                    <span className="block text-[10px] font-semibold tracking-wider text-tertiary uppercase">
                      University Email (Domain Synced)
                    </span>
                    <span className="mt-0.5 block text-sm font-mono font-semibold text-primary">
                      {displayEmail}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                    <Check size={10} strokeWidth={3} />
                    Verified
                  </span>
                </div>

                {/* User ID */}
                <div className="flex items-center justify-between rounded-xl bg-[#f4f5f7] p-4">
                  <div>
                    <span className="block text-[10px] font-semibold tracking-wider text-tertiary uppercase">
                      User ID
                    </span>
                    <span className="mt-0.5 block text-sm font-mono font-semibold text-primary">
                      {studentId}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-tertiary">
                    <Lock size={12} />
                    Locked by Registrar
                  </span>
                </div>
              </div>
            </section>

            {/* Right Column: Session & Vault Access */}
            <section className="flex flex-col justify-between rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs lg:col-span-5 xl:col-span-4">
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-primary">Session & Vault Access</h2>

                {/* Logout Action Button */}
                <button
                  type="button"
                  onClick={() => logout()}
                  disabled={isLoading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#f4f5f7] py-3 px-4 text-xs font-semibold text-primary transition hover:bg-neutral-200/70"
                >
                  <LogOut size={14} className="text-neutral-700" />
                  {isLoading ? "Logging out..." : "Log Out of TrackBack"}
                </button>
              </div>

              {/* Encryption & Security Note */}
              <div className="mt-6 rounded-xl bg-[#f4f5f7] p-3.5 text-center text-[10.5px] leading-relaxed text-tertiary">
                TrackBack Institutional Recovery uses mutual TLS cryptography. Session tokens revoke
                automatically after 12 hours of inactivity.
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral/60 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral/40 pb-3">
              <h3 className="text-base font-bold text-primary">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-md p-1 text-tertiary hover:bg-neutral-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-tertiary">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="mt-1 h-10 w-full rounded-lg border border-neutral/80 bg-[#f4f5f7] px-3 text-sm text-primary outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-tertiary">
                  Campus Email (Locked)
                </label>
                <input
                  type="text"
                  value={displayEmail}
                  disabled
                  className="mt-1 h-10 w-full rounded-lg border border-neutral/60 bg-neutral-100 px-3 text-sm text-neutral-400 outline-none cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isUpdating}
                  className="rounded-lg border border-neutral/80 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary cursor-pointer disabled:opacity-70"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
