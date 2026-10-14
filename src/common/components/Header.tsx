"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { NotificationBell } from "@/modules/notifications/components/NotificationBell";
import { useSearchItems } from "@/modules/items/api/itemApi";
import { SearchDropdown } from "@/modules/items/components/SearchDropdown";

const NAV_ITEMS = [
  { label: "Lost Items", href: "/lost-items" },
  { label: "Found Items", href: "/found-items" },
  { label: "My Posts", href: "/my-posts" },
  { label: "Claims", href: "/claims" },
  { label: "Profile", href: "/profile" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useSearchItems({ query: searchQuery });

  const displayName = user?.name || "Alex Rivera";
  const avatarUrl =
    user?.profileUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isDropdownOpen && searchQuery.trim().length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral/60 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Search bar */}
        <div className="flex items-center gap-5 lg:gap-8">
          <Link href="/" className="text-base font-bold tracking-tight text-primary">
            TrackBack
          </Link>

          <div ref={searchContainerRef} className="relative hidden items-center sm:flex">
            <div className="relative flex w-60 items-center rounded-lg bg-[#f4f5f7] px-3 py-1.5 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/20 md:w-72">
              <Search size={14} className="text-tertiary shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search lost or found items..."
                className="ml-2 w-full bg-transparent text-xs text-primary placeholder:text-neutral-400 outline-none"
              />
              <span className="shrink-0 rounded border border-neutral-300/70 bg-white px-1.5 py-0.5 text-[10px] font-mono font-medium text-tertiary shadow-2xs">
                ⌘K
              </span>
            </div>
            {showDropdown && (
              <SearchDropdown
                items={searchResults?.items ?? []}
                total={searchResults?.total ?? 0}
                query={searchQuery}
                onClose={() => setIsDropdownOpen(false)}
              />
            )}
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
          <NotificationBell />

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
