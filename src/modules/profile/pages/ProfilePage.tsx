"use client";

import { Check, IdCard, Lock, LogOut, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { EditProfileModal } from "../components/EditProfileModal";
import { useProfile } from "../hooks/useProfile";
import type { UpdateProfilePayload } from "../types/profile";

export function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, logout, isLoading: isAuthLoading } = useAuth();
  const { profile, isLoading: isProfileLoading, updateProfile } = useProfile(authUser?.id);

  const [isEditOpen, setIsEditOpen] = useState(false);

  // Active user data from profile query or auth state
  const user = profile ?? authUser;
  const isLoading = isAuthLoading || (isProfileLoading && !user);

  // Redirect to login only if auth resolved and user is definitely unauthenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !user) {
      router.replace("/auth/login");
    }
  }, [isAuthLoading, isAuthenticated, user, router]);

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
  const displayUid = user?.id ? user.id.slice(0, 8) : "984021";
  const studentId = `STU-${displayUid.toUpperCase()}`;

  const handleSaveProfile = async (payload: UpdateProfilePayload) => {
    await updateProfile(payload);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
          {/* Top Profile Card */}
          <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-neutral/60 bg-white p-6 shadow-xs sm:p-8 md:flex-row md:items-center">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Avatar with Verified Badge */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 sm:h-24 sm:w-24">
                <Image
                  src={
                    user?.profileUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  }
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
                  {user?.about}
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
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
                      {user?.email || "alex.rivera@university.edu"}
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
                  disabled={isAuthLoading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#f4f5f7] py-3 px-4 text-xs font-semibold text-primary transition hover:bg-neutral-200/70"
                >
                  <LogOut size={14} className="text-neutral-700" />
                  {isAuthLoading ? "Logging out..." : "Log Out of TrackBack"}
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
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={user}
          onSave={handleSaveProfile}
        />
      )}

      <Footer />
    </div>
  );
}

export default ProfilePage;
