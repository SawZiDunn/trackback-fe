"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthPage } from "@/modules/auth/components/AuthPage";
import { Footer } from "@/common/components/Footer";
import { Header } from "@/common/components/Header";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  // Observer pattern: subscribe to auth state to determine view
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (!isAuthenticated && !user) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      {/* Sticky Navbar Header */}
      <Header />

      <main className="flex-1 text-primary">
        <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
              Your campus, connected
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-7xl">
              Lost something? Let&apos;s bring it back.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-tertiary">
              Trackback makes it easier to report found belongings, search recent posts, and return
              what matters to the people who are looking for it.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/items"
                className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Explore found items
              </Link>
              <Link
                href="/profile"
                className="rounded-full border border-neutral/80 bg-white px-6 py-3.5 text-sm font-semibold text-primary transition hover:border-primary"
              >
                View profile
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-neutral/60 p-7 sm:p-10 shadow-xs">
            <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full border-[26px] border-[#f4f5f7]" />
            <div className="relative flex min-h-[320px] flex-col justify-between rounded-2xl bg-secondary p-7 text-white shadow-2xl shadow-primary/15 sm:min-h-[360px] sm:p-9">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-neutral">
                  Recently found
                </span>
                <span className="text-2xl text-neutral">✦</span>
              </div>
              <div>
                <p className="text-sm text-neutral">Library, North Campus</p>
                <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em]">
                  Black canvas backpack
                </h2>
                <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-5 text-sm">
                  <span className="text-neutral">Posted today</span>
                  <span className="font-medium text-white">View details →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral/60 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
            <div>
              <p className="text-3xl font-semibold tracking-[-0.05em]">01</p>
              <p className="mt-3 text-sm leading-6 text-tertiary">
                Search items found around campus.
              </p>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-[-0.05em]">02</p>
              <p className="mt-3 text-sm leading-6 text-tertiary">
                Share a clear description when you find something.
              </p>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-[-0.05em]">03</p>
              <p className="mt-3 text-sm leading-6 text-tertiary">
                Claim it securely and get it home.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
