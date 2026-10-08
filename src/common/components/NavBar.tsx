"use client";

import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { Button } from "./Button";

export function UserNav() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-primary">
          Hi, <span className="font-semibold">{user.name}</span>
        </span>
        <Button
          type="button"
          onClick={() => logout()}
          disabled={isLoading}
          className="rounded-full bg-neutral px-4 py-2 text-xs font-semibold text-primary transition hover:bg-neutral/80"
        >
          {isLoading ? "Logging out..." : "Log out"}
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary"
    >
      Sign in
    </Link>
  );
}
