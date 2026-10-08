import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-background text-primary">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 lg:px-10">
        <Link href="/" className="text-xl font-semibold tracking-[-0.04em]">
        TrackBack<span className="text-tertiary">.</span>
        </Link>
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/items" className="hidden px-4 py-2 text-tertiary sm:inline-block">
            Browse items
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full bg-primary px-5 py-2.5 text-white transition hover:bg-secondary"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
        <div>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em]           text-tertiary">
            Your campus, connected
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-7xl">
            Lost something? Let&apos;s bring it back.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-tertiary">
            Trackback makes it easier to report found belongings, search recent posts, and return what matters to the people who are looking for it.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/items"
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-secondary"
            >
              Explore found items
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full border border-neutral px-6 py-3.5 text-sm font-semibold text-primary transition hover:border-primary"
            >
              Report an item
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-neutral/50 p-7 sm:p-10">
          <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full border-[26px] border-neutral" />
          <div className="relative flex min-h-[320px] flex-col justify-between rounded-2xl bg-secondary p-7 text-white shadow-2xl shadow-primary/15 sm:min-h-[360px] sm:p-9">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-neutral">
                Recently found
              </span>
              <span className="text-2xl text-neutral">✦</span>
            </div>
            <div>
              <p className="text-sm text-neutral">Library, North Campus</p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em]">Black canvas backpack</h2>
              <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-5 text-sm">
                <span className="text-neutral">Posted today</span>
                <span className="font-medium text-white">View details →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral bg-neutral/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.05em]">01</p>
            <p className="mt-3 text-sm leading-6 text-tertiary">Search items found around campus.</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-[-0.05em]">02</p>
            <p className="mt-3 text-sm leading-6 text-tertiary">Share a clear description when you find something.</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-[-0.05em]">03</p>
            <p className="mt-3 text-sm leading-6 text-tertiary">Claim it securely and get it home.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
