"use client";

import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Lost Items", href: "/lost-items" },
  { label: "Found Items", href: "/found-items" },
  { label: "My Posts", href: "/my-posts" },
  { label: "My Claims", href: "/my-claims" },
  { label: "Profile", href: "/profile" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user?.name || "Alex Rivera";
  const avatarUrl =
    user?.profileUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral/60 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Search bar */}
        <div className="flex items-center gap-5 lg:gap-8">
          <Link href="/" className="text-base font-bold tracking-tight text-primary">
            TrackBack
          </Link>

          <div className="relative hidden items-center sm:flex">
            <div className="relative flex w-60 items-center rounded-lg bg-[#f4f5f7] px-3 py-1.5 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/20 md:w-72">
              <Search size={14} className="text-tertiary shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost or found items..."
                className="ml-2 w-full bg-transparent text-xs text-primary placeholder:text-neutral-400 outline-none"
              />
              <span className="shrink-0 rounded border border-neutral-300/70 bg-white px-1.5 py-0.5 text-[10px] font-mono font-medium text-tertiary shadow-2xs">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Pill Group */}
        <nav className="hidden lg:flex">
          <div className="flex items-center rounded-full bg-[#f4f5f7] p-1 text-xs font-medium text-neutral-600">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={isActive ? { color: "#ffffff" } : undefined}
                  className={`rounded-full px-3.5 py-1.5 transition-all ${
                    isActive
                      ? "bg-primary font-semibold text-white! shadow-xs"
                      : "text-neutral-600 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right: Notifications & User profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-neutral-700 transition hover:bg-[#f4f5f7]"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-white" />
          </button>

          {isAuthenticated || user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full p-1 transition hover:bg-[#f4f5f7] sm:pr-3"
            >
              <div className="relative h-7 w-7 overflow-hidden rounded-full border border-neutral-300 bg-neutral-200">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <span className="hidden text-xs font-medium text-primary sm:inline-block">
                {displayName}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white transition hover:bg-secondary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
