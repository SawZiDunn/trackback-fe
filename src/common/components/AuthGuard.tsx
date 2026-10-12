"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";

const subscribeToNothing = () => () => {};

// Redirects anonymous visitors to the login page. Item browsing endpoints
// require auth on the backend (anonymous GET -> 401), so guarded pages only
// render their content once a user session is present.
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAppStore((state) => state.user);

  // False during SSR and the hydration render, true on the client afterwards,
  // so the persisted session is only read once React can act on it.
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (mounted && !user) {
      router.replace("/auth/login");
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle aria-hidden="true" size={32} className="animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
